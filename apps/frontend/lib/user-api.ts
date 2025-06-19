import { apiClient } from "./axios-next-auth";

export enum UserRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  BRANCH_ADMIN = "branch_admin",
  CASHIER = "cashier",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  // Merchant-based relationships
  merchantId?: string;
  branchId?: string;
  posId?: string;
  // Related entities (if included in response)
  merchant?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  pos?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  // Merchant-based relationships
  merchantId?: string;
  branchId?: string;
  posId?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  // Merchant-based relationships
  merchantId?: string;
  branchId?: string;
  posId?: string;
}

const userApi = {
  getAllUsers: async (
    merchantId?: string,
    branchId?: string
  ): Promise<User[]> => {
    let url = "/admin/users";
    const params = new URLSearchParams();

    if (merchantId) params.append("merchantId", merchantId);
    if (branchId) params.append("branchId", branchId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await apiClient.get(url);
    return response.data;
  },

  getUsersByMerchant: async (merchantId: string): Promise<User[]> => {
    const response = await apiClient.get(
      `/admin/users?merchantId=${merchantId}`
    );
    return response.data;
  },

  getUsersByBranch: async (branchId: string): Promise<User[]> => {
    const response = await apiClient.get(`/admin/users?branchId=${branchId}`);
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (user: CreateUserDto): Promise<User> => {
    const response = await apiClient.post("/admin/users", user);
    return response.data;
  },

  updateUser: async (id: string, user: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },
};

export default userApi;
