
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, Permission } from "../types";
import { LanguageCode } from "../i18n";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserLanguage: (language: LanguageCode) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would check for an existing session here
    // For now, we'll just simulate the loading state
    const checkSession = async () => {
      setLoading(true);
      try {
        // Simulate API call to check session
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Session check failed:", error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user for demonstration
      setUser({
        id: "user-1",
        email,
        firstName: "Demo",
        lastName: "User",
        role: email.includes("director") ? UserRole.DIRECTOR : UserRole.MEMBER,
        organizationId: "org-1",
        permissions: [Permission.READ, Permission.EDIT, Permission.DELETE],
        language: localStorage.getItem("i18nextLng") as LanguageCode || "en",
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user creation and then log them in
      setUser({
        id: `user-${Math.floor(Math.random() * 1000)}`,
        email,
        firstName,
        lastName,
        role: UserRole.MEMBER, // Default role for new users
        organizationId: "org-1",
        permissions: [Permission.READ], // Default permissions
        language: localStorage.getItem("i18nextLng") as LanguageCode || "en",
      });
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserLanguage = async (language: LanguageCode) => {
    try {
      if (user) {
        // In a real app, this would be an API call to update the user's language preference
        setUser({ ...user, language });
        
        // For now, we'll just update localStorage
        localStorage.setItem("i18nextLng", language);
      }
    } catch (error) {
      console.error("Failed to update language preference:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserLanguage }}>
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
