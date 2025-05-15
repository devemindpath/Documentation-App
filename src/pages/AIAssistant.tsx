import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/aiAssistant.css';

const AIAssistant: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle message submission logic here
    console.log('Message submitted:', message);
    setMessage('');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black text-white p-4 overflow-hidden relative">
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

      {/* Main Content */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center z-10">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 text-transparent bg-clip-text animate-gradient">
          Hey there, I'm your AI Assistant
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-lg">
          Let's create an amazing rental listing together. What would you like to list?
        </p>

        {/* Chat Input Box */}
        <div className="w-full max-w-xl mx-auto mb-8">
          <div className="glassmorphism backdrop-blur-xl bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl">
            <form 
              onSubmit={handleSubmit}
              className="w-full"
            >
              <div className="relative w-full rounded-full border border-gray-600/50 shadow-lg transition-all duration-300 hover:shadow-xl focus-within:border-blue-400 focus-within:shadow-blue-400/20 group">
                {/* File Upload Button */}
                <button 
                  type="button"
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
                  disabled={!message.trim()}
                >
                  <svg 
                    className={`w-6 h-6 transform rotate-45 transition-transform duration-300 ${
                      message.trim() 
                        ? 'text-blue-400 hover:text-blue-300 hover:scale-110' 
                        : 'text-gray-500'
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
            </form>
            
            {/* Hint Text */}
            <p className="text-xs text-gray-400 mt-4 text-center">
              Press Enter to send • Upload images with the image icon
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AIAssistant;