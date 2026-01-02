"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, User } from "lucide-react";
import { toast } from "sonner";
import {
    listClerkUsers,
    updateUserRole,
    deleteUser,
    type ClerkUser,
} from "@/lib/actions/clerk";
import { type UserRole, roleDisplayNames } from "@/lib/roles";

function getUserDisplayName(user: ClerkUser) {
    if (user.firstName || user.lastName) {
        return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email || "Unknown User";
}

export function TeamManagementTab() {
    const { user: currentUser } = useUser();
    const [users, setUsers] = useState<ClerkUser[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        const result = await listClerkUsers();
        if (result.success && result.users) {
            setUsers(result.users);
        } else {
            setError(result.error || "Failed to load users");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setUpdatingRoles((prev) => new Set(prev).add(userId));

        const result = await updateUserRole(userId, newRole);
        if (result.success) {
            toast.success("Role updated successfully");
            // Update local state
            setUsers((prev) =>
                prev?.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                ) ?? null
            );
        } else {
            toast.error(result.error || "Failed to update role");
        }
        setUpdatingRoles((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
        });
    };

    const handleDelete = async (userId: string) => {
        const result = await deleteUser(userId);
        if (result.success) {
            toast.success("User deleted successfully");
            // Update local state
            setUsers((prev) => prev?.filter((user) => user.id !== userId) ?? null);
        } else {
            toast.error(result.error || "Failed to delete user");
            throw new Error(result.error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading team members...</span>
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState title={error}>
                <Button onClick={fetchUsers} variant="outline" className="mt-4">
                    Try Again
                </Button>
            </EmptyState>
        );
    }

    if (!users || users.length === 0) {
        return <EmptyState title="No team members found" />;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <span className="font-medium">
                                    {getUserDisplayName(user)}
                                </span>
                            </TableCell>
                            <TableCell>{user.email || "-"}</TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                    <Select
                                        value={user.role || "staff"}
                                        onValueChange={(value) =>
                                            handleRoleChange(user.id, value as UserRole)
                                        }
                                        disabled={updatingRoles.has(user.id)}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue>
                                                {roleDisplayNames[user.role || "staff"]}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="staff">
                                                {roleDisplayNames.staff}
                                            </SelectItem>
                                            <SelectItem value="trusted">
                                                {roleDisplayNames.trusted}
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                {roleDisplayNames.admin}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {updatingRoles.has(user.id) && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {user.id !== currentUser?.id && (
                                    <DeleteConfirmDialog
                                        title="Delete Team Member"
                                        description="This action cannot be undone. This will permanently delete this user from the system."
                                        confirmText={user.email || ""}
                                        onDelete={() => handleDelete(user.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{getUserDisplayName(user)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{user.email || "No email"}</span>
                                        </div>
                                    </DeleteConfirmDialog>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
