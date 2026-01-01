import { z } from "zod";

/**
 * User roles
 */
export const userRoleSchema = z.enum(["staff", "trusted", "admin"]);

export type UserRole = z.infer<typeof userRoleSchema>;

/**
 * Invite member form schema
 */
export const inviteMemberSchema = z.object({
    email: z
        .email("Please enter a valid email address")
        .max(254, "Email must be less than 254 characters"),
    role: userRoleSchema,
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

/**
 * Validate invite member form data
 */
export function validateInviteMember(data: unknown): {
    success: boolean;
    data?: InviteMemberFormData;
    errors?: Record<string, string>;
} {
    const result = inviteMemberSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) {
            errors[path] = issue.message;
        }
    }

    return { success: false, errors };
}
