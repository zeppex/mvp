"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building, Check, Loader2 } from "lucide-react"
import Link from "next/link";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Form validation schema matching backend CreateMerchantDto
const merchantFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Merchant name must be at least 2 characters." })
    .max(100),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." })
    .max(500),
  contact: z.string().email({ message: "Please enter a valid email address." }),
  contactName: z
    .string()
    .min(2, { message: "Contact name must be at least 2 characters." })
    .max(100),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Please enter a valid phone number (e.g., +1234567890)",
  }),
});

type MerchantFormValues = z.infer<typeof merchantFormSchema>

// Default values for the form
const defaultValues: Partial<MerchantFormValues> = {
  name: "",
  address: "",
  contact: "",
  contactName: "",
  contactPhone: "",
};

export default function NewMerchantPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: MerchantFormValues) => {
    setIsSubmitting(true)
    setError(null);

    try {
      const response = await fetch("/api/merchants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create merchant");
      }

      setIsSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/admin/dashboard/merchants");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard/merchants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Add New Merchant</h2>
        </div>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Merchant Created Successfully</CardTitle>
            </div>
            <CardDescription>
              The merchant has been added to the platform and can now start accepting payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Redirecting to merchant list...</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/dashboard/merchants">Return to Merchant List</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/dashboard/merchants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Add New Merchant</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Merchant Information</CardTitle>
              <CardDescription>
                Enter the details for the new merchant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Store" {...field} />
                    </FormControl>
                    <FormDescription>
                      The legal name of the business
                    </FormDescription>
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
                        placeholder="123 Main Street, Springfield"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The complete merchant address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contact@acme.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The primary contact email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      The primary contact person name
                    </FormDescription>
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
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      The primary contact phone number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <Building className="mr-2 h-4 w-4" />
                    Create Merchant
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
