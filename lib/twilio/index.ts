import twilio from "twilio";
import { serverConfig } from "@/lib/config";

function getClient() {
    return twilio(serverConfig.twilio.accountSid, serverConfig.twilio.authToken);
}

/**
 * Send OTP to a phone number using Twilio Verify
 */
export async function sendOtp(
    phoneE164: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = getClient();
        const verification = await client.verify.v2
            .services(serverConfig.twilio.verifyServiceSid)
            .verifications.create({
                to: phoneE164,
                channel: "sms",
            });

        if (verification.status === "pending") {
            return { success: true };
        }

        return {
            success: false,
            error: `Unexpected verification status: ${verification.status}`,
        };
    } catch (error) {
        console.error("Twilio sendOtp error:", error);

        if (error instanceof Error) {
            // Handle specific Twilio error codes
            const twilioError = error as { code?: number; message?: string };

            if (twilioError.code === 60203) {
                return {
                    success: false,
                    error: "Too many OTP requests. Please wait before trying again.",
                };
            }

            if (twilioError.code === 60200) {
                return { success: false, error: "Invalid phone number." };
            }

            return {
                success: false,
                error: twilioError.message || "Failed to send OTP",
            };
        }

        return { success: false, error: "Failed to send OTP" };
    }
}

/**
 * Verify OTP code for a phone number using Twilio Verify
 */
export async function verifyOtp(
    phoneE164: string,
    code: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = getClient();
        const verificationCheck = await client.verify.v2
            .services(serverConfig.twilio.verifyServiceSid)
            .verificationChecks.create({
                to: phoneE164,
                code: code,
            });

        if (verificationCheck.status === "approved") {
            return { success: true };
        }

        // Status is "pending" when code is incorrect
        return { success: false, error: "Invalid OTP code" };
    } catch (error) {
        console.error("Twilio verifyOtp error:", error);

        if (error instanceof Error) {
            const twilioError = error as { code?: number; message?: string };

            // 60202: Max check attempts reached
            if (twilioError.code === 60202) {
                return {
                    success: false,
                    error: "Too many incorrect attempts. Please request a new code.",
                };
            }

            // 20404: Verification not found (expired or already verified)
            if (twilioError.code === 20404) {
                return {
                    success: false,
                    error: "Verification code expired. Please request a new code.",
                };
            }

            return {
                success: false,
                error: twilioError.message || "Failed to verify OTP",
            };
        }

        return { success: false, error: "Failed to verify OTP" };
    }
}

/**
 * Send SMS to a phone number
 * Stub: logs to console
 */
export async function sendSms(
    phoneE164: string,
    message: string
): Promise<{ success: boolean }> {
    console.log(`[STUB] SMS to ${phoneE164}: ${message}`);
    return { success: false };
}
