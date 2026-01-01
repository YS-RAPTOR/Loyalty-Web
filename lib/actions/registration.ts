"use server";

import { api } from "@/convex/_generated/api";
import { convex } from "@/lib/convex";
import { sendOtp, verifyOtp } from "@/lib/twilio";
import { normalizeAuPhone } from "./utils";
import { sendWelcomeSms } from "./sms";

function formatRetryAfter(ms: number): string {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
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
        const client = convex();

        // Check rate limit first
        const rateLimit = await client.mutation(api.rateLimits.checkOtpSendLimit, {
            phoneE164,
        });

        if (!rateLimit.ok) {
            const retryIn = formatRetryAfter(rateLimit.retryAfter ?? 60000);
            return {
                success: false,
                error: `Too many OTP requests. Please try again in ${retryIn}.`,
            };
        }

        // Check if phone already exists
        const existingCustomer = await client.query(api.customers.getByPhone, {
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
        const client = convex();

        // Check rate limit first
        const rateLimit = await client.mutation(api.rateLimits.checkOtpVerifyLimit, {
            phoneE164,
        });

        if (!rateLimit.ok) {
            const retryIn = formatRetryAfter(rateLimit.retryAfter ?? 60000);
            return {
                success: false,
                error: `Too many verification attempts. Please try again in ${retryIn}.`,
            };
        }

        const result = await verifyOtp(phoneE164, code);

        if (!result.success) {
            return { success: false, error: result.error || "Invalid OTP" };
        }

        // Reset rate limit on successful verification
        await client.mutation(api.rateLimits.resetOtpVerifyLimit, { phoneE164 });

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
        const client = convex();

        // Check rate limit first (use phone as identifier)
        const rateLimit = await client.mutation(api.rateLimits.checkCustomerCreationLimit, {
            identifier: data.phoneE164,
        });

        if (!rateLimit.ok) {
            const retryIn = formatRetryAfter(rateLimit.retryAfter ?? 60000);
            return {
                success: false,
                error: `Too many registration attempts. Please try again in ${retryIn}.`,
            };
        }

        // Create customer in Convex
        const customerId = await client.mutation(api.customers.create, {
            phoneE164: data.phoneE164,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
        });

        // Send welcome SMS (don't block on failure)
        try {
            await sendWelcomeSms(customerId, data.phoneE164, data.firstName);
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
