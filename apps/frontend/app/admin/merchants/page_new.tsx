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
  Users,
  Store,
} from "lucide-react";
import merchantApi, { Merchant } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

function MerchantsPageContent() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(typeof window !== "undefined");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchMerchants();
    }
  }, []);

  useEffect(() => {
    filterMerchants();
  }, [merchants, searchQuery, statusFilter]);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const merchantsData = await merchantApi.getAllMerchants();
      setMerchants(merchantsData);
      setError(null);
    } catch (err) {
      setError("Failed to load merchants. Please try again.");
      console.error("Error fetching merchants:", err);
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
          merchant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          merchant.contactName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((merchant) => merchant.isActive === isActive);
    }

    setFilteredMerchants(filtered);
  };

  const handleCreateMerchant = () => {
    router.push("/admin/merchants/create");
  };

  const handleEditMerchant = (id: string) => {
    router.push(`/admin/merchants/${id}/edit`);
  };

  const handleViewMerchant = (id: string) => {
    router.push(`/admin/merchants/${id}`);
  };

  const handleViewBranches = (id: string) => {
    router.push(`/admin/merchants/${id}/branches`);
  };

  const handleViewUsers = (id: string) => {
    router.push(`/admin/merchants/${id}/users`);
  };

  const handleDeleteMerchant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this merchant?")) {
      try {
        await merchantApi.deleteMerchant(id);
        setMerchants(merchants.filter((merchant) => merchant.id !== id));
      } catch (err) {
        setError("Failed to delete merchant. Please try again.");
        console.error("Error deleting merchant:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Merchant Management</h1>
          <p className="text-muted-foreground">
            Manage all merchants in the platform
          </p>
        </div>
        {(user?.role === UserRole.SUPERADMIN) && (
          <Button onClick={handleCreateMerchant} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Merchant
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Merchants
          </CardTitle>
          <CardDescription>View and manage all merchants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading merchants...</span>
              </div>
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No merchants found</h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search criteria." : "Get started by creating your first merchant."}
              </p>
              {(user?.role === UserRole.SUPERADMIN) && !searchQuery && (
                <Button onClick={handleCreateMerchant} className="mt-4">
                  Create First Merchant
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableCaption>
                Showing {filteredMerchants.length} of {merchants.length} merchants
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMerchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium">{merchant.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {merchant.address}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{merchant.contactName}</div>
                        <div className="text-sm text-gray-500">{merchant.contact}</div>
                        <div className="text-sm text-gray-500">{merchant.contactPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={merchant.isActive ? "default" : "destructive"}>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewMerchant(merchant.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewBranches(merchant.id)}>
                            <Store className="mr-2 h-4 w-4" />
                            View Branches
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewUsers(merchant.id)}>
                            <Users className="mr-2 h-4 w-4" />
                            View Users
                          </DropdownMenuItem>
                          {(user?.role === UserRole.SUPERADMIN || 
                            (user?.role === UserRole.ADMIN && user.merchantId === merchant.id)) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditMerchant(merchant.id)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Edit Merchant
                              </DropdownMenuItem>
                              {user?.role === UserRole.SUPERADMIN && (
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteMerchant(merchant.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Merchant
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
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

// Create a protected version of the component with role-based access
const MerchantsPage = withNextAuth(MerchantsPageContent, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.ADMIN],
  loginUrl: "/admin/login",
});

export default MerchantsPage;
