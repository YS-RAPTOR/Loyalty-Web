import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
    // OTP send: 3 per phone per 10 minutes
    otpSend: {
        kind: "token bucket",
        rate: 3,
        period: 10 * MINUTE,
        capacity: 3,
    },

    // OTP verify: 5 attempts then lockout (resets after 10 minutes)
    otpVerify: {
        kind: "token bucket",
        rate: 5,
        period: 10 * MINUTE,
        capacity: 5,
    },

    // Customer creation: 5 per identifier per hour
    customerCreation: {
        kind: "token bucket",
        rate: 5,
        period: HOUR,
        capacity: 5,
    },
});

/**
 * Check and consume rate limit for OTP send
 */
export const checkOtpSendLimit = mutation({
    args: { phoneE164: v.string() },
    handler: async (ctx, args) => {
        const result = await rateLimiter.limit(ctx, "otpSend", {
            key: args.phoneE164,
        });
        return {
            ok: result.ok,
            retryAfter: result.retryAfter,
        };
    },
});

/**
 * Check and consume rate limit for OTP verify
 */
export const checkOtpVerifyLimit = mutation({
    args: { phoneE164: v.string() },
    handler: async (ctx, args) => {
        const result = await rateLimiter.limit(ctx, "otpVerify", {
            key: args.phoneE164,
        });
        return {
            ok: result.ok,
            retryAfter: result.retryAfter,
        };
    },
});

/**
 * Reset OTP verify limit on successful verification
 */
export const resetOtpVerifyLimit = mutation({
    args: { phoneE164: v.string() },
    handler: async (ctx, args) => {
        await rateLimiter.reset(ctx, "otpVerify", { key: args.phoneE164 });
    },
});

/**
 * Check and consume rate limit for customer creation
 */
export const checkCustomerCreationLimit = mutation({
    args: { identifier: v.string() },
    handler: async (ctx, args) => {
        const result = await rateLimiter.limit(ctx, "customerCreation", {
            key: args.identifier,
        });
        return {
            ok: result.ok,
            retryAfter: result.retryAfter,
        };
    },
});
