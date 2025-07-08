import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

interface Blog {
  id: string;
  title: string;
  content: string;
  user_id: string;
  author_name: string;
  created_at: string;
  language?: string;
  views?: number;
  reactions?: number;
  comments?: number;
}

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy stats for illustration
  const totalReactions = blogs.reduce((sum, b) => sum + (b.reactions || 0), 0);
  const totalComments = blogs.reduce((sum, b) => sum + (b.comments || 0), 0);
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "http://localhost:3000/api/blogs/user/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="flex h-full bg-gray-50 text-gray-900">

      {/* Main Content */}
      <div className="flex-1 pl-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Blogs</h1>
            <div className="flex space-x-3">
              <a
                href="/ai-assistant"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                AI Assistant
              </a>
              {/* <a
                href="/markdown-demo"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
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
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
                Create Doc
              </a> */}
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-6 mb-8">
            <div className="bg-white rounded-lg p-6 flex-1 text-center shadow">
              <div className="text-2xl font-bold">{totalReactions}</div>
              <div className="text-gray-500">Total post reactions</div>
            </div>
            <div className="bg-white rounded-lg p-6 flex-1 text-center shadow">
              <div className="text-2xl font-bold">{totalComments}</div>
              <div className="text-gray-500">Total post comments</div>
            </div>
            <div className="bg-white rounded-lg p-6 flex-1 text-center shadow">
              <div className="text-2xl font-bold">{totalViews}</div>
              <div className="text-gray-500">Total post views</div>
            </div>
          </div>

          {/* Blog List */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4">Posts</h3>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-8">
                Error: {error}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <h3 className="mt-2 text-xl font-medium">No blogs yet</h3>
                <p className="mt-1">Create your first blog to get started</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2">Title</th>
                    <th className="py-2">Published</th>
                    <th className="py-2">Language</th>
                    <th className="py-2">Views</th>
                    <th className="py-2">Reactions</th>
                    <th className="py-2">Comments</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-2">
                        <Link
                          to={`/blog/${blog.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {blog.title}
                        </Link>
                      </td>
                      <td className="py-2">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">{blog.language || "English"}</td>
                      <td className="py-2">{blog.views || 0}</td>
                      <td className="py-2">{blog.reactions || 0}</td>
                      <td className="py-2">{blog.comments || 0}</td>
                      <td className="py-2">
                        <button className="text-blue-600 hover:underline mr-2">
                          Manage
                        </button>
                        <Link
                          to={`/edit-blog/${blog.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
