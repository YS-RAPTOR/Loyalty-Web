/**
 * Twilio service stubs for development
 * Replace with real Twilio implementation when ready
 */

const STUB_OTP_CODE = "111111";

/**
 * Send OTP to a phone number
 * Stub: logs to console
 */
export async function sendOtp(
    phoneE164: string,
): Promise<{ success: boolean }> {
    console.log(`[STUB] OTP for ${phoneE164}: ${STUB_OTP_CODE}`);
    return { success: true };
}

/**
 * Verify OTP code for a phone number
 * Stub: checks if code is 111111
 */
export async function verifyOtp(
    phoneE164: string,
    code: string,
): Promise<{ success: boolean; error?: string }> {
    if (code !== STUB_OTP_CODE) {
        return { success: false, error: "Invalid OTP code" };
    }
    return { success: true };
}

/**
 * Send SMS to a phone number
 * Stub: logs to console
 */
export async function sendSms(
    phoneE164: string,
    message: string,
): Promise<{ success: boolean }> {
    console.log(`[STUB] SMS to ${phoneE164}: ${message}`);
    return { success: true };
}
