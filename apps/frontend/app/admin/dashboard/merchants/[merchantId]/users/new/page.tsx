"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema matching backend CreateUserDto
const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  role: z.enum(["admin", "branch_admin", "cashier"], {
    message: "Please select a valid role.",
  }),
  branchId: z.string().optional(),
  posId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface Merchant {
  id: string;
  name: string;
  branches?: Array<{
    id: string;
    name: string;
    pos?: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

export default function NewUserPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.merchantId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "cashier",
      branchId: "",
      posId: "",
    },
  });

  const selectedRole = form.watch("role");
  const selectedBranchId = form.watch("branchId");

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const response = await fetch(`/api/merchants/${merchantId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch merchant");
        }
        const data = await response.json();
        setMerchant(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (merchantId) {
      fetchMerchant();
    }
  }, [merchantId]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          merchantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      setIsSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/dashboard/merchants/${merchantId}/users`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/dashboard/merchants/${merchantId}/users`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/dashboard/merchants/${merchantId}/users`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Add New User</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {error || "Merchant not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/dashboard/merchants/${merchantId}/users`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Add New User</h2>
        </div>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>User Created Successfully</CardTitle>
            </div>
            <CardDescription>
              The user has been added to the merchant and can now access the
              platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Redirecting to user list...</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/admin/dashboard/merchants/${merchantId}/users`}>
                Return to User List
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/dashboard/merchants/${merchantId}/users`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New User</h2>
          <p className="text-muted-foreground">
            Create a new user account for {merchant.name}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Enter the details for the new user account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used as the login email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a strong password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="branch_admin">
                          Branch Admin
                        </SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The user's role determines their permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedRole === "branch_admin" ||
                selectedRole === "cashier") && (
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {merchant.branches && merchant.branches.length > 0 ? (
                            merchant.branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No branches available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Required for branch admin and cashier roles
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedRole === "cashier" && selectedBranchId && (
                <FormField
                  control={form.control}
                  name="posId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>POS Terminal</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a POS terminal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(() => {
                            const selectedBranch = merchant.branches?.find(
                              (b) => b.id === selectedBranchId
                            );
                            return selectedBranch?.pos &&
                              selectedBranch.pos.length > 0 ? (
                              selectedBranch.pos.map((pos) => (
                                <SelectItem key={pos.id} value={pos.id}>
                                  {pos.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No POS terminals available
                              </div>
                            );
                          })()}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Required for cashier role
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
