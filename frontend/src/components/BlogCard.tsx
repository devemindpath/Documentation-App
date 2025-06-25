import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  author_name?: string;
  created_at: string;
  image_url?: string;
}

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link to={`/blog/${post.id}`} className="block">
      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {post.image_url && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={post.image_url}
              alt={post.title}
              className="object-cover w-full h-48"
            />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h2>
          
          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{post.author_name|| "Anonymous"}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
