"use server";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import { sendSms } from "@/lib/twilio";
import { buildQrUrl } from "./utils";

/**
 * Send the welcome SMS to a newly registered customer
 */
export async function sendWelcomeSms(
    customerId: Id<"customers">,
    phoneE164: string,
    firstName: string,
): Promise<{ success: boolean; error?: string }> {
    const qrUrl = buildQrUrl(customerId);
    const message = `Welcome to our loyalty program, ${firstName}! Your QR code is ready: ${qrUrl}`;

    try {
        const result = await sendSms(phoneE164, message);

        if (result.success) {
            await convex().mutation(api.customers.markWelcomeSmsSent, {
                id: customerId,
            });
            return { success: true };
        }

        console.error("Welcome SMS failed to send for customer:", customerId);
        return { success: false, error: "Failed to send SMS" };
    } catch (error) {
        console.error("Welcome SMS error:", error);
        return { success: false, error: "Failed to send SMS" };
    }
}

/**
 * Resend the QR link SMS to an existing customer
 */
export async function sendQrLinkSms(
    customerId: Id<"customers">,
    phoneE164: string,
): Promise<{ success: boolean; error?: string }> {
    const qrUrl = buildQrUrl(customerId);
    const message = `Your loyalty QR code is ready! View it here: ${qrUrl}`;

    try {
        const result = await sendSms(phoneE164, message);

        if (result.success) {
            return { success: true };
        }

        return { success: false, error: "Failed to send SMS" };
    } catch (error) {
        console.error("Send QR link SMS error:", error);
        return { success: false, error: "Failed to send SMS" };
    }
}
