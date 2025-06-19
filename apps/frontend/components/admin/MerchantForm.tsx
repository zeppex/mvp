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
import merchantApi, {
  CreateMerchantDto,
  UpdateMerchantDto,
} from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";

const merchantSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  contact: z.string().email({ message: "Please enter a valid email address" }),
  contactName: z
    .string()
    .min(2, { message: "Contact name must be at least 2 characters" }),
  contactPhone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters" }),
  isActive: z.boolean(),
});

type MerchantFormData = z.infer<typeof merchantSchema>;

interface MerchantFormProps {
  merchantId?: string;
}

function MerchantForm({ merchantId }: MerchantFormProps) {
  const router = useRouter();
  const isEditing = !!merchantId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MerchantFormData>({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      name: "",
      address: "",
      contact: "",
      contactName: "",
      contactPhone: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const fetchMerchant = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        const merchant = await merchantApi.getMerchant(merchantId);
        form.reset({
          name: merchant.name,
          address: merchant.address,
          contact: merchant.contact,
          contactName: merchant.contactName,
          contactPhone: merchant.contactPhone,
          isActive: merchant.isActive,
        });
      } catch (err) {
        setError("Failed to load merchant details");
        console.error("Error fetching merchant:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchant();
  }, [merchantId, isEditing, form]);

  const onSubmit = async (data: MerchantFormData) => {
    try {
      setLoading(true);

      if (isEditing) {
        const updateData: UpdateMerchantDto = {
          ...data,
        };
        await merchantApi.updateMerchant(merchantId, updateData);
      } else {
        // For creation, only send the fields that the backend expects
        const createData: CreateMerchantDto = {
          name: data.name,
          address: data.address,
          contact: data.contact,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          // tenantId is optional - we don't include it for now
        };
        console.log("📤 Sending create data:", createData);
        await merchantApi.createMerchant(createData);
      }

      router.push("/admin/merchants");
    } catch (err) {
      setError(`Failed to ${isEditing ? "update" : "create"} merchant`);
      console.error(
        `Error ${isEditing ? "updating" : "creating"} merchant:`,
        err
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Merchant" : "Create Merchant"}
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
            {isEditing ? "Edit Merchant Details" : "Create New Merchant"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the merchant information"
              : "Fill in the details to create a new merchant"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Store Inc."
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main Street, City, State, ZIP"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
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
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
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
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contact@merchant.com"
                        type="email"
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Is this merchant active and able to use the platform?
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/merchants")}
                  disabled={loading}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Merchant"
                    : "Create Merchant"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withNextAuth(MerchantForm);
