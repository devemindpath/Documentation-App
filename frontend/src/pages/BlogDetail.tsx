import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MarkdownPreview from "../components/MarkdownPreview";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  created_at: string;
  image_url?: string;
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/blogs/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }

        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-red-600 mb-4">
            Error: {error || "Blog post not found"}
          </div>
          <Link to="/blog" className="text-blue-600 hover:underline">
            &larr; Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/blog" className="text-blue-600 hover:underline mb-6 block">
        &larr; Back to all posts
      </Link>

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.image_url && (
          <div className="w-full">
            <img
              src={post.image_url}
              alt={post.title}
              className="object-cover w-full h-64"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center text-sm text-gray-500 mb-6">
            {post.author && <span className="mr-4">{post.author}</span>}
            <span>{formattedDate}</span>
          </div>

          <div className="prose max-w-none">
            <MarkdownPreview markdown={post.content} />
          </div>
        </div>
      </article>
    </div>
  );
}
