// User type definitions based on the backend User entity
import { UserRole } from "./enums";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
}
