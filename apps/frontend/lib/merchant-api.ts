import { apiClient } from "./axios-next-auth";

export interface Merchant {
  id: string;
  name: string;
  address: string;
  contact: string;
  contactName: string;
  contactPhone: string;
  binanceId?: string;
  isActive: boolean;
  tenant: {
    id: string;
    name: string;
  };
  branches?: Branch[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  isActive: boolean;
  merchant: {
    id: string;
    name: string;
  };
  pos?: Pos[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Pos {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  branch: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMerchantDto {
  name: string;
  address: string;
  contact: string;
  contactName: string;
  contactPhone: string;
  tenantId?: string; // For super admin to specify tenant
}

export interface CreateBranchDto {
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  merchantId: string;
}

export interface CreatePosDto {
  name: string;
  description: string;
  branchId: string;
}

export interface UpdateMerchantDto {
  name?: string;
  address?: string;
  contact?: string;
  contactName?: string;
  contactPhone?: string;
  isActive?: boolean;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  isActive?: boolean;
}

export interface UpdatePosDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

const merchantApi = {
  // Merchant CRUD operations
  getAllMerchants: async (tenantId?: string): Promise<Merchant[]> => {
    const params = tenantId ? { tenantId } : {};
    const response = await apiClient.get("/merchants", { params });
    return response.data;
  },

  getMerchant: async (id: string): Promise<Merchant> => {
    const response = await apiClient.get(`/merchants/${id}`);
    return response.data;
  },

  createMerchant: async (merchant: CreateMerchantDto): Promise<Merchant> => {
    const response = await apiClient.post("/merchants", merchant);
    return response.data;
  },

  updateMerchant: async (
    id: string,
    merchant: UpdateMerchantDto
  ): Promise<Merchant> => {
    const response = await apiClient.put(`/merchants/${id}`, merchant);
    return response.data;
  },

  deleteMerchant: async (id: string): Promise<void> => {
    await apiClient.delete(`/merchants/${id}`);
  },

  createBinanceSubMerchant: async (id: string): Promise<Merchant> => {
    const response = await apiClient.post(`/merchants/${id}/binance-submerchant`);
    return response.data;
  },

  // Branch CRUD operations
  getAllBranches: async (merchantId?: string): Promise<Branch[]> => {
    const params = merchantId ? { merchantId } : {};
    const response = await apiClient.get("/branches", { params });
    return response.data;
  },

  getBranch: async (id: string): Promise<Branch> => {
    const response = await apiClient.get(`/branches/${id}`);
    return response.data;
  },

  createBranch: async (branch: CreateBranchDto): Promise<Branch> => {
    const response = await apiClient.post("/branches", branch);
    return response.data;
  },

  updateBranch: async (
    id: string,
    branch: UpdateBranchDto
  ): Promise<Branch> => {
    const response = await apiClient.put(`/branches/${id}`, branch);
    return response.data;
  },

  deleteBranch: async (id: string): Promise<void> => {
    await apiClient.delete(`/branches/${id}`);
  },

  // POS CRUD operations
  getAllPos: async (branchId?: string): Promise<Pos[]> => {
    const params = branchId ? { branchId } : {};
    const response = await apiClient.get("/pos", { params });
    return response.data;
  },

  getPos: async (id: string): Promise<Pos> => {
    const response = await apiClient.get(`/pos/${id}`);
    return response.data;
  },

  createPos: async (pos: CreatePosDto): Promise<Pos> => {
    const response = await apiClient.post("/pos", pos);
    return response.data;
  },

  updatePos: async (
    id: string,
    pos: UpdatePosDto
  ): Promise<Pos> => {
    const response = await apiClient.put(`/pos/${id}`, pos);
    return response.data;
  },

  deletePos: async (id: string): Promise<void> => {
    await apiClient.delete(`/pos/${id}`);
  },
};

export default merchantApi;
