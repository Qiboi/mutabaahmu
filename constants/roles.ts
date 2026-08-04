/**
 * Centralized RBAC role definitions.
 * Single source of truth used by: Auth.js callbacks, proxy.ts (route protection),
 * repositories/services (authorization checks), and UI (conditional rendering).
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  SCHOOL_ADMIN: "school_admin",
  TEACHER: "teacher",
  PARENT: "parent",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

/**
 * Maps each role to the route prefix it lands on after login,
 * and the route prefixes it is allowed to access.
 */
export const ROLE_HOME: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "/dashboard/super-admin",
  [ROLES.SCHOOL_ADMIN]: "/dashboard/admin",
  [ROLES.TEACHER]: "/dashboard/teacher",
  [ROLES.PARENT]: "/dashboard/parent",
};

export const ROLE_ALLOWED_PREFIXES: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: ["/dashboard/super-admin", "/dashboard"],
  [ROLES.SCHOOL_ADMIN]: ["/dashboard/admin", "/dashboard"],
  [ROLES.TEACHER]: ["/dashboard/teacher", "/dashboard"],
  [ROLES.PARENT]: ["/dashboard/parent", "/dashboard"],
};

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
