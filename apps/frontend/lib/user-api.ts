import { apiClient } from "./axios-next-auth";

export enum UserRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  TENANT_ADMIN = "tenant_admin",
  MERCHANT_ADMIN = "merchant_admin",
  BRANCH_ADMIN = "branch_admin",
  POS_USER = "pos_user",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  tenantId?: string;
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
  tenantId?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  tenantId?: string;
}

const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/admin/users");
    return response.data;
  },

  getUsersByTenant: async (tenantId: string): Promise<User[]> => {
    const response = await apiClient.get(`/admin/tenants/${tenantId}/users`);
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
