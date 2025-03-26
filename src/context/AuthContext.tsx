
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, Permission } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
      });
    } catch (error) {
      console.error("Login failed:", error);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
