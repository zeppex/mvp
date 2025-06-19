"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import userApi, { CreateUserDto, UpdateUserDto } from "@/lib/user-api";
import { UserRole } from "@/types/enums";
import merchantApi, { Merchant, Branch, Pos } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { useAuth } from "@/hooks/useAuth";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

const userBaseSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().default(true),
  merchantId: z.string().optional(),
  branchId: z.string().optional(),
  posId: z.string().optional(),
});

const createUserSchema = userBaseSchema.extend({
  password: passwordSchema,
});

const updateUserSchema = userBaseSchema
  .extend({
    password: passwordSchema.optional(),
  })
  .partial();

interface UserFormProps {
  userId?: string;
  merchantId?: string;
  branchId?: string;
}

function UserForm({ userId, merchantId, branchId }: UserFormProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isEditing = !!userId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [posDevices, setPosDevices] = useState<Pos[]>([]);

  const formSchema = isEditing ? updateUserSchema : createUserSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: UserRole.CASHIER,
      isActive: true,
      merchantId: merchantId || "",
      branchId: branchId || "",
      posId: "",
    },
  });

  const watchedMerchantId = form.watch("merchantId");
  const watchedBranchId = form.watch("branchId");
  const watchedRole = form.watch("role");

  // Load merchants for SUPERADMIN
  useEffect(() => {
    const fetchMerchants = async () => {
      if (currentUser?.role === UserRole.SUPERADMIN) {
        try {
          const merchantsData = await merchantApi.getAllMerchants();
          setMerchants(merchantsData);
        } catch (err) {
          console.error("Error fetching merchants:", err);
        }
      }
    };

    fetchMerchants();
  }, [currentUser]);

  // Load branches when merchant changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (watchedMerchantId) {
        try {
          const branchesData = await merchantApi.getAllBranches(watchedMerchantId);
          setBranches(branchesData);
        } catch (err) {
          console.error("Error fetching branches:", err);
        }
      } else {
        setBranches([]);
      }
    };

    fetchBranches();
  }, [watchedMerchantId]);

  // Load POS devices when branch changes
  useEffect(() => {
    const fetchPosDevices = async () => {
      if (watchedMerchantId && watchedBranchId) {
        try {
          const posData = await merchantApi.getAllPos(watchedMerchantId, watchedBranchId);
          setPosDevices(posData);
        } catch (err) {
          console.error("Error fetching POS devices:", err);
        }
      } else {
        setPosDevices([]);
      }
    };

    fetchPosDevices();
  }, [watchedMerchantId, watchedBranchId]);

  // Load user data for editing
  useEffect(() => {
    const fetchUser = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        const user = await userApi.getUser(userId);
        form.reset({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          merchantId: user.merchantId || "",
          branchId: user.branchId || "",
          posId: user.posId || "",
        });
      } catch (err) {
        setError("Failed to load user details");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, isEditing, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      if (isEditing) {
        const updateData: UpdateUserDto = {
          ...data,
        };
        await userApi.updateUser(userId, updateData);
      } else {
        const createData: CreateUserDto = {
          ...data,
          password: data.password!, // Password is required for creation
        };
        await userApi.createUser(createData);
      }

      // Navigate back based on context
      if (merchantId && branchId) {
        router.push(`/admin/merchants/${merchantId}/branches/${branchId}/users`);
      } else if (merchantId) {
        router.push(`/admin/merchants/${merchantId}/users`);
      } else {
        router.push("/admin/users");
      }
    } catch (err) {
      setError(`Failed to ${isEditing ? "update" : "create"} user`);
      console.error(`Error ${isEditing ? "updating" : "creating"} user:`, err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRoles = () => {
    const roles = [];
    
    if (currentUser?.role === UserRole.SUPERADMIN) {
      roles.push(
        { value: UserRole.SUPERADMIN, label: "Platform Admin" },
        { value: UserRole.ADMIN, label: "Merchant Admin" },
        { value: UserRole.BRANCH_ADMIN, label: "Branch Admin" },
        { value: UserRole.CASHIER, label: "Cashier" }
      );
    } else if (currentUser?.role === UserRole.ADMIN) {
      roles.push(
        { value: UserRole.BRANCH_ADMIN, label: "Branch Admin" },
        { value: UserRole.CASHIER, label: "Cashier" }
      );
    } else if (currentUser?.role === UserRole.BRANCH_ADMIN) {
      roles.push(
        { value: UserRole.CASHIER, label: "Cashier" }
      );
    }
    
    return roles;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit User" : "Create User"}
        </h1>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit User Details" : "Create New User"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the user information"
              : "Fill in the details to create a new user"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          disabled={loading}
                        />
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
                        <Input
                          placeholder="Doe"
                          {...field}
                          disabled={loading}
                        />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user@example.com"
                        type="email"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isEditing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        New Password (leave blank to keep current)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          value={field.value || ""}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableRoles().map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Merchant Selection (only for SUPERADMIN) */}
              {currentUser?.role === UserRole.SUPERADMIN && watchedRole !== UserRole.SUPERADMIN && (
                <FormField
                  control={form.control}
                  name="merchantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merchant</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a merchant" />
                          </SelectTrigger>
                          <SelectContent>
                            {merchants.map((merchant) => (
                              <SelectItem key={merchant.id} value={merchant.id}>
                                {merchant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Branch Selection (for BRANCH_ADMIN and CASHIER) */}
              {[UserRole.BRANCH_ADMIN, UserRole.CASHIER].includes(watchedRole) && (
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={loading || !watchedMerchantId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* POS Selection (only for CASHIER) */}
              {watchedRole === UserRole.CASHIER && (
                <FormField
                  control={form.control}
                  name="posId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>POS Device</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={loading || !watchedBranchId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a POS device" />
                          </SelectTrigger>
                          <SelectContent>
                            {posDevices.map((pos) => (
                              <SelectItem key={pos.id} value={pos.id}>
                                {pos.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Is this user active and able to use the platform?
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (merchantId && branchId) {
                      router.push(`/admin/merchants/${merchantId}/branches/${branchId}/users`);
                    } else if (merchantId) {
                      router.push(`/admin/merchants/${merchantId}/users`);
                    } else {
                      router.push("/admin/users");
                    }
                  }}
                  disabled={loading}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update User"
                    : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withNextAuth(UserForm);
