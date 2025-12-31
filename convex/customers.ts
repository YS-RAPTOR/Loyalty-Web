import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByPhone = query({
    args: { phoneE164: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("customers")
            .withIndex("by_phone", (q) => q.eq("phoneE164", args.phoneE164))
            .unique();
    },
});

export const getById = query({
    args: { id: v.id("customers") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        phoneE164: v.string(),
        firstName: v.string(),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check for duplicate phone
        const existing = await ctx.db
            .query("customers")
            .withIndex("by_phone", (q) => q.eq("phoneE164", args.phoneE164))
            .unique();

        if (existing) {
            throw new Error("Customer with this phone number already exists");
        }

        const now = Date.now();
        const customerId = await ctx.db.insert("customers", {
            phoneE164: args.phoneE164,
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email,
            welcomeSmsSent: false,
            createdAt: now,
            updatedAt: now,
        });

        return customerId;
    },
});

export const markWelcomeSmsSent = mutation({
    args: { id: v.id("customers") },
    handler: async (ctx, args) => {
        const customer = await ctx.db.get(args.id);
        if (!customer) {
            throw new Error("Customer not found");
        }

        await ctx.db.patch(args.id, {
            welcomeSmsSent: true,
            updatedAt: Date.now(),
        });
    },
});
