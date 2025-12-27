// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

/**
 * Universal API call helper
 * Automatically includes credentials (cookies) in every request
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Don't set Content-Type for FormData
    const headers: HeadersInit = {};

    // Only set JSON Content-Type if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Request failed",
        ...data,
      };
    }

    return {
      success: true,
      data,
      ...data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || "Network error",
      };
    } else {
      return {
        success: false,
        error: "Network error",
      };
    }
  }
}

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Login user
   * Django sets HTTP-only cookies automatically
   */
  login: async (email: string, password: string) => {
    return apiCall("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Logout user
   * Django clears HTTP-only cookies automatically
   */
  logout: async () => {
    return apiCall("/auth/logout/", {
      method: "POST",
    });
  },

  /**
   * Get current user
   * Uses cookies automatically
   */
  getCurrentUser: async () => {
    return apiCall("/auth/me/");
  },

  /**
   * Register new user
   */
  register: async (data: any) => {
    return apiCall("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Refresh token
   * Django handles token rotation automatically
   */
  refreshToken: async () => {
    return apiCall("/auth/token/refresh/", {
      method: "POST",
    });
  },

  /**
   * Change password
   */
  changePassword: async (
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ) => {
    return apiCall("/auth/password/change/", {
      method: "POST",
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }),
    });
  },
};

// ============================================
// BRANCH API
// ============================================

export const branchAPI = {
  list: async () => {
    return apiCall("/branches/");
  },

  get: async (id: string) => {
    return apiCall(`/branches/${id}/`);
  },

  create: async (data: any) => {
    return apiCall("/branches/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// LOAN API
// ============================================

export const loanAPI = {
  list: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiCall(`/loans/${query}`);
  },

  get: async (id: string) => {
    return apiCall(`/loans/${id}/`);
  },

  apply: async (data: any) => {
    return apiCall("/loans/apply/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  approve: async (
    id: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) => {
    return apiCall(`/loans/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    });
  },

  calculatePreview: async (data: {
    principal_amount: number;
    repayment_frequency: string;
    duration_value: number;
  }) => {
    return await apiCall("/loans/calculate/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  disburse: async (id: string, data: any) => {
    return apiCall(`/loans/${id}/disburse/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  repay: async (id: string, data: any) => {
    return apiCall(`/loans/${id}/repay/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getSchedule: async (id: string) => {
    return apiCall(`/loans/${id}/schedule/`);
  },

  getStatistics: async () => {
    return apiCall("/loans/statistics/");
  },
};

// ============================================
// SAVINGS API
// ============================================

export const savingsAPI = {
  list: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiCall(`/savings/${query}`);
  },

  get: async (id: string) => {
    return apiCall(`/savings/${id}/`);
  },

  create: async (data: any) => {
    return apiCall("/savings/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  approve: async (
    id: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) => {
    return apiCall(`/savings/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    });
  },

  deposit: async (id: string, data: any) => {
    return apiCall(`/savings/${id}/deposit/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  withdraw: async (id: string, data: any) => {
    return apiCall(`/savings/${id}/withdraw/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getTransactions: async (id: string) => {
    return apiCall(`/savings/${id}/transactions/`);
  },

  getStatistics: async () => {
    return apiCall("/savings/statistics/");
  },
};



// ============================================
// TRANSACTIONS API (Approval Workflow)
// ============================================

export const transactionsAPI = {
  // Get list of pending transactions (manager+ only)
  getPending: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiCall(`/transactions/pending/${query}`);
  },

  // Get transaction details
  get: async (id: string) => {
    return apiCall(`/transactions/${id}/`);
  },

  // Approve a transaction
  approve: async (id: string) => {
    return apiCall(`/transactions/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ action: "approve" }),
    });
  },

  // Reject a transaction
  reject: async (id: string, rejectionReason: string) => {
    return apiCall(`/transactions/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ 
        action: "reject", 
        rejection_reason: rejectionReason 
      }),
    });
  },
};


// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  getOverview: async () => {
    return apiCall("/dashboard/");
  },

  getLoanRepaymentChart: async () => {
    return apiCall("/dashboard/charts/loan-repayment/");
  },

  getSavingsActivityChart: async () => {
    return apiCall("/dashboard/charts/savings-activity/");
  },

  getAccountDistribution: async () => {
    return apiCall("/dashboard/charts/account-distribution/");
  },

  getClientGrowth: async () => {
    return apiCall("/dashboard/charts/client-growth/");
  },
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  list: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiCall(`/users/${query}`);
  },

  get: async (id: string) => {
    return apiCall(`/users/${id}/`);
  },

  approve: async (id: string, action: "approve" | "reject") => {
    return apiCall(`/users/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  },

  activate: async (id: string, action: "activate" | "deactivate") => {
    return apiCall(`/users/${id}/activate/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  },

  update: async (id: string, data: any) => {
    return apiCall(`/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/users/${id}/`, {
      method: "DELETE",
    });
  },
};

// ============================================
// CLIENT API
// ============================================

export const clientAPI = {
  list: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiCall(`/clients/${query}`);
  },

  get: async (id: string) => {
    return apiCall(`/clients/${id}/`);
  },

  create: async (data: any) => {
    return apiCall("/clients/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return apiCall(`/clients/${id}/update/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/clients/${id}/delete/`, {
      method: "DELETE",
    });
  },

  assignStaff: async (clientId: string, staffId: string | null) => {
    return apiCall(`/clients/${clientId}/assign-staff/`, {
      method: "POST",
      body: JSON.stringify({ staff_id: staffId }),
    });
  },

  // ============================================
  // GUARANTOR ENDPOINTS
  // Backend: GuarantorListCreateView, GuarantorDetailView
  // ============================================

  // List guarantors for a client
  listGuarantors: async (clientId: string) => {
    return apiCall(`/clients/${clientId}/guarantors/`);
  },

  // Add guarantor to client
  addGuarantor: async (clientId: string, data: any) => {
    return apiCall(`/clients/${clientId}/guarantors/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update guarantor
  updateGuarantor: async (clientId: string, guarantorId: string, data: any) => {
    return apiCall(`/clients/${clientId}/guarantors/${guarantorId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete guarantor
  deleteGuarantor: async (clientId: string, guarantorId: string) => {
    return apiCall(`/clients/${clientId}/guarantors/${guarantorId}/`, {
      method: "DELETE",
    });
  },

  // ============================================
  // NEXT OF KIN ENDPOINTS
  // Backend: NextOfKinView (OneToOne - no nokId needed)
  // ============================================

  // Get next of kin for a client
  getNextOfKin: async (clientId: string) => {
    return apiCall(`/clients/${clientId}/next-of-kin/`);
  },

  // Add/replace next of kin (POST creates or replaces existing)
  addNextOfKin: async (clientId: string, data: any) => {
    return apiCall(`/clients/${clientId}/next-of-kin/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update next of kin
  updateNextOfKin: async (clientId: string, data: any) => {
    return apiCall(`/clients/${clientId}/next-of-kin/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete next of kin
  deleteNextOfKin: async (clientId: string) => {
    return apiCall(`/clients/${clientId}/next-of-kin/`, {
      method: "DELETE",
    });
  },

  // ============================================
  // IMAGE UPLOAD
  // ============================================

  uploadImages: async (clientId: string, formData: FormData) => {
    return apiCall(`/clients/${clientId}/upload-images/`, {
      method: "POST",
      body: formData,
    });
  },
};

// ============================================
// STAFF API
// ============================================

export const staffAPI = {
  list: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiCall(`/staff/${query}`);
  },

  create: async (data: FormData) => {
    return apiCall("/staff/create/", {
      method: "POST",
      body: data,
    });
  },

  get: async (id: string) => {
    return apiCall(`/staff/${id}/`);
  },

  update: async (id: string, data: FormData) => {
    return apiCall(`/staff/${id}/update/`, {
      method: "PATCH",
      body: data,
    });
  },

  delete: async (id: string) => {
    return apiCall(`/staff/${id}/delete/`, {
      method: "DELETE",
    });
  },

  assignToClient: async (clientId: string, staffId: string | null) => {
    return apiCall(`/clients/${clientId}/assign-staff/`, {
      method: "POST",
      body: JSON.stringify({ staff_id: staffId }),
    });
  },
};

// ============================================
// NOTIFICATION API
// ============================================

export const notificationAPI = {
  list: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiCall(`/notifications/${query}`);
  },

  getUnreadCount: async () => {
    return apiCall("/notifications/unread-count/");
  },

  markAsRead: async (id: string) => {
    return apiCall(`/notifications/${id}/read/`, {
      method: "POST",
    });
  },

  markAllAsRead: async (category?: string) => {
    return apiCall("/notifications/mark-all-read/", {
      method: "POST",
      body: JSON.stringify({ category }),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/notifications/${id}/delete/`, {
      method: "DELETE",
    });
  },

  deleteAll: async () => {
    return apiCall("/notifications/delete-all/", {
      method: "DELETE",
    });
  },
};
