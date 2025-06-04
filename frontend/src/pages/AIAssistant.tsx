import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import MarkdownPreview from "../components/MarkdownPreview";
import "../styles/aiAssistant.css";
import { blogPost } from "../components/markdownText";

// Define message type
interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  images?: string[]; // Array of image URLs or base64 strings
}

const AIAssistant: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey there, I'm your AI Assistant! Let's create an amazing rental listing together. What would you like to list?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [markdownContent, setMarkdownContent] = useState<string>(blogPost);
  const [activeView, setActiveView] = useState<"chat" | "preview">("chat");
  const eventSourceRef = useRef<EventSource | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        setIsHeaderVisible(chatContainerRef.current.scrollTop < 100);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Cleanup EventSource on component unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadedImageUrls(data.urls);
        setSelectedImages(data.urls);
      } else {
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Handle removing an image from the selected images
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Clear selected images
  const clearSelectedImages = () => {
    setSelectedImages([]);
    setUploadedImageUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && selectedImages.length === 0) return;

    const currentMessage = message; // Store current message before clearing
    const currentImages = [...uploadedImageUrls]; // Store current images

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: "user",
      timestamp: new Date(),
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    clearSelectedImages();

    // Start typing indicator
    setIsTyping(true);

    try {
      // Prepare query parameters
      const params = new URLSearchParams({
        message: currentMessage,
        images: JSON.stringify(currentImages),
        history: JSON.stringify(messages),
      });

      // Close any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create EventSource for streaming
      const eventSource = new EventSource(`http://localhost:3000/api/chat?${params.toString()}`);
      eventSourceRef.current = eventSource;
      let assistantResponse = "";

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        console.error('Connection timeout');
        eventSource.close();
        setIsTyping(false);
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "Sorry, I'm having trouble connecting to the server. Please try again.",
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      }, 30000); // 30 second timeout

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        clearTimeout(connectionTimeout);
      };

      eventSource.onmessage = (event) => {
        clearTimeout(connectionTimeout);
        
        if (event.data === "[DONE]") {
          eventSource.close();
          setIsTyping(false);
          return;
        }

        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            console.error('Chat error:', data.error);
            eventSource.close();
            setIsTyping(false);
            // Add error message
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text: `Error: ${data.error}`,
                sender: "assistant",
                timestamp: new Date(),
              },
            ]);
            return;
          }

          if (data.content) {
            assistantResponse += data.content;
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.sender === "assistant" && lastMessage.text !== `Error: ${data.error}`) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, text: assistantResponse },
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    text: assistantResponse,
                    sender: "assistant",
                    timestamp: new Date(),
                  },
                ];
              }
            });
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        clearTimeout(connectionTimeout);
        eventSource.close();
        setIsTyping(false);
        
        // Add more specific error handling
        if (eventSource.readyState === EventSource.CONNECTING) {
          console.error('Failed to connect to server');
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: "Unable to connect to the server. Please check if the backend is running on port 3000.",
              sender: "assistant",
              timestamp: new Date(),
            },
          ]);
        } else if (eventSource.readyState === EventSource.CLOSED) {
          console.error('Connection was closed');
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: "Connection was lost. Please try again.",
              sender: "assistant",
              timestamp: new Date(),
            },
          ]);
        }
      };
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "An unexpected error occurred. Please try again.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black via-purple-950 to-black text-white overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Back to Dashboard Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/dashboard"
          className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="relative">
            Back to Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </span>
        </Link>
      </div>

      {/* Header - Collapsible on scroll */}
      <div
        className={`sticky top-0 z-10 transition-all duration-300 ${
          isHeaderVisible ? "py-4 opacity-100" : "py-1 opacity-0"
        }`}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 text-transparent bg-clip-text animate-gradient">
          AI Assistant
        </h1>

        {/* View Toggle for Mobile */}
        <div className="md:hidden flex justify-center mt-2">
          <div className="bg-gray-800/50 backdrop-blur-md rounded-full p-1 flex">
            <button
              onClick={() => setActiveView("chat")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeView === "chat"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeView === "preview"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split View on Desktop, Toggle on Mobile */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat Section */}
        <div
          className={`${
            activeView === "chat" ? "flex" : "hidden"
          } md:flex flex-col flex-1 md:border-r border-white/10 overflow-hidden`}
        >
          {/* Chat Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.2) transparent",
            }}
          >
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } mb-4 animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-blue-600/70 rounded-tr-none"
                        : "glassmorphism backdrop-blur-md bg-white/10 border border-white/20 rounded-tl-none"
                    }`}
                  >
                    {msg.text && <p className="text-white">{msg.text}</p>}

                    {/* Display images if present */}
                    {msg.images && msg.images.length > 0 && (
                      <div
                        className={`mt-2 ${
                          msg.text ? "mt-3" : "mt-0"
                        } grid grid-cols-2 gap-2`}
                      >
                        {msg.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Attachment ${index + 1}`}
                              className="rounded-lg w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <a
                                href={img}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              >
                                <svg
                                  className="w-8 h-8 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-300 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="glassmorphism backdrop-blur-md bg-white/10 border border-white/20 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="typing-dot"></div>
                      <div className="typing-dot animation-delay-200"></div>
                      <div className="typing-dot animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input Box - Fixed at bottom */}
          <div className="w-full px-4 py-4 border-t border-white/10 bg-black/30 backdrop-blur-md z-10">
            <div className="max-w-3xl mx-auto">
              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 items-center">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Selected ${index + 1}`}
                        className="h-16 w-16 object-cover rounded-lg border border-gray-600/50"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {selectedImages.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSelectedImages}
                      className="text-xs text-red-400 hover:text-red-300 ml-2"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full">
                <div className="relative w-full rounded-full border border-gray-600/50 shadow-lg transition-all duration-300 hover:shadow-xl focus-within:border-blue-400 focus-within:shadow-blue-400/20 group">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />

                  {/* File Upload Button */}
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
                    aria-label="Upload file"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  {/* Input Field */}
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-transparent py-4 pl-14 pr-14 text-white placeholder-gray-400 focus:outline-none focus-ring rounded-full"
                    aria-label="Type a message"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300"
                    aria-label="Send message"
                    disabled={!message.trim() && selectedImages.length === 0}
                  >
                    <svg
                      className={`w-6 h-6 transform rotate-45 transition-transform duration-300 ${
                        message.trim() || selectedImages.length > 0
                          ? "text-blue-400 hover:text-blue-300 hover:scale-110"
                          : "text-gray-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>

                {/* Hint Text */}
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Press Enter to send • Upload multiple images with the image
                  icon
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Markdown Preview Section */}
        <div
          className={`${
            activeView === "preview" ? "flex" : "hidden"
          } md:flex flex-col flex-1 overflow-hidden bg-white dark:bg-gray-900 text-left`}
        >
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 md:p-6 text-left">
                  <MarkdownPreview
                    markdown={markdownContent}
                    className="text-left"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Actions */}
          <div className="w-full px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
              <button
                onClick={() => setActiveView("chat")}
                className="md:hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Back to Chat
              </button>

              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-300 flex items-center"
                  onClick={() => {
                    // Copy to clipboard functionality
                    navigator.clipboard.writeText(markdownContent);
                    // You could add a toast notification here
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy Markdown
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center"
                  onClick={() => {
                    // Download functionality
                    const blob = new Blob([markdownContent], {
                      type: "text/markdown",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "rental-listing.md";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AIAssistant;
