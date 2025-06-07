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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Monitor,
  Calendar,
  Edit,
  Save,
  X,
  Trash2,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import merchantApi, { Pos, UpdatePosDto } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { useToast } from "@/hooks/use-toast";

function PosDetailPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  const branchId = params.branchId as string;
  const posId = params.posId as string;
  const { toast } = useToast();

  const [pos, setPos] = useState<Pos | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePosDto>({});

  useEffect(() => {
    loadPosData();
  }, [posId]);

  const loadPosData = async () => {
    try {
      setLoading(true);
      const posData = await merchantApi.getPosDevice(merchantId, branchId, posId);
      setPos(posData);
      setFormData({
        name: posData.name,
        serialNumber: posData.serialNumber,
        location: posData.location,
        status: posData.status,
        isActive: posData.isActive,
      });
    } catch (error) {
      console.error("Error loading POS data:", error);
      toast({
        title: "Error",
        description: "Failed to load POS device data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedPos = await merchantApi.updatePosDevice(merchantId, branchId, posId, formData);
      setPos(updatedPos);
      setEditing(false);
      toast({
        title: "Success",
        description: "POS device updated successfully",
      });
    } catch (error) {
      console.error("Error updating POS device:", error);
      toast({
        title: "Error",
        description: "Failed to update POS device",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await merchantApi.deletePosDevice(merchantId, branchId, posId);
      toast({
        title: "Success",
        description: "POS device deleted successfully",
      });
      router.push(`/admin/merchants/${merchantId}/branches/${branchId}`);
    } catch (error) {
      console.error("Error deleting POS device:", error);
      toast({
        title: "Error",
        description: "Failed to delete POS device",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof UpdatePosDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4" />;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return "default";
      case 'offline':
        return "destructive";
      case 'maintenance':
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading POS device details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pos) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">POS Device Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested POS device could not be found.</p>
          <Button onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branchId}`)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Branch
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
            onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branchId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Branch
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              {pos.name}
              <Badge 
                variant={getStatusColor(pos.status) as any} 
                className="ml-3 flex items-center"
              >
                {getStatusIcon(pos.status)}
                <span className="ml-1 capitalize">{pos.status}</span>
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Branch: {pos.branch.name} • Merchant: {pos.branch.merchant.name}
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
                    name: pos.name,
                    serialNumber: pos.serialNumber,
                    location: pos.location,
                    status: pos.status,
                    isActive: pos.isActive,
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
                Edit Device
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
                    <AlertDialogTitle>Delete POS Device</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{pos.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Device
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Device Information
            </CardTitle>
            <CardDescription>
              Basic information about the POS device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Device Name</Label>
                {editing ? (
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Device name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{pos.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                {editing ? (
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber || ""}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    placeholder="Serial number"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1 font-mono">{pos.serialNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                {editing ? (
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Physical location"
                  />
                ) : pos.location ? (
                  <p className="text-sm text-muted-foreground mt-1">{pos.location}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">No location specified</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                {editing ? (
                  <Select
                    value={formData.status || pos.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center mt-1">
                    {getStatusIcon(pos.status)}
                    <span className="ml-2 text-sm text-muted-foreground capitalize">{pos.status}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active Status</Label>
                {editing ? (
                  <Switch
                    id="active"
                    checked={formData.isActive ?? pos.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                ) : (
                  <Badge variant={pos.isActive ? "default" : "secondary"}>
                    {pos.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label>Created</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(pos.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(pos.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {pos.lastSeen && (
                <div>
                  <Label>Last Seen</Label>
                  <div className="flex items-center mt-1">
                    <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(pos.lastSeen).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity & Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Activity & Statistics</CardTitle>
            <CardDescription>
              Device performance and usage metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Current Status</p>
                  <p className="text-2xl font-bold capitalize">{pos.status}</p>
                </div>
                {getStatusIcon(pos.status)}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Active Status</p>
                  <p className="text-2xl font-bold">{pos.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${pos.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
              </div>

              {pos.lastSeen && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium">Last Activity</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {new Date(pos.lastSeen).toLocaleDateString()}
                    </p>
                  </div>
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div className="p-4 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  Additional metrics and analytics will be available here in future updates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Configuration */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Device Configuration</CardTitle>
          <CardDescription>
            Advanced settings and configuration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{pos.id}</p>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <p className="text-sm text-muted-foreground font-mono">{pos.serialNumber}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground text-center">
                Device configuration interface will be available here in future updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withNextAuth(PosDetailPage);
