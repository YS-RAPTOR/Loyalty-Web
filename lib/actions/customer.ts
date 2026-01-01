"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import { hasMinRoles, getRoleFromPublicMetadata } from "@/lib/roles";
import { sendQrLinkSms } from "./sms";

/**
 * Resend QR link SMS to a customer
 * Requires trusted or admin role
 */
export async function resendQrAction(
    customerId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        // Verify authentication
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Check for trusted or admin role
        const user = await currentUser();
        const role = getRoleFromPublicMetadata(user?.publicMetadata);
        if (!hasMinRoles(role, "trusted")) {
            return { success: false, error: "Insufficient permissions" };
        }

        // Get customer from Convex
        const customer = await convex().query(api.customers.getById, {
            id: customerId as Id<"customers">,
        });

        if (!customer) {
            return { success: false, error: "Customer not found" };
        }

        // Send SMS
        const result = await sendQrLinkSms(customer._id, customer.phoneE164);

        return result;
    } catch (error) {
        console.error("Error resending QR link:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}
