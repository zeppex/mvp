import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    merchantId?: string;
    branchId?: string;
    posId?: string;
    isActive: boolean;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      merchantId?: string;
      branchId?: string;
      posId?: string;
      isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
  }

  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    merchantId?: string;
    branchId?: string;
    posId?: string;
    isActive: boolean;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    merchantId?: string;
    branchId?: string;
    posId?: string;
    isActive: boolean;
    accessToken: string;
    refreshToken: string;
  }
}
