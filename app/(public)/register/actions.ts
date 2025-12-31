"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import { sendOtp, verifyOtp, sendSms } from "@/lib/twilio";

/**
 * Normalize Australian phone number to E.164 format
 */
function normalizeAuPhone(phone: string): string | null {
    const cleaned = phone.replace(/[\s\-()]/g, "");

    if (/^\+61[2-9]\d{8}$/.test(cleaned)) return cleaned;
    if (/^61[2-9]\d{8}$/.test(cleaned)) return `+${cleaned}`;
    if (/^0[2-9]\d{8}$/.test(cleaned)) return `+61${cleaned.slice(1)}`;

    return null;
}

export async function sendOtpAction(phone: string): Promise<{
    success: boolean;
    error?: string;
    phoneE164?: string;
    alreadyRegistered?: boolean;
}> {
    if (!phone || typeof phone !== "string") {
        return { success: false, error: "Phone number is required" };
    }

    const phoneE164 = normalizeAuPhone(phone);
    if (!phoneE164) {
        return { success: false, error: "Invalid Australian phone number" };
    }

    try {
        // Check if phone already exists
        const existingCustomer = await convex.query(api.customers.getByPhone, {
            phoneE164,
        });

        if (existingCustomer) {
            return { success: false, alreadyRegistered: true };
        }

        const result = await sendOtp(phoneE164);

        if (!result.success) {
            return { success: false, error: "Failed to send OTP" };
        }

        return { success: true, phoneE164 };
    } catch (error) {
        console.error("Send OTP error:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

export async function verifyOtpAction(
    phone: string,
    code: string,
): Promise<{ success: boolean; error?: string }> {
    if (!phone || typeof phone !== "string") {
        return { success: false, error: "Phone number is required" };
    }

    if (!code || typeof code !== "string") {
        return { success: false, error: "OTP code is required" };
    }

    const phoneE164 = normalizeAuPhone(phone);
    if (!phoneE164) {
        return { success: false, error: "Invalid Australian phone number" };
    }

    try {
        const result = await verifyOtp(phoneE164, code);

        if (!result.success) {
            return { success: false, error: result.error || "Invalid OTP" };
        }

        return { success: true };
    } catch (error) {
        console.error("Verify OTP error:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

export async function createCustomerAction(data: {
    phoneE164: string;
    firstName: string;
    lastName?: string;
    email?: string;
}): Promise<{
    success: boolean;
    customerId?: string;
    error?: string;
    alreadyRegistered?: boolean;
}> {
    try {
        // Create customer in Convex
        const customerId = await convex.mutation(api.customers.create, {
            phoneE164: data.phoneE164,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
        });

        // Send welcome SMS (don't block on failure)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const qrLink = `${baseUrl}/qr?id=${customerId}`;
        const message = `Welcome to our loyalty program, ${data.firstName}! Your QR code is ready: ${qrLink}`;

        try {
            const smsResult = await sendSms(data.phoneE164, message);

            if (smsResult.success) {
                await convex.mutation(api.customers.markWelcomeSmsSent, {
                    id: customerId,
                });
            } else {
                console.error(
                    "Welcome SMS failed to send for customer:",
                    customerId,
                );
            }
        } catch (smsError) {
            console.error("Welcome SMS error:", smsError);
            // Don't fail the registration if SMS fails
        }

        return { success: true, customerId };
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("already exists")
        ) {
            return { success: false, alreadyRegistered: true };
        }
        console.error("Create customer error:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}
