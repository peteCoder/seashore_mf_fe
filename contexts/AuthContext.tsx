// contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// ============================================
// TYPES & INTERFACES
// ============================================

// ============================================
// TYPES & INTERFACES
// ============================================

interface ClientProfile {
  id: number;
  level?: string;
  loan_limit?: number;
  assigned_staff?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  next_of_kin_address?: string;
  guarantor1_name?: string;
  guarantor1_phone?: string;
  guarantor1_address?: string;
  guarantor2_name?: string;
  guarantor2_phone?: string;
  guarantor2_address?: string;
  id_type?: string;
  id_number?: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

interface StaffProfile {
  id: number;
  employee_id?: string;
  designation?: string;
  department?: string;
  hire_date?: string;
  termination_date?: string;
  employment_status?: boolean;
  salary?: string;
  bank_account?: string;
  bank_name?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  reports_to?: string | null;
  can_approve_loans?: boolean;
  can_approve_accounts?: boolean;
  max_approval_amount?: string | null;
  profile_picture?: string | null;
  cv_document?: string | null;
  cv_url?: string | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  user_role: "admin" | "director" | "manager" | "staff" | "client";
  branch?: string;
  branch_name?: string;
  is_approved: boolean;
  is_active: boolean;
  last_login?: string;
  client_profile?: ClientProfile | null;
  staff_profile?: StaffProfile | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  isDirector: () => boolean;
  isManager: () => boolean;
  isStaff: () => boolean;
  isClient: () => boolean;
  hasRole: (roles: User["user_role"][]) => boolean;
}

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   checkAuth: () => Promise<boolean>;
//   refreshUser: () => Promise<void>;
//   isAdmin: () => boolean;
//   isDirector: () => boolean;
//   isManager: () => boolean;
//   isStaff: () => boolean;
//   isClient: () => boolean;
//   hasRole: (roles: User["user_role"][]) => boolean;
// }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/login/auth",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/client/password/set",
];

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ============================================
  // CHECK AUTHENTICATION
  // ============================================

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/`, {
        credentials: "include", // ✅ Send cookies automatically
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          // console.log(data.user);
          return true;
        }
      }

      // Token is invalid, expired, or user not authenticated
      setUser(null);
      return false;
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      return false;
    }
  }, []);

  // ============================================
  // REFRESH USER DATA
  // ============================================

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, []);

  // ============================================
  // LOGIN FUNCTION
  // ============================================

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        credentials: "include", // ✅ Receive cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error formats from Django
        let errorMessage = "Login failed";

        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (
          data.non_field_errors &&
          Array.isArray(data.non_field_errors)
        ) {
          errorMessage = data.non_field_errors[0];
        }

        throw new Error(errorMessage);
      }

      if (data.success && data.user) {
        setUser(data.user);

        // ✅ Cookies are automatically set by Django backend
        // No need for manual cookie management!

        // Redirect based on user role
        if (data.user.user_role === "client") {
          router.push("/client/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        throw new Error("Login failed: No user data received");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error; // Re-throw to be handled by login form
    }
  };

  // ============================================
  // LOGOUT FUNCTION
  // ============================================

  const logout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint
      // This blacklists the refresh token and clears cookies
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include", // ✅ Send cookies to blacklist
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear user state and redirect
      setUser(null);

      // ✅ Cookies are automatically cleared by Django backend
      // No need for manual cookie management!

      router.push("/login");
    }
  };

  // ============================================
  // ROLE CHECKING HELPERS
  // ============================================

  const isAdmin = useCallback((): boolean => {
    return user?.user_role === "admin";
  }, [user]);

  const isDirector = useCallback((): boolean => {
    return user?.user_role === "director";
  }, [user]);

  const isManager = useCallback((): boolean => {
    return user?.user_role === "manager";
  }, [user]);

  const isStaff = useCallback((): boolean => {
    return user?.user_role === "staff";
  }, [user]);

  const isClient = useCallback((): boolean => {
    return user?.user_role === "client";
  }, [user]);

  const hasRole = useCallback(
    (roles: User["user_role"][]): boolean => {
      return user ? roles.includes(user.user_role) : false;
    },
    [user]
  );

  // ============================================
  // AUTHENTICATION CHECK ON ROUTE CHANGE
  // ============================================

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Check if current route is public
      const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      // Check authentication status
      const isAuthenticated = await checkAuth();

      // Route protection logic
      if (!isAuthenticated && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        // User is authenticated but on login page - redirect to dashboard
        if (user?.user_role === "client") {
          router.push("/client/dashboard");
        } else {
          router.push("/dashboard");
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [pathname, checkAuth, router, user?.user_role]);

  // ============================================
  // CONTEXT PROVIDER
  // ============================================

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    refreshUser,
    isAdmin,
    isDirector,
    isManager,
    isStaff,
    isClient,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook to check if user has specific role(s)
 * Usage: const canApprove = useRole(['admin', 'manager']);
 */
export function useRole(roles: User["user_role"][]): boolean {
  const { user } = useAuth();
  return user ? roles.includes(user.user_role) : false;
}

/**
 * Hook to get user's profile data
 */
export function useUserProfile() {
  const { user } = useAuth();
  return user?.staff_profile || null;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user } = useAuth();
  return user !== null;
}
