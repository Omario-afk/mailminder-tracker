
import { Permission } from "@/types";

/**
 * Helper function to determine user permissions based on role
 */
export function determinePermissions(isDirector: boolean, role?: string): Permission[] {
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
