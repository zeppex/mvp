// User type definitions based on the backend User entity with merchant-based architecture
import { UserRole } from "./enums";

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
}
