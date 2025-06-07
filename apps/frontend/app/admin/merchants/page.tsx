"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  TableCaption,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Building,
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  Settings,
  Trash2,
  Eye,
} from "lucide-react";
import merchantApi, { Merchant } from "@/lib/merchant-api";
import tenantApi, { Tenant } from "@/lib/tenant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { formatDate } from "@/lib/utils";

function SuperAdminMerchantsPageContent() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(typeof window !== "undefined");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchData();
    }
  }, []);

  useEffect(() => {
    filterMerchants();
  }, [merchants, searchQuery, selectedTenant, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [merchantsData, tenantsData] = await Promise.all([
        merchantApi.getAllMerchants(),
        tenantApi.getAllTenants(),
      ]);
      setMerchants(merchantsData);
      setTenants(tenantsData);
      setError(null);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterMerchants = () => {
    let filtered = merchants;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (merchant) =>
          merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          merchant.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
          merchant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tenant
    if (selectedTenant !== "all") {
      filtered = filtered.filter(
        (merchant) => merchant.tenant.id === selectedTenant
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((merchant) => {
        if (statusFilter === "active") return merchant.isActive;
        if (statusFilter === "inactive") return !merchant.isActive;
        return true;
      });
    }

    setFilteredMerchants(filtered);
  };

  const handleCreateMerchant = () => {
    router.push("/admin/merchants/create");
  };

  const handleViewMerchant = (id: string) => {
    router.push(`/admin/merchants/${id}`);
  };

  const handleEditMerchant = (id: string) => {
    router.push(`/admin/merchants/${id}/edit`);
  };

  const handleManageBranches = (id: string) => {
    router.push(`/admin/merchants/${id}/branches`);
  };

  const handleDeleteMerchant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this merchant? This will also delete all associated branches and POS systems.")) {
      try {
        await merchantApi.deleteMerchant(id);
        setMerchants(merchants.filter((merchant) => merchant.id !== id));
      } catch (err) {
        setError("Failed to delete merchant. Please try again.");
        console.error("Error deleting merchant:", err);
      }
    }
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.displayName || tenant?.name || "Unknown";
  };

  const getMerchantStats = () => {
    const totalMerchants = merchants.length;
    const activeMerchants = merchants.filter((m) => m.isActive).length;
    const inactiveMerchants = totalMerchants - activeMerchants;
    
    return { totalMerchants, activeMerchants, inactiveMerchants };
  };

  const stats = getMerchantStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Merchant Management</h1>
          <p className="text-muted-foreground">
            Manage merchants across all tenants in the platform
          </p>
        </div>
        <Button onClick={handleCreateMerchant}>
          <Plus className="mr-2 h-4 w-4" />
          Create Merchant
        </Button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMerchants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeMerchants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Merchants</CardTitle>
            <Building className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactiveMerchants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search merchants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.displayName || tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Merchants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Merchants</CardTitle>
          <CardDescription>
            Showing {filteredMerchants.length} of {merchants.length} merchants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading merchants...</div>
          ) : filteredMerchants.length === 0 ? (
            <div className="text-center py-4">
              {merchants.length === 0 ? "No merchants found" : "No merchants match your filters"}
            </div>
          ) : (
            <Table>
              <TableCaption>A list of all merchants across tenants</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMerchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{merchant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTenantName(merchant.tenant.id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{merchant.contactName}</div>
                        <div className="text-muted-foreground">{merchant.contact}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{merchant.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={merchant.isActive ? "default" : "destructive"}
                      >
                        {merchant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(merchant.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewMerchant(merchant.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditMerchant(merchant.id)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManageBranches(merchant.id)}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Manage Branches
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteMerchant(merchant.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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

// Create a protected version of the component with withNextAuth
const SuperAdminMerchantsPage = withNextAuth(SuperAdminMerchantsPageContent, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default SuperAdminMerchantsPage;
