"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Store,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  branchId?: string;
  branchName?: string;
  posId?: string;
  posName?: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    branchId: "",
    posId: "",
  });

  // Mock data - replace with API call
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        email: "cashier1@starbucks.com",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "CASHIER",
        branchId: "branch1",
        branchName: "Starbucks - Unicenter 2",
        posId: "pos1",
        posName: "POS Terminal 1",
        isActive: true,
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        email: "manager@starbucks.com",
        firstName: "Michael",
        lastName: "Chen",
        role: "BRANCH_ADMIN",
        branchId: "branch1",
        branchName: "Starbucks - Unicenter 2",
        isActive: true,
        createdAt: "2024-01-10T09:15:00Z",
      },
      {
        id: "3",
        email: "cashier2@starbucks.com",
        firstName: "Emily",
        lastName: "Davis",
        role: "CASHIER",
        branchId: "branch1",
        branchName: "Starbucks - Unicenter 2",
        posId: "pos2",
        posName: "POS Terminal 2",
        isActive: false,
        createdAt: "2024-01-20T14:45:00Z",
      },
    ];
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: "bg-blue-100 text-blue-800", label: "Admin" },
      BRANCH_ADMIN: {
        color: "bg-green-100 text-green-800",
        label: "Branch Admin",
      },
      CASHIER: { color: "bg-purple-100 text-purple-800", label: "Cashier" },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: role,
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleCreateUser = () => {
    // Prepare user data based on role requirements
    const userData: any = {
      id: Date.now().toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Only include branchId if role requires it and it has a value
    if (
      newUser.branchId &&
      newUser.branchId.trim() !== "" &&
      (newUser.role === "BRANCH_ADMIN" || newUser.role === "CASHIER")
    ) {
      userData.branchId = newUser.branchId;
      userData.branchName = "Starbucks - Unicenter 2";
    }

    // Only include posId if role is CASHIER and it has a value
    if (
      newUser.posId &&
      newUser.posId.trim() !== "" &&
      newUser.role === "CASHIER"
    ) {
      userData.posId = newUser.posId;
      userData.posName = "POS Terminal " + newUser.posId;
    }

    // Mock user creation - replace with API call
    const newUserData: User = userData;
    setUsers([...users, newUserData]);
    setNewUser({
      email: "",
      firstName: "",
      lastName: "",
      role: "",
      branchId: "",
      posId: "",
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Users Management
          </h2>
          <p className="text-muted-foreground">
            Manage your merchant users and their permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to your merchant account with appropriate
                permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRANCH_ADMIN">Branch Admin</SelectItem>
                    <SelectItem value="CASHIER">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={newUser.branchId}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, branchId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch1">
                      Starbucks - Unicenter 2
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === "CASHIER" && (
                <div className="space-y-2">
                  <Label htmlFor="pos">POS Terminal (Optional)</Label>
                  <Select
                    value={newUser.posId}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, posId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select POS terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pos1">POS Terminal 1</SelectItem>
                      <SelectItem value="pos2">POS Terminal 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                A list of all users in your merchant account
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>POS Terminal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {user.branchName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.posName ? (
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {user.posName}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
