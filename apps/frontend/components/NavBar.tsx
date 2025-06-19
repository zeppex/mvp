"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function NavBar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isMounted = true; // Next Auth handles loading state

  // Default navigation links, always show these
  const renderNavLinks = () => (
    <nav className="hidden flex-1 items-center gap-6 text-sm md:flex">
      <Link
        href="/"
        className="font-medium transition-colors hover:text-foreground/80"
      >
        Home
      </Link>
      <Link
        href="/merchant/dashboard"
        className="font-medium transition-colors hover:text-foreground/80"
      >
        Merchant Portal
      </Link>
      <Link
        href="/admin/dashboard"
        className="font-medium transition-colors hover:text-foreground/80"
      >
        Admin Portal
      </Link>
      <Link
        href="/admin/merchants"
        className="font-medium transition-colors hover:text-foreground/80"
      >
        Merchant Management
      </Link>
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <span className="hidden text-xl font-bold sm:inline-block">
            Zeppex
          </span>
        </Link>
        {renderNavLinks()}
        <div className="ml-auto flex items-center gap-2">
          {/* Show authentication UI based on session status */}
          {isMounted && isAuthenticated ? (
            <UserNav
              user={{
                id: session?.user.id || "",
                email: session?.user.email || "",
                firstName: session?.user.firstName || "",
                lastName: session?.user.lastName || "",
                role: session?.user.role || "",
                isActive: session?.user.isActive || false,
              }}
              onLogout={() => signOut({ callbackUrl: "/" })}
            />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/admin/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function UserNav({
  user,
  onLogout,
}: {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
  onLogout: () => void;
}) {
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      : user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              Role: {user?.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
