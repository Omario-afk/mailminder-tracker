import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, Permission } from "@/types";
import { LanguageCode } from "@/i18n";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserLanguage: (language: LanguageCode) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

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
          // Fetch user profile and organization data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) throw profileError;

          // Fetch user's organization memberships
          const { data: memberships, error: membershipError } = await supabase
            .from('organization_members')
            .select(`
              org_id,
              role,
              organizations (
                id,
                name,
                director_id
              )
            `)
            .eq('user_id', session.user.id);

          if (membershipError) throw membershipError;

          // Determine user's primary role and organization
          const primaryMembership = memberships?.[0];
          const isDirector = memberships?.some(m => m.organizations.director_id === session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email!,
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: isDirector ? 'director' : (primaryMembership?.role as UserRole || 'member'),
            organizationId: primaryMembership?.org_id,
            permissions: determinePermissions(isDirector, primaryMembership?.role),
            language: profile.language || localStorage.getItem("i18nextLng") as LanguageCode || "en",
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
        // Fetch user profile and organization data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) throw profileError;

        // Fetch user's organization memberships
        const { data: memberships, error: membershipError } = await supabase
          .from('organization_members')
          .select(`
            org_id,
            role,
            organizations (
              id,
              name,
              director_id
            )
          `)
          .eq('user_id', session.user.id);

        if (membershipError) throw membershipError;

        // Determine user's primary role and organization
        const primaryMembership = memberships?.[0];
        const isDirector = memberships?.some(m => m.organizations.director_id === session.user.id);

        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: isDirector ? 'director' : (primaryMembership?.role as UserRole || 'member'),
          organizationId: primaryMembership?.org_id,
          permissions: determinePermissions(isDirector, primaryMembership?.role),
          language: profile.language || localStorage.getItem("i18nextLng") as LanguageCode || "en",
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

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      if (!authUser) throw new Error("No user returned from signup");

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          first_name: firstName,
          last_name: lastName,
          language: localStorage.getItem("i18nextLng") as LanguageCode || "en",
        });

      if (profileError) throw profileError;
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

  const updateUserLanguage = async (language: LanguageCode) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ language })
          .eq('id', user.id);
          
        if (error) throw error;
        
        setUser({ ...user, language });
        localStorage.setItem("i18nextLng", language);
      }
    } catch (error) {
      console.error("Failed to update language preference:", error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: updates.firstName,
            last_name: updates.lastName,
          })
          .eq('id', user.id);
          
        if (error) throw error;
        
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserLanguage, updateUserProfile }}>
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

// Helper function to determine user permissions based on role
function determinePermissions(isDirector: boolean, role?: string): Permission[] {
  const basePermissions: Permission[] = ['READ'];
  
  if (isDirector) {
    return [...basePermissions, 'WRITE', 'DELETE', 'MANAGE_USERS', 'MANAGE_TEMPLATES'];
  }
  
  switch (role) {
    case 'admin':
      return [...basePermissions, 'WRITE', 'DELETE', 'MANAGE_TEMPLATES'];
    case 'member':
      return [...basePermissions, 'WRITE'];
    default:
      return basePermissions;
  }
}
