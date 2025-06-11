import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const getAllBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("id, title,content,user_id,author_name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

export const getBlogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: blog, error } = await supabase
      .from("blogs")
      .select("id, title,content,user_id,author_name, created_at")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!blog) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};
