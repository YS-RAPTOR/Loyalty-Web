/**
 * Twilio service stubs for development
 * Replace with real Twilio implementation when ready
 */

// In-memory store for OTP codes (development only)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * Send OTP to a phone number
 * Stub: stores a fake code and logs to console
 */
export async function sendOtp(
    phoneE164: string,
): Promise<{ success: boolean }> {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(phoneE164, { code, expiresAt });

    // TODO: Replace with real Twilio Verify API call
    // const client = twilio(serverConfig.twilio.accountSid, serverConfig.twilio.authToken);
    // await client.verify.v2.services(serverConfig.twilio.verifyServiceSid)
    //   .verifications.create({ to: phoneE164, channel: 'sms' });

    console.log(`[STUB] OTP for ${phoneE164}: ${code}`);

    return { success: true };
}

/**
 * Verify OTP code for a phone number
 * Stub: checks against in-memory store
 */
export async function verifyOtp(
    phoneE164: string,
    code: string,
): Promise<{ success: boolean; error?: string }> {
    const stored = otpStore.get(phoneE164);

    if (!stored) {
        return { success: false, error: "No OTP sent to this number" };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(phoneE164);
        return { success: false, error: "OTP has expired" };
    }

    if (stored.code !== code) {
        return { success: false, error: "Invalid OTP code" };
    }

    // TODO: Replace with real Twilio Verify API call
    // const client = twilio(serverConfig.twilio.accountSid, serverConfig.twilio.authToken);
    // const verification = await client.verify.v2.services(serverConfig.twilio.verifyServiceSid)
    //   .verificationChecks.create({ to: phoneE164, code });
    // if (verification.status !== 'approved') {
    //   return { success: false, error: 'Invalid OTP code' };
    // }

    otpStore.delete(phoneE164);
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
    // TODO: Replace with real Twilio API call
    // const client = twilio(serverConfig.twilio.accountSid, serverConfig.twilio.authToken);
    // await client.messages.create({
    //   to: phoneE164,
    //   from: serverConfig.twilio.senderName,
    //   body: message,
    // });

    console.log(`[STUB] SMS to ${phoneE164}: ${message}`);

    return { success: true };
}
