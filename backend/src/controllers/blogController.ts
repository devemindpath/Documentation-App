import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { BlogPost, CreateBlogPost } from '../types/blog';

export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('id, title, author, created_at, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('id, title, excerpt, author, created_at, image_url')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// export const createBlog = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { title, excerpt, content, image_url } = req.body as CreateBlogPost;
//     const user_id = req.user?.id;

//     if (!user_id) {
//       res.status(401).json({ error: 'Unauthorized' });
//       return;
//     }

//     const { data: blog, error } = await supabase
//       .from('blogs')
//       .insert([
//         {
//           title,
//           excerpt,
//           content,
//           image_url,
//           user_id,
//           author: req.user?.email || 'Anonymous',
//         },
//       ])
//       .select()
//       .single();

//     if (error) {
//       throw error;
//     }

//     res.status(201).json(blog);
//   } catch (error) {
//     console.error('Error creating blog:', error);
//     res.status(500).json({ error: 'Failed to create blog' });
//   }
// }; 