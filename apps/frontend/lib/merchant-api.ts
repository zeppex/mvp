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
  tenantId?: string;
}

export interface CreateBranchDto {
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
}

export interface CreatePosDto {
  name: string;
  description: string;
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
  getAllMerchants: async (): Promise<Merchant[]> => {
    const response = await apiClient.get("/merchants");
    return response.data;
  },

  getMerchant: async (id: string): Promise<Merchant> => {
    const response = await apiClient.get(`/merchants/${id}`);
    return response.data;
  },

  createMerchant: async (merchant: CreateMerchantDto): Promise<Merchant> => {
    console.log("🚀 Creating merchant:", merchant);
    try {
      const response = await apiClient.post("/merchants", merchant);
      console.log("✅ Merchant created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating merchant:", error);
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = (
          error as {
            response?: { data?: unknown; status?: number; headers?: unknown };
          }
        ).response;
        if (errorResponse) {
          console.error("Response data:", errorResponse.data);
          console.error("Response status:", errorResponse.status);
          console.error("Response headers:", errorResponse.headers);
        }
      }
      throw error;
    }
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
    const response = await apiClient.post(
      `/merchants/${id}/binance-submerchant`
    );
    return response.data;
  },

  // Branch CRUD operations (with merchant context)
  getAllBranches: async (merchantId: string): Promise<Branch[]> => {
    const response = await apiClient.get(`/merchants/${merchantId}/branches`);
    return response.data;
  },

  getBranch: async (branchId: string): Promise<Branch> => {
    const response = await apiClient.get(`/branches/${branchId}`);
    return response.data;
  },

  createBranch: async (
    merchantId: string,
    branch: CreateBranchDto
  ): Promise<Branch> => {
    const response = await apiClient.post(
      `/merchants/${merchantId}/branches`,
      branch
    );
    return response.data;
  },

  updateBranch: async (
    branchId: string,
    branch: UpdateBranchDto
  ): Promise<Branch> => {
    const response = await apiClient.put(`/branches/${branchId}`, branch);
    return response.data;
  },

  deleteBranch: async (branchId: string): Promise<void> => {
    await apiClient.delete(`/branches/${branchId}`);
  },

  // POS CRUD operations (with branch context)
  getAllPos: async (merchantId: string, branchId: string): Promise<Pos[]> => {
    const response = await apiClient.get(
      `/merchants/${merchantId}/branches/${branchId}/pos`
    );
    return response.data;
  },

  getPos: async (
    merchantId: string,
    branchId: string,
    posId: string
  ): Promise<Pos> => {
    const response = await apiClient.get(
      `/merchants/${merchantId}/branches/${branchId}/pos/${posId}`
    );
    return response.data;
  },

  createPos: async (
    merchantId: string,
    branchId: string,
    pos: CreatePosDto
  ): Promise<Pos> => {
    const response = await apiClient.post(
      `/merchants/${merchantId}/branches/${branchId}/pos`,
      pos
    );
    return response.data;
  },

  updatePos: async (
    merchantId: string,
    branchId: string,
    posId: string,
    pos: UpdatePosDto
  ): Promise<Pos> => {
    const response = await apiClient.put(
      `/merchants/${merchantId}/branches/${branchId}/pos/${posId}`,
      pos
    );
    return response.data;
  },

  deletePos: async (
    merchantId: string,
    branchId: string,
    posId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/merchants/${merchantId}/branches/${branchId}/pos/${posId}`
    );
  },
};

export default merchantApi;
