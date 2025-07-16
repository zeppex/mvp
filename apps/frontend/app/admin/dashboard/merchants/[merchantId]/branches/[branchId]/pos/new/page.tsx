"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const posFormSchema = z.object({
  name: z
    .string()
    .min(1, "POS name must be at least 1 character")
    .max(100, "POS name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description must be at least 1 character")
    .max(500, "Description must be less than 500 characters"),
});

type PosFormValues = z.infer<typeof posFormSchema>;

export default function NewPosPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const merchantId = params.merchantId as string;
  const branchId = params.branchId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PosFormValues>({
    resolver: zodResolver(posFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: PosFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          branchId: branchId,
          merchantId: merchantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to create POS terminal"
        );
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: `POS terminal "${data.name}" created successfully`,
      });

      // Redirect back to branch detail page
      router.push(
        `/admin/dashboard/merchants/${merchantId}/branches/${branchId}`
      );
    } catch (error) {
      console.error("Error creating POS terminal:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create POS terminal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link
            href={`/admin/dashboard/merchants/${merchantId}/branches/${branchId}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Add New POS Terminal
          </h2>
          <p className="text-muted-foreground">
            Create a new POS terminal for this branch
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                POS Terminal Information
              </CardTitle>
              <CardDescription>
                Enter the details for the new POS terminal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POS Terminal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="POS Terminal 1" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this POS terminal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Main checkout counter near the entrance"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of the POS terminal location or purpose
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
                    <CreditCard className="mr-2 h-4 w-4" />
                    Create POS Terminal
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
