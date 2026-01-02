function required<T>(value: T | undefined, name: string): T {
    if (value === undefined || value === "") {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

// Determine the app URL from Vercel env vars or fallback
function getAppUrl(): string {
    // Explicit override takes priority
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    // Vercel production URL (e.g., "myapp.vercel.app" or custom domain)
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    // Vercel preview/branch URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Local development fallback
    return "http://localhost:3000";
}

// Client config (safe to use in client components)
// NEXT_PUBLIC_* variables must be accessed statically for Next.js to inline them
export const clientConfig = {
    appUrl: getAppUrl(),
    clerk: {
        publishableKey: required(
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        ),
    },
    convex: {
        url: required(
            process.env.NEXT_PUBLIC_CONVEX_URL,
            "NEXT_PUBLIC_CONVEX_URL",
        ),
    },
} as const;

// Server-only config (use in API routes, server components, middleware)
// Uses getters to defer validation until the value is actually accessed
export const serverConfig = {
    clerk: {
        get secretKey() {
            return required(process.env.CLERK_SECRET_KEY, "CLERK_SECRET_KEY");
        },
        get jwtIssuerDomain() {
            return required(
                process.env.CLERK_JWT_ISSUER_DOMAIN,
                "CLERK_JWT_ISSUER_DOMAIN",
            );
        },
    },
    convex: {
        get deployment() {
            return required(process.env.CONVEX_DEPLOYMENT, "CONVEX_DEPLOYMENT");
        },
    },
    twilio: {
        get accountSid() {
            return required(
                process.env.TWILIO_ACCOUNT_SID,
                "TWILIO_ACCOUNT_SID",
            );
        },
        get authToken() {
            return required(process.env.TWILIO_AUTH_TOKEN, "TWILIO_AUTH_TOKEN");
        },
        // Verify Service for OTP
        get verifyServiceSid() {
            return required(
                process.env.TWILIO_VERIFY_SERVICE_SID,
                "TWILIO_VERIFY_SERVICE_SID",
            );
        },
        // Alphanumeric Sender ID for outbound SMS (welcome message, resend QR link)
        // e.g. "LoyaltyApp" - max 11 characters, letters and numbers only
        get senderName() {
            return required(
                process.env.TWILIO_SENDER_NAME,
                "TWILIO_SENDER_NAME",
            );
        },
    },
} as const;
