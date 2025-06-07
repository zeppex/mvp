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
import userApi, { User, CreateUserDto, UpdateUserDto } from "@/lib/user-api";
import { UserRole } from "@/types/enums";
import tenantApi from "@/lib/tenant-api";
import { withNextAuth } from "@/components/withNextAuth";

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
  tenantId: string;
}

function UserForm({ userId, tenantId }: UserFormProps) {
  const router = useRouter();
  const isEditing = !!userId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formSchema = isEditing ? updateUserSchema : createUserSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: UserRole.POS_USER,
      isActive: true,
    },
  });

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
          tenantId: tenantId,
        };
        await userApi.createUser(createData);
      }

      router.push(`/admin/tenants/${tenantId}/users`);
    } catch (err) {
      setError(`Failed to ${isEditing ? "update" : "create"} user`);
      console.error(`Error ${isEditing ? "updating" : "creating"} user:`, err);
    } finally {
      setLoading(false);
    }
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
                          <SelectItem value={UserRole.TENANT_ADMIN}>
                            Tenant Admin
                          </SelectItem>
                          <SelectItem value={UserRole.MERCHANT_ADMIN}>
                            Merchant Admin
                          </SelectItem>
                          <SelectItem value={UserRole.BRANCH_ADMIN}>
                            Branch Admin
                          </SelectItem>
                          <SelectItem value={UserRole.POS_USER}>
                            POS User
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  onClick={() =>
                    router.push(`/admin/tenants/${tenantId}/users`)
                  }
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

const ProtectedUserForm = withNextAuth(UserForm, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.TENANT_ADMIN],
  loginUrl: "/admin/login",
});

export default ProtectedUserForm;
