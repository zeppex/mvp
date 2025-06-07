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
  Monitor,
} from "lucide-react";
import merchantApi, { Branch, Pos, UpdateBranchDto } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { useToast } from "@/hooks/use-toast";

function BranchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  const branchId = params.branchId as string;
  const { toast } = useToast();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [posDevices, setPosDevices] = useState<Pos[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateBranchDto>({});

  useEffect(() => {
    loadBranchData();
  }, [branchId]);

  const loadBranchData = async () => {
    try {
      setLoading(true);
      const [branchData, posData] = await Promise.all([
        merchantApi.getBranch(merchantId, branchId),
        merchantApi.getPosDevices(merchantId, branchId)
      ]);
      setBranch(branchData);
      setPosDevices(posData);
      setFormData({
        name: branchData.name,
        address: branchData.address,
        contactEmail: branchData.contactEmail,
        contactPhone: branchData.contactPhone,
        isActive: branchData.isActive,
      });
    } catch (error) {
      console.error("Error loading branch data:", error);
      toast({
        title: "Error",
        description: "Failed to load branch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedBranch = await merchantApi.updateBranch(merchantId, branchId, formData);
      setBranch(updatedBranch);
      setEditing(false);
      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
    } catch (error) {
      console.error("Error updating branch:", error);
      toast({
        title: "Error",
        description: "Failed to update branch",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await merchantApi.deleteBranch(merchantId, branchId);
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
      router.push(`/admin/merchants/${merchantId}`);
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast({
        title: "Error",
        description: "Failed to delete branch",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof UpdateBranchDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading branch details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Branch Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested branch could not be found.</p>
          <Button onClick={() => router.push(`/admin/merchants/${merchantId}`)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Merchant
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
            onClick={() => router.push(`/admin/merchants/${merchantId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Merchant
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{branch.name}</h1>
            <p className="text-muted-foreground">
              Merchant: {branch.merchant.name}
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
                    name: branch.name,
                    address: branch.address,
                    contactEmail: branch.contactEmail,
                    contactPhone: branch.contactPhone,
                    isActive: branch.isActive,
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
                Edit Branch
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
                    <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{branch.name}"? This action cannot be undone and will also delete all associated POS systems.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Branch
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branch Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Branch Information
            </CardTitle>
            <CardDescription>
              Basic information about the branch
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
                    placeholder="Branch name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{branch.name}</p>
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
                    <p className="text-sm text-muted-foreground">{branch.address}</p>
                  </div>
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
                ) : branch.contactEmail ? (
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{branch.contactEmail}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">No email provided</p>
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
                ) : branch.contactPhone ? (
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{branch.contactPhone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">No phone provided</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active Status</Label>
                {editing ? (
                  <Switch
                    id="active"
                    checked={formData.isActive ?? branch.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                ) : (
                  <Badge variant={branch.isActive ? "default" : "secondary"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Created</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(branch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(branch.updatedAt).toLocaleDateString()}
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
              Overview of branch activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Total POS Devices</p>
                  <p className="text-2xl font-bold">{posDevices.length}</p>
                </div>
                <Monitor className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Active POS Devices</p>
                  <p className="text-2xl font-bold">
                    {posDevices.filter(pos => pos.isActive).length}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Online Devices</p>
                  <p className="text-2xl font-bold">
                    {posDevices.filter(pos => pos.status === 'online').length}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* POS Devices Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>POS Devices</CardTitle>
              <CardDescription>
                Manage POS devices for this branch
              </CardDescription>
            </div>
            <Button onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branchId}/pos/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add POS Device
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {posDevices.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No POS devices found</h3>
              <p className="text-muted-foreground mb-4">
                This branch doesn't have any POS devices yet.
              </p>
              <Button onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branchId}/pos/create`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First POS Device
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posDevices.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-medium">{pos.name}</TableCell>
                    <TableCell>{pos.serialNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={pos.status === 'online' ? "default" : pos.status === 'offline' ? "destructive" : "secondary"}>
                          {pos.status}
                        </Badge>
                        {!pos.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pos.location || "Not specified"}</TableCell>
                    <TableCell>
                      {pos.lastSeen ? new Date(pos.lastSeen).toLocaleString() : "Never"}
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
                            onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branchId}/pos/${pos.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Device
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

export default withNextAuth(BranchDetailPage);
