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

export const getUserBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("id, title, content, user_id, author_name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    res.status(500).json({ error: "Failed to fetch user blogs" });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // First check if the blog exists and belongs to the user
    const { data: existingBlog, error: fetchError } = await supabase
      .from("blogs")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingBlog) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }

    if (existingBlog.user_id !== userId) {
      res.status(403).json({ error: "Not authorized to edit this blog" });
      return;
    }

    // Update the blog
    const { data: updatedBlog, error: updateError } = await supabase
      .from("blogs")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: "Failed to update blog" });
  }
};
