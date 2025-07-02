import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async (email: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/user?email=${email}`);
      if (!res.ok) throw new Error("Failed to fetch user info");
      const data = await res.json();
      setUserInfo(data);
    } catch (err) {
      setUserInfo(null);
      console.error(err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('user',session?.user)
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata.role || "creator",
          created_at: session.user.created_at,
        });
        fetchUserInfo(session.user.email!);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata.role || "creator",
          created_at: session.user.created_at,
        });
        fetchUserInfo(session.user.email!);
      } else {
        setUser(null);
        setUserInfo(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "creator",
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUserRole = async (
    userId: string,
    role: "creator" | "reviewer"
  ) => {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });
    if (error) throw error;
  };

  return {
    user,
    userInfo,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserRole,
  };
}
