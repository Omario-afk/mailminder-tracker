
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, Permission } from "@/types";
import { LanguageCode } from "@/i18n";
import { AuthContextType } from "@/types/auth";
import { determinePermissions } from "@/utils/authUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          // Since profiles table doesn't exist yet, create a minimal user object
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: 'member' as UserRole,
            permissions: ['READ'] as Permission[],
            language: localStorage.getItem("i18nextLng") as LanguageCode || "en",
          });
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Since profiles table doesn't exist yet, create a minimal user object
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'member' as UserRole,
          permissions: ['READ'] as Permission[],
          language: localStorage.getItem("i18nextLng") as LanguageCode || "en",
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create an alias for login to match usage in LoginPage
  const signIn = login;

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            language: localStorage.getItem("i18nextLng") as LanguageCode || "en",
          }
        }
      });
      
      if (signUpError) throw signUpError;
      if (!authUser) throw new Error("No user returned from signup");

    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create an alias for logout to match usage in AppLayout
  const signOut = logout;

  const updateUserLanguage = async (language: LanguageCode) => {
    try {
      if (user) {
        // Store in local storage until we have a profiles table
        localStorage.setItem("i18nextLng", language);
        setUser({ ...user, language });
      }
    } catch (error) {
      console.error("Failed to update language preference:", error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (user) {
        // Update user state locally until we have a profiles table
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        signup, 
        logout, 
        signIn, 
        signOut, 
        updateUserLanguage, 
        updateUserProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
