// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { 
//   Search, 
//   MoreHorizontal, 
//   Edit, 
//   Trash2, 
//   Ban, 
//   CheckCircle,
//   ChevronLeft,
//   ChevronRight,
//   Crown
// } from "lucide-react";
// import { toast } from "sonner";
// import { deleteUser, updateUserStatus } from "@/actions/admin";

// interface UsersTableProps {
//   users: any[];
//   totalPages: number;
//   currentPage: number;
// }

// export function UsersTable({ users, totalPages, currentPage }: UsersTableProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [search, setSearch] = useState(searchParams.get("search") || "");
//   const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
//   const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
//   const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleSearch = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     if (search) {
//       params.set("search", search);
//     } else {
//       params.delete("search");
//     }
//     params.set("page", "1");
//     router.push(`/dashboard/users?${params.toString()}`);
//   };

//   const handleFilterChange = (type: "status" | "role", value: string) => {
//     const params = new URLSearchParams(searchParams.toString());
//     if (value) {
//       params.set(type, value);
//     } else {
//       params.delete(type);
//     }
//     params.set("page", "1");
//     router.push(`/dashboard/users?${params.toString()}`);
//   };

//   const handlePageChange = (page: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", page.toString());
//     router.push(`/dashboard/users?${params.toString()}`);
//   };

//   const handleStatusChange = async (userId: string, newStatus: string) => {
//     const result = await updateUserStatus(userId, newStatus);
//     if (result.success) {
//       toast.success("User status updated");
//       router.refresh();
//     } else {
//       toast.error(result.error || "Failed to update status");
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteUserId) return;
    
//     setIsDeleting(true);
//     const result = await deleteUser(deleteUserId);
    
//     if (result.success) {
//       toast.success("User deleted successfully");
//       setDeleteUserId(null);
//       router.refresh();
//     } else {
//       toast.error(result.error || "Failed to delete user");
//     }
//     setIsDeleting(false);
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "ACTIVE":
//         return <Badge className="bg-green-500">Active</Badge>;
//       case "INACTIVE":
//         return <Badge variant="secondary">Inactive</Badge>;
//       case "SUSPENDED":
//         return <Badge variant="destructive">Suspended</Badge>;
//       case "BANNED":
//         return <Badge variant="destructive">Banned</Badge>;
//       default:
//         return <Badge>{status}</Badge>;
//     }
//   };

//   const getRoleBadge = (role: string) => {
//     switch (role) {
//       case "SUPER_ADMIN":
//         return <Badge className="bg-purple-500">Super Admin</Badge>;
//       case "ADMIN":
//         return <Badge className="bg-blue-500">Admin</Badge>;
//       case "MANAGER":
//         return <Badge className="bg-cyan-500">Manager</Badge>;
//       default:
//         return <Badge variant="outline">User</Badge>;
//     }
//   };

//   return (
//     <>
//       <Card>
//         {/* Filters */}
//         <div className="p-6 border-b border-border">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 flex gap-2">
//               <Input
//                 placeholder="Search users by name or email..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 className="flex-1"
//               />
//               <Button onClick={handleSearch}>
//                 <Search className="w-4 h-4" />
//               </Button>
//             </div>

//             <Select value={statusFilter} onValueChange={(v) => {
//               setStatusFilter(v);
//               handleFilterChange("status", v);
//             }}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="">All Status</SelectItem>
//                 <SelectItem value="ACTIVE">Active</SelectItem>
//                 <SelectItem value="INACTIVE">Inactive</SelectItem>
//                 <SelectItem value="SUSPENDED">Suspended</SelectItem>
//                 <SelectItem value="BANNED">Banned</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select value={roleFilter} onValueChange={(v) => {
//               setRoleFilter(v);
//               handleFilterChange("role", v);
//             }}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="">All Roles</SelectItem>
//                 <SelectItem value="USER">User</SelectItem>
//                 <SelectItem value="ADMIN">Admin</SelectItem>
//                 <SelectItem value="MANAGER">Manager</SelectItem>
//                 <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Table */}
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>User</TableHead>
//               <TableHead>Contact</TableHead>
//               <TableHead>Role</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Subscription</TableHead>
//               <TableHead>Joined</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {users.length > 0 ? (
//               users.map((user) => (
//                 <TableRow key={user.id}>
//                   <TableCell>
//                     <div className="flex items-center gap-3">
//                       {user.imageUrl ? (
//                         <Image
//                           src={user.imageUrl}
//                           alt={user.name}
//                           width={40}
//                           height={40}
//                           className="rounded-full"
//                         />
//                       ) : (
//                         <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
//                           {user.name?.[0]?.toUpperCase()}
//                         </div>
//                       )}
//                       <div>
//                         <p className="font-medium">{user.name}</p>
//                         <p className="text-sm text-muted-foreground">
//                           ID: {user.id.slice(0, 8)}
//                         </p>
//                       </div>
//                     </div>
//                   </TableCell>

//                   <TableCell>
//                     <div className="space-y-1">
//                       <p className="text-sm">{user.email}</p>
//                       <p className="text-xs text-muted-foreground">{user.phone}</p>
//                     </div>
//                   </TableCell>

//                   <TableCell>{getRoleBadge(user.role)}</TableCell>

//                   <TableCell>{getStatusBadge(user.status)}</TableCell>

//                   <TableCell>
//                     {user.currentPlan ? (
//                       <div className="flex items-center gap-2">
//                         <Crown className="w-4 h-4 text-orange-500" />
//                         <span className="text-sm">{user.currentPlan}</span>
//                       </div>
//                     ) : (
//                       <span className="text-sm text-muted-foreground">No plan</span>
//                     )}
//                   </TableCell>

//                   <TableCell>
//                     <span className="text-sm">
//                       {new Date(user.createdAt).toLocaleDateString()}
//                     </span>
//                   </TableCell>

//                   <TableCell className="text-right">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="icon">
//                           <MoreHorizontal className="w-4 h-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem asChild>
//                           <Link href={`/dashboard/users/${user.id}`}>
//                             <Edit className="w-4 h-4 mr-2" />
//                             Edit User
//                           </Link>
//                         </DropdownMenuItem>
                        
//                         {user.status === "ACTIVE" ? (
//                           <DropdownMenuItem
//                             onClick={() => handleStatusChange(user.id, "SUSPENDED")}
//                           >
//                             <Ban className="w-4 h-4 mr-2" />
//                             Suspend User
//                           </DropdownMenuItem>
//                         ) : (
//                           <DropdownMenuItem
//                             onClick={() => handleStatusChange(user.id, "ACTIVE")}
//                           >
//                             <CheckCircle className="w-4 h-4 mr-2" />
//                             Activate User
//                           </DropdownMenuItem>
//                         )}

//                         <DropdownMenuSeparator />
                        
//                         <DropdownMenuItem
//                           onClick={() => setDeleteUserId(user.id)}
//                           className="text-destructive"
//                         >
//                           <Trash2 className="w-4 h-4 mr-2" />
//                           Delete User
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={7} className="text-center py-8">
//                   <p className="text-muted-foreground">No users found</p>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between p-6 border-t border-border">
//             <p className="text-sm text-muted-foreground">
//               Page {currentPage} of {totalPages}
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </Card>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the user
//               and all associated data including subscriptions and watch history.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               disabled={isDeleting}
//               className="bg-destructive hover:bg-destructive/90"
//             >
//               {isDeleting ? "Deleting..." : "Delete User"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }





"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  ShieldCheck,
  ShieldOff
} from "lucide-react";
import { toast } from "sonner";
import { deleteUser, updateUserStatus, toggleUserExemption } from "@/actions/admin";

interface UsersTableProps {
  users: any[];
  totalPages: number;
  currentPage: number;
}

export function UsersTable({ users, totalPages, currentPage }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "all");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleFilterChange = (type: "status" | "role", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    params.set("page", "1");
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) {
      toast.success("User status updated");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const handleExemptionToggle = async (userId: string, isExempt: boolean) => {
    const result = await toggleUserExemption(userId, isExempt);
    if (result.success) {
      toast.success(isExempt ? "User exempted from subscription" : "User exemption removed");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update exemption status");
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    
    setIsDeleting(true);
    const result = await deleteUser(deleteUserId);
    
    if (result.success) {
      toast.success("User deleted successfully");
      setDeleteUserId(null);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete user");
    }
    setIsDeleting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspended</Badge>;
      case "BANNED":
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-purple-500">Super Admin</Badge>;
      case "ADMIN":
        return <Badge className="bg-blue-500">Admin</Badge>;
      case "MANAGER":
        return <Badge className="bg-cyan-500">Manager</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  return (
    <>
      <Card>
        {/* Filters */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <Select 
              value={statusFilter} 
              onValueChange={(v) => {
                setStatusFilter(v);
                handleFilterChange("status", v);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="BANNED">Banned</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={roleFilter} 
              onValueChange={(v) => {
                setRoleFilter(v);
                handleFilterChange("role", v);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {user.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </div>
                  </TableCell>

                  <TableCell>{getRoleBadge(user.role)}</TableCell>

                  <TableCell>{getStatusBadge(user.status)}</TableCell>

                  <TableCell>
                    {user.isExempt ? (
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-orange-500">EXEMPT (Forever)</span>
                      </div>
                    ) : user.currentPlan ? (
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">{user.currentPlan}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No plan</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </Link>
                        </DropdownMenuItem>
                        
                        {user.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "SUSPENDED")}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "ACTIVE")}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}

                        {user.isExempt ? (
                          <DropdownMenuItem
                            onClick={() => handleExemptionToggle(user.id, false)}
                          >
                            <ShieldOff className="w-4 h-4 mr-2 text-orange-500" />
                            Remove Exemption
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleExemptionToggle(user.id, true)}
                          >
                            <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                            Exempt User
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => setDeleteUserId(user.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and all associated data including subscriptions and watch history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}