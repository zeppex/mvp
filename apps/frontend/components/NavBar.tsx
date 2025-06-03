"use client";

import { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Settings, User } from "lucide-react";

export function NavBar() {
  const { user, authenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <span className="hidden text-xl font-bold sm:inline-block">
            Zeppex
          </span>
        </Link>
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
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {authenticated ? (
            <UserNav user={user} onLogout={logout} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/merchant/login">Log in</Link>
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

function UserNav({ user, onLogout }: { user: any; onLogout: () => void }) {
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.email?.substring(0, 2).toUpperCase() || "ZX";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
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
