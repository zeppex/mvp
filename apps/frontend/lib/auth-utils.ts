import { getServerSession } from "next-auth";
import { getServerSideTokens } from "./server-auth";

export async function getSession() {
  return await getServerSession();
}

// This function can be used in server components or API routes
export async function getServerAuthSession() {
  const session = await getSession();
  return session;
}

// Function to check if a user has the required roles
export function hasRequiredRoles(
  userRole: string | undefined,
  requiredRoles: string[]
) {
  if (!userRole || !requiredRoles.length) {
    return false;
  }

  return requiredRoles.includes(userRole);
}
