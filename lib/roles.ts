// Role types for the admin portal
export type UserRole = "admin" | "staff" | "trusted";

// Role hierarchy - higher index = more permissions
const roleHierarchy: UserRole[] = ["staff", "trusted", "admin"];

/**
 * Check if a user has at least the minimum required role
 */
export function hasMinRoles(userRole: UserRole | undefined, minRole: UserRole): boolean {
    if (!userRole) return false;

    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const minRoleIndex = roleHierarchy.indexOf(minRole);

    return userRoleIndex >= minRoleIndex;
}


/**
 * Get role from Clerk user publicMetadata
 */
export function getRoleFromPublicMetadata(publicMetadata: unknown): UserRole | undefined {
    if (!publicMetadata || typeof publicMetadata !== "object") return undefined;
    const role = (publicMetadata as Record<string, unknown>).role;
    if (typeof role === "string" && roleHierarchy.includes(role as UserRole)) {
        return role as UserRole;
    }
    return undefined;
}

/**
 * @deprecated Use getRoleFromPublicMetadata with currentUser().publicMetadata instead
 * Get role from Clerk session claims metadata (for middleware only)
 */
export function getRoleFromMetadata(metadata: unknown): UserRole | undefined {
    return getRoleFromPublicMetadata(metadata);
}

/**
 * Role display names
 */
export const roleDisplayNames: Record<UserRole, string> = {
    admin: "Admin",
    staff: "Staff",
    trusted: "Trusted Staff",
};

/**
 * Role descriptions
 */
export const roleDescriptions: Record<UserRole, string> = {
    admin: "Full access: offers, invites, events audit log",
    staff: "Search customers, view profiles, log qualifying orders",
    trusted: "Staff abilities + edit customers, resend QR links",
};
