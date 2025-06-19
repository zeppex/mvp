// Enum types matching the backend merchant-based architecture
export enum UserRole {
  SUPERADMIN = "superadmin", // Platform super admin - can create merchants
  ADMIN = "admin", // Merchant admin - can manage entire merchant
  BRANCH_ADMIN = "branch_admin", // Branch admin - can manage specific branch
  CASHIER = "cashier", // POS user - can only create payment orders for specific PoS
}
