import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  UserPlus, 
  Filter, 
  User, 
  Mail, 
  Clock, 
  Shield,
  ShieldCheck,
  Users,
  RefreshCcw,
  X,
  Pencil
} from "lucide-react";

// ================ USER MANAGEMENT DATA & FUNCTIONS ================ //

// Mock user data for demonstration
const users = [
  {
    id: 1,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Michael Roberts",
    email: "michael.roberts@example.com",
    role: "Mediator",
    status: "Active",
    lastActive: "3 days ago"
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Support",
    status: "Inactive",
    lastActive: "1 month ago"
  },
  {
    id: 4,
    name: "David Anderson",
    email: "david.anderson@example.com",
    role: "Mediator",
    status: "Active",
    lastActive: "Yesterday"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    role: "Client",
    status: "Pending",
    lastActive: "Never"
  }
];

// ================ INVITATIONS DATA & FUNCTIONS ================ //

// Mock data for invitations
const invitations = [
  {
    id: 1,
    email: "james.smith@example.com",
    status: "pending",
    role: "Mediator",
    invitedBy: "Emma Wilson",
    date: "2023-04-21"
  },
  {
    id: 2,
    email: "patricia.johnson@example.com",
    status: "expired",
    role: "Office Manager",
    invitedBy: "Emma Wilson",
    date: "2023-03-15"
  },
  {
    id: 3,
    email: "robert.williams@example.com",
    status: "pending",
    role: "Support Staff",
    invitedBy: "Michael Roberts",
    date: "2023-04-23"
  },
  {
    id: 4,
    email: "jennifer.brown@example.com",
    status: "accepted",
    role: "Mediator",
    invitedBy: "Emma Wilson",
    date: "2023-04-18"
  },
  {
    id: 5,
    email: "michael.jones@example.com",
    status: "pending",
    role: "Client",
    invitedBy: "David Anderson",
    date: "2023-04-25"
  }
];

// ================ ROLES & PERMISSIONS DATA & FUNCTIONS ================ //

// Mock data for roles
const roles = [
  { id: 1, name: "Administrator", count: 3, description: "Full system access" },
  { id: 2, name: "Mediator", count: 12, description: "Can manage assigned cases and create documents" },
  { id: 3, name: "Office Manager", count: 5, description: "Can manage cases and billing" },
  { id: 4, name: "Support Staff", count: 8, description: "Limited access to assist with cases" },
  { id: 5, name: "Client", count: 56, description: "Access to own case materials only" },
];

// Mock data for permissions
const permissionGroups = [
  { 
    name: "User Management", 
    permissions: [
      { id: "create_users", name: "Create Users" },
      { id: "edit_users", name: "Edit Users" },
      { id: "delete_users", name: "Delete Users" },
      { id: "view_all_users", name: "View All Users" },
    ] 
  },
  { 
    name: "Case Management", 
    permissions: [
      { id: "create_cases", name: "Create Cases" },
      { id: "edit_cases", name: "Edit Cases" },
      { id: "delete_cases", name: "Delete Cases" },
      { id: "view_all_cases", name: "View All Cases" },
      { id: "reassign_cases", name: "Reassign Cases" },
    ] 
  },
  { 
    name: "Documents", 
    permissions: [
      { id: "create_documents", name: "Create Documents" },
      { id: "edit_templates", name: "Edit Templates" },
      { id: "delete_documents", name: "Delete Documents" },
      { id: "view_all_documents", name: "View All Documents" },
    ] 
  },
  { 
    name: "Billing", 
    permissions: [
      { id: "manage_invoices", name: "Manage Invoices" },
      { id: "process_payments", name: "Process Payments" },
      { id: "view_financial_reports", name: "View Financial Reports" },
    ] 
  },
];

export default function UserManagementPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("users");
  
  // ================ USER MANAGEMENT STATE ================ //
  const [userSearchTerm, setUserSearchTerm] = useState("");
  
  // ================ INVITATIONS STATE ================ //
  const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false);
  
  // ================ ROLES STATE ================ //
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // Helper for icon size - matching Contacts.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  // Function to get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Expired</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle role edit
  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  // Filtered users based on search term
  const filteredUsers = users.filter(user => 
    userSearchTerm === "" || 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    roleSearchTerm === "" || 
    role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>User Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage system users, invitations, roles and permissions
          </p>
        </div>
        
        {activeTab === "users" && (
          <Button className={`${isMobile ? "h-8 text-xs px-2.5" : ""}`} size={isMobile ? "sm" : "default"}>
            <UserPlus className={`mr-1.5 ${iconSizeClass}`} />
            Add User
          </Button>
        )}
        
        {activeTab === "invitations" && (
          <Dialog open={isCreateInviteOpen} onOpenChange={setIsCreateInviteOpen}>
            <DialogTrigger asChild>
              <Button
                size={isMobile ? "sm" : "default"} 
                className={isMobile ? "h-8 text-xs px-2.5" : ""}
              >
                <Plus className={`mr-1.5 ${iconSizeClass}`} />
                <span>Invite</span>
              </Button>
            </DialogTrigger>
            <DialogContent className={`${isMobile ? "max-w-[95vw] p-4" : "sm:max-w-[425px]"}`}>
              <DialogHeader className={isMobile ? "pb-3" : ""}>
                <DialogTitle className={isMobile ? "text-base" : ""}>Invite New User</DialogTitle>
                <DialogDescription className={isMobile ? "text-xs" : ""}>
                  Send an invitation email to add a new user to the system
                </DialogDescription>
              </DialogHeader>
              <div className={`space-y-4 ${isMobile ? "py-2" : "py-4"}`}>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className={isMobile ? "text-xs" : ""}>Email Address</Label>
                  <Input id="email" placeholder="user@example.com" className={isMobile ? "h-9 text-xs" : ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className={isMobile ? "text-xs" : ""}>Role</Label>
                  <Select>
                    <SelectTrigger id="role" className={isMobile ? "h-9 text-xs" : ""}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrator">Administrator</SelectItem>
                      <SelectItem value="mediator">Mediator</SelectItem>
                      <SelectItem value="office-manager">Office Manager</SelectItem>
                      <SelectItem value="support-staff">Support Staff</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className={isMobile ? "text-xs" : ""}>Personal Message (Optional)</Label>
                  <Input id="message" placeholder="Add a personal note to the invitation email" className={isMobile ? "h-9 text-xs" : ""} />
                </div>
              </div>
              <DialogFooter className={`gap-2 ${isMobile ? 'flex-col-reverse sm:flex-row' : ''}`}>
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setIsCreateInviteOpen(false)}>Cancel</Button>
                <Button type="submit" size={isMobile ? "sm" : "default"}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {activeTab === "roles" && (
          <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
            <DialogTrigger asChild>
              <Button className={isMobile ? "h-8 text-xs px-2.5" : ""}>
                <Plus className={`mr-1.5 ${iconSizeClass}`} />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role and set its permissions
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-4">
                    <Label htmlFor="name">Role Name</Label>
                    <Input id="name" placeholder="e.g., Senior Mediator" className="mt-1" />
                  </div>
                  <div className="col-span-4">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Describe the role's purpose" className="mt-1" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Label>Role Permissions</Label>
                  <div className="border rounded-md mt-2">
                    {permissionGroups.map((group) => (
                      <div key={group.name} className="p-4 border-b last:border-b-0">
                        <h3 className="font-medium mb-2">{group.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox id={permission.id} />
                              <Label htmlFor={permission.id} className="text-sm">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
                <Button type="submit">Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        defaultValue="users"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className={isMobile ? "grid grid-cols-3 h-9" : "grid grid-cols-3 w-[400px]"}>
          <TabsTrigger value="users" className={isMobile ? "text-xs py-1.5" : ""}>Users</TabsTrigger>
          <TabsTrigger value="invitations" className={isMobile ? "text-xs py-1.5" : ""}>Invitations</TabsTrigger>
          <TabsTrigger value="roles" className={isMobile ? "text-xs py-1.5" : ""}>Roles & Permissions</TabsTrigger>
        </TabsList>
        
        {/* ================ USERS TAB CONTENT ================ */}
        <TabsContent value="users" className="space-y-0 m-0">
          <Card className={`${isMobile ? "h-[calc(100vh-210px)]" : "h-[calc(100vh-260px)]"} flex flex-col overflow-hidden`}>
            <CardHeader className={`${isMobile ? "px-3 py-3" : "pb-0"}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className={isMobile ? "text-base" : ""}>Active Users</CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className={`absolute left-2.5 top-${isMobile ? "2" : "2.5"} ${iconSizeClass} text-muted-foreground`} />
                    <Input
                      placeholder="Search users..."
                      className={`${isMobile ? "pl-7 h-8 text-sm" : "pl-8"} w-full sm:w-[200px] md:w-[300px]`}
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size={isMobile ? "sm" : "icon"} className={isMobile ? "h-8 w-8 p-0" : ""}>
                    <Filter className={iconSizeClass} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "p-0 px-3" : ""}`}>
              {isMobile ? (
                // Mobile view - Card-based layout
                <div className="space-y-2 py-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div 
                        key={user.id}
                        className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{user.name}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Edit user</DropdownMenuItem>
                              <DropdownMenuItem>Manage permissions</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Deactivate account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex flex-col space-y-1.5 text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-[0.7rem]">
                            <Mail className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[200px]">{user.email}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[0.7rem]">
                              <Shield className="h-2.5 w-2.5" />
                              <span>{user.role}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-[0.7rem]">
                              <Clock className="h-2.5 w-2.5" />
                              <span>{user.lastActive}</span>
                            </div>
                          </div>
                          
                          <div className="mt-1">
                            {getStatusBadge(user.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <p>No users found.</p>
                    </div>
                  )}
                </div>
              ) : (
                // Desktop view - Table layout
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>{user.lastActive}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit user</DropdownMenuItem>
                                  <DropdownMenuItem>Manage permissions</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Deactivate account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ================ INVITATIONS TAB CONTENT ================ */}
        <TabsContent value="invitations" className="space-y-0 m-0">
          <Card className={`${isMobile ? "h-[calc(100vh-210px)]" : "h-[calc(100vh-260px)]"} flex flex-col overflow-hidden shadow-sm`}>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row justify-between items-start sm:items-center gap-2'}`}>
                <CardTitle className={isMobile ? "text-base" : ""}>Invitation History</CardTitle>
                <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'w-auto'}`}>
                  <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
                    <Search className={`absolute left-2.5 top-2.5 ${iconSizeClass} text-muted-foreground`} />
                    <Input
                      placeholder="Search by email..."
                      className={`pl-8 ${isMobile ? "h-8 text-xs" : ""} w-full sm:w-[200px] md:w-[250px]`}
                    />
                  </div>
                  <Button variant="outline" size={isMobile ? "sm" : "icon"} className={isMobile ? "h-8 w-8" : ""}>
                    <Filter className={iconSizeClass} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "px-0 py-0" : ""}`}>
              {isMobile ? (
                <div className="px-3 pb-3 space-y-2 mt-2">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id} className="border overflow-hidden">
                      <div className="px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium">{invitation.email}</span>
                          {getStatusBadge(invitation.status)}
                        </div>
                        <div className="text-xs font-medium mb-1">{invitation.role}</div>
                        <div className="text-[0.65rem] text-muted-foreground mb-1.5">Invited by: {invitation.invitedBy} on {invitation.date}</div>

                        <div className="flex justify-end gap-1 mt-2">
                          {invitation.status === "pending" && (
                            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                              <RefreshCcw className={`${iconSizeClass} mr-1`} /> Resend
                            </Button>
                          )}
                          {invitation.status === "pending" && (
                            <Button variant="outline" size="sm" className={`h-7 text-xs px-2 text-destructive hover:bg-destructive/10`}>
                              <X className={`${iconSizeClass} mr-1`} /> Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // Desktop Table View (Original)
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invited By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">{invitation.email}</TableCell>
                          <TableCell>{invitation.role}</TableCell>
                          <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                          <TableCell>{invitation.invitedBy}</TableCell>
                          <TableCell>{invitation.date}</TableCell>
                          <TableCell className="text-right space-x-2">
                            {invitation.status === "pending" && (
                              <Button variant="outline" size="sm">
                                <RefreshCcw className={`${iconSizeClass} mr-1`} /> Resend
                              </Button>
                            )}
                            {invitation.status === "pending" && (
                              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                                <X className={`${iconSizeClass} mr-1`} /> Revoke
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ================ ROLES & PERMISSIONS TAB CONTENT ================ */}
        <TabsContent value="roles" className="space-y-0 m-0">
          <Card className={`${isMobile ? "h-[calc(100vh-210px)]" : "h-[calc(100vh-260px)]"} flex flex-col overflow-hidden`}>
            <CardHeader className={`${isMobile ? "px-3 py-3" : ""}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className={isMobile ? "text-base" : ""}>System Roles</CardTitle>
                <div className="relative w-full sm:w-auto">
                  <Search className={`absolute left-2.5 top-${isMobile ? "2" : "2.5"} ${iconSizeClass} text-muted-foreground`} />
                  <Input 
                    placeholder="Search roles..." 
                    className={`${isMobile ? "pl-7 h-8 text-sm" : "pl-8"} w-full sm:w-[250px]`}
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "p-0 px-3" : ""}`}>
              {isMobile ? (
                // Mobile view - Card based layout
                <div className="space-y-2 py-2">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <Card key={role.id} className="border overflow-hidden">
                        <div className="px-3 py-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center">
                              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
                              <span className="text-xs font-medium">{role.name}</span>
                            </div>
                            <Badge variant="outline" className="flex items-center text-[0.65rem] h-5">
                              <Users className="h-2.5 w-2.5 mr-0.5" />
                              {role.count}
                            </Badge>
                          </div>
                          
                          <div className="text-[0.65rem] text-muted-foreground mb-2">{role.description}</div>
                          
                          <Button
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditRole(role)}
                            className="w-full h-7 text-xs flex items-center justify-center"
                          >
                            <Pencil className="h-3 w-3 mr-1" /> 
                            Edit Permissions
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <p className="text-sm">No roles found.</p>
                    </div>
                  )}
                </div>
              ) : (
                // Desktop view - Table layout
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{role.count} users</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                                <Pencil className="h-4 w-4 mr-1" /> Edit Permissions
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                            No roles found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================ EDIT ROLE DIALOG ================ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className={`${isMobile ? "max-w-[92%]" : "sm:max-w-[625px]"} overflow-y-auto max-h-[90vh]`}>
          <DialogHeader>
            <DialogTitle>Edit {selectedRole?.name} Role</DialogTitle>
            <DialogDescription>
              Modify permissions for this role
            </DialogDescription>
          </DialogHeader>
          <div className={`${isMobile ? "py-3 space-y-3" : "py-4 space-y-4"}`}>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Label htmlFor="edit-name" className={isMobile ? "text-sm" : ""}>Role Name</Label>
                <Input id="edit-name" value={selectedRole?.name} className={`mt-1 ${isMobile ? "h-8 text-sm" : ""}`} />
              </div>
              <div className="col-span-4">
                <Label htmlFor="edit-description" className={isMobile ? "text-sm" : ""}>Description</Label>
                <Input id="edit-description" value={selectedRole?.description} className={`mt-1 ${isMobile ? "h-8 text-sm" : ""}`} />
              </div>
            </div>
            
            <div className={`${isMobile ? "mt-4" : "mt-6"}`}>
              <Label className={isMobile ? "text-sm" : ""}>Role Permissions</Label>
              <div className={`border rounded-md ${isMobile ? "mt-1.5" : "mt-2"}`}>
                {permissionGroups.map((group) => (
                  <div key={group.name} className={`${isMobile ? "p-3" : "p-4"} border-b last:border-b-0`}>
                    <h3 className={`font-medium ${isMobile ? "text-xs mb-1.5" : "mb-2"}`}>{group.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-${permission.id}`} 
                            defaultChecked={Math.random() > 0.5}
                            className={isMobile ? "h-3.5 w-3.5" : ""}
                          />
                          <Label 
                            htmlFor={`edit-${permission.id}`} 
                            className={isMobile ? "text-xs" : "text-sm"}
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              className={isMobile ? "text-xs h-8" : ""}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className={isMobile ? "text-xs h-8" : ""}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}