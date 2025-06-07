import { apiClient } from "./axios-next-auth";

export interface Tenant {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDto {
  name: string;
  displayName: string;
  isActive?: boolean;
}

export interface UpdateTenantDto {
  name?: string;
  displayName?: string;
  isActive?: boolean;
}

const tenantApi = {
  getAllTenants: async (): Promise<Tenant[]> => {
    const response = await apiClient.get("/admin/tenants");
    return response.data;
  },

  getTenant: async (id: string): Promise<Tenant> => {
    const response = await apiClient.get(`/admin/tenants/${id}`);
    return response.data;
  },

  createTenant: async (tenant: CreateTenantDto): Promise<Tenant> => {
    const response = await apiClient.post("/admin/tenants", tenant);
    return response.data;
  },

  updateTenant: async (
    id: string,
    tenant: UpdateTenantDto
  ): Promise<Tenant> => {
    const response = await apiClient.put(`/admin/tenants/${id}`, tenant);
    return response.data;
  },

  deleteTenant: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/tenants/${id}`);
  },
};

export default tenantApi;
