
import { Permission, UserRole } from "@/types";
import { LanguageCode } from "@/i18n";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: Permission[];
  language: LanguageCode;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>; // Alias for login
  signOut: () => Promise<void>; // Alias for logout
  logout: () => Promise<void>;
  updateUserLanguage: (language: LanguageCode) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}
