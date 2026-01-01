"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
    getRoleFromPublicMetadata,
    hasMinRoles,
    type UserRole,
} from "@/lib/roles";
import { clientConfig } from "@/lib/config";

export type ClerkUser = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: UserRole | null;
};

/**
 * Helper to verify admin role
 */
async function verifyAdminRole(): Promise<{
    authorized: boolean;
    userId?: string;
    error?: string;
}> {
    const { userId } = await auth();

    if (!userId) {
        return { authorized: false, error: "Unauthorized" };
    }

    const user = await currentUser();
    const role = getRoleFromPublicMetadata(user?.publicMetadata);
    if (!hasMinRoles(role, "admin")) {
        return { authorized: false, error: "Insufficient permissions - admin role required" };
    }

    return { authorized: true, userId };
}

/**
 * Fetch all Clerk users for the organization
 * Requires admin role
 * Returns a map of userId -> user details for easy lookup
 */
export async function getClerkUsers(): Promise<{
    success: boolean;
    users?: Record<string, ClerkUser>;
    error?: string;
}> {
    try {
        const authResult = await verifyAdminRole();
        if (!authResult.authorized) {
            return { success: false, error: authResult.error };
        }

        const client = await clerkClient();

        // Fetch all users (paginated, but for small teams this should be fine)
        // FIXME: Implement proper pagination if needed
        const userList = await client.users.getUserList({ limit: 100 });

        // Build a map of userId -> user details
        const usersMap: Record<string, ClerkUser> = {};
        for (const user of userList.data) {
            usersMap[user.id] = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.primaryEmailAddress?.emailAddress ?? null,
                role: getRoleFromPublicMetadata(user.publicMetadata) ?? null,
            };
        }

        return { success: true, users: usersMap };
    } catch (error) {
        console.error("Error fetching Clerk users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

/**
 * Fetch all Clerk users as a list (for table display)
 * Requires admin role
 */
export async function listClerkUsers(): Promise<{
    success: boolean;
    users?: ClerkUser[];
    error?: string;
}> {
    try {
        const authResult = await verifyAdminRole();
        if (!authResult.authorized) {
            return { success: false, error: authResult.error };
        }

        const client = await clerkClient();
        const userList = await client.users.getUserList({ limit: 100 });

        const users: ClerkUser[] = userList.data.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.primaryEmailAddress?.emailAddress ?? null,
            role: getRoleFromPublicMetadata(user.publicMetadata) ?? null,
        }));

        return { success: true, users };
    } catch (error) {
        console.error("Error listing Clerk users:", error);
        return { success: false, error: "Failed to list users" };
    }
}

/**
 * Invite a new user via Clerk
 * Requires admin role
 */
export async function inviteUser(email: string, role: UserRole): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const authResult = await verifyAdminRole();
        if (!authResult.authorized) {
            return { success: false, error: authResult.error };
        }

        if (!email || !email.includes("@")) {
            return { success: false, error: "Invalid email address" };
        }

        const validRoles: UserRole[] = ["admin", "staff", "trusted"];
        if (!validRoles.includes(role)) {
            return { success: false, error: "Invalid role" };
        }

        const client = await clerkClient();

        await client.invitations.createInvitation({
            emailAddress: email,
            publicMetadata: { role },
            redirectUrl: `${clientConfig.appUrl}/admin`,
            ignoreExisting: false,
        });

        return { success: true };
    } catch (error) {
        console.error("Error inviting user:", error);
        const message = error instanceof Error ? error.message : "Failed to invite user";
        // Check for common Clerk errors
        if (message.includes("already exists")) {
            return { success: false, error: "An invitation for this email already exists" };
        }
        return { success: false, error: message };
    }
}

/**
 * Update a user's role
 * Requires admin role
 */
export async function updateUserRole(
    targetUserId: string,
    newRole: UserRole
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const authResult = await verifyAdminRole();
        if (!authResult.authorized) {
            return { success: false, error: authResult.error };
        }

        // Prevent admin from changing their own role
        if (targetUserId === authResult.userId) {
            return { success: false, error: "Cannot change your own role" };
        }

        const validRoles: UserRole[] = ["admin", "staff", "trusted"];
        if (!validRoles.includes(newRole)) {
            return { success: false, error: "Invalid role" };
        }

        const client = await clerkClient();

        await client.users.updateUserMetadata(targetUserId, {
            publicMetadata: { role: newRole },
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update user role" };
    }
}

/**
 * Delete a user from Clerk
 * Requires admin role
 */
export async function deleteUser(targetUserId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const authResult = await verifyAdminRole();
        if (!authResult.authorized) {
            return { success: false, error: authResult.error };
        }

        // Prevent admin from deleting themselves
        if (targetUserId === authResult.userId) {
            return { success: false, error: "Cannot delete your own account" };
        }

        const client = await clerkClient();

        await client.users.deleteUser(targetUserId);

        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
