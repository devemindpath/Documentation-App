import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export type User = {
  id: string;
  email: string;
  role: "creator" | "reviewer";
  created_at: string;
};

export type Document = {
  id: string;
  title: string;
  content: string;
  status: "draft" | "pending_review" | "approved" | "rejected";
  visibility: "private" | "public";
  created_by: string;
  created_at: string;
  updated_at: string;
  reviewer_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
};
