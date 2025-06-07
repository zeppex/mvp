"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Plus,
  MoreHorizontal,
  Settings,
  Trash2,
  Eye,
  Edit,
  Save,
  X,
} from "lucide-react";
import merchantApi, { Merchant, Branch, UpdateMerchantDto } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { useToast } from "@/hooks/use-toast";

function MerchantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  const { toast } = useToast();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateMerchantDto>({});

  useEffect(() => {
    loadMerchantData();
  }, [merchantId]);

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      const [merchantData, branchesData] = await Promise.all([
        merchantApi.getMerchant(merchantId),
        merchantApi.getBranches(merchantId)
      ]);
      setMerchant(merchantData);
      setBranches(branchesData);
      setFormData({
        name: merchantData.name,
        contactEmail: merchantData.contactEmail,
        contactPhone: merchantData.contactPhone,
        address: merchantData.address,
        isActive: merchantData.isActive,
      });
    } catch (error) {
      console.error("Error loading merchant data:", error);
      toast({
        title: "Error",
        description: "Failed to load merchant data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedMerchant = await merchantApi.updateMerchant(merchantId, formData);
      setMerchant(updatedMerchant);
      setEditing(false);
      toast({
        title: "Success",
        description: "Merchant updated successfully",
      });
    } catch (error) {
      console.error("Error updating merchant:", error);
      toast({
        title: "Error",
        description: "Failed to update merchant",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await merchantApi.deleteMerchant(merchantId);
      toast({
        title: "Success",
        description: "Merchant deleted successfully",
      });
      router.push("/admin/merchants");
    } catch (error) {
      console.error("Error deleting merchant:", error);
      toast({
        title: "Error",
        description: "Failed to delete merchant",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof UpdateMerchantDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading merchant details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Merchant Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested merchant could not be found.</p>
          <Button onClick={() => router.push("/admin/merchants")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Merchants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/merchants")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Merchants
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{merchant.name}</h1>
            <p className="text-muted-foreground">
              Tenant: {merchant.tenant.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: merchant.name,
                    contactEmail: merchant.contactEmail,
                    contactPhone: merchant.contactPhone,
                    address: merchant.address,
                    isActive: merchant.isActive,
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Merchant
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Merchant</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{merchant.name}"? This action cannot be undone and will also delete all associated branches and POS systems.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Merchant
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Merchant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Merchant Information
            </CardTitle>
            <CardDescription>
              Basic information about the merchant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                {editing ? (
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Merchant name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{merchant.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Contact Email</Label>
                {editing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactEmail || ""}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="contact@example.com"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{merchant.contactEmail}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                {editing ? (
                  <Input
                    id="phone"
                    value={formData.contactPhone || ""}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{merchant.contactPhone}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                {editing ? (
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Street address, City, State, ZIP"
                    rows={3}
                  />
                ) : (
                  <div className="flex items-start mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">{merchant.address}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active Status</Label>
                {editing ? (
                  <Switch
                    id="active"
                    checked={formData.isActive ?? merchant.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                ) : (
                  <Badge variant={merchant.isActive ? "default" : "secondary"}>
                    {merchant.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Created</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(merchant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(merchant.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>
              Overview of merchant activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Total Branches</p>
                  <p className="text-2xl font-bold">{branches.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Active Branches</p>
                  <p className="text-2xl font-bold">
                    {branches.filter(b => b.isActive).length}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Total POS Systems</p>
                  <p className="text-2xl font-bold">
                    {branches.reduce((total, branch) => total + (branch.posDevices?.length || 0), 0)}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Branches</CardTitle>
              <CardDescription>
                Manage branches for this merchant
              </CardDescription>
            </div>
            <Button onClick={() => router.push(`/admin/merchants/${merchantId}/branches/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No branches found</h3>
              <p className="text-muted-foreground mb-4">
                This merchant doesn't have any branches yet.
              </p>
              <Button onClick={() => router.push(`/admin/merchants/${merchantId}/branches/create`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Branch
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>POS Devices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {branch.contactEmail && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {branch.contactEmail}
                          </div>
                        )}
                        {branch.contactPhone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {branch.contactPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {branch.posDevices?.length || 0} devices
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branch.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branch.id}/pos`)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage POS
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Branch
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withNextAuth(MerchantDetailPage);
