import { QueryCtx, MutationCtx } from "./_generated/server";

// Role types - must match lib/roles.ts
export type UserRole = "admin" | "staff" | "trusted";

// Role hierarchy - higher index = more permissions
const roleHierarchy: UserRole[] = ["staff", "trusted", "admin"];

/**
 * Check if a user has at least the minimum required role
 */
export function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
    if (!userRole) return false;

    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const minRoleIndex = roleHierarchy.indexOf(minRole);

    return userRoleIndex >= minRoleIndex;
}

/**
 * Extract role from Clerk JWT custom claims
 * Clerk passes publicMetadata.role in the JWT token
 */
function getRoleFromIdentity(identity: { metadata: { role?: string } | null } | null): UserRole | undefined {
    if (!identity) return undefined;

    const role = identity?.metadata?.role;
    if (typeof role === "string" && roleHierarchy.includes(role as UserRole)) {
        return role as UserRole;
    }
    return undefined;
}

/**
 * Get the authenticated user's identity and role.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Clerk includes custom claims at the top level of the identity
    // The role comes from publicMetadata which is included in the JWT
    const role = getRoleFromIdentity(identity as unknown as { metadata: { role?: string } | null } | null);

    return {
        userId: identity.subject, // Clerk user ID
        email: identity.email,
        name: identity.name,
        role,
    };
}

/**
 * Require authentication. Throws if not authenticated.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
        throw new Error("Authentication required");
    }
    return user;
}

/**
 * Require a minimum role. Throws if not authenticated or insufficient permissions.
 */
export async function requireRole(ctx: QueryCtx | MutationCtx, minRole: UserRole) {
    const user = await requireAuth(ctx);

    if (!hasMinRole(user.role, minRole)) {
        throw new Error(`Insufficient permissions. Required role: ${minRole}`);
    }

    return user;
}
