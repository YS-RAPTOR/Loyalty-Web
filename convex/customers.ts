import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

/**
 * Build searchText field from customer data.
 * Concatenates all searchable fields into a single string for full-text search.
 */
function buildSearchText(data: {
    firstName: string;
    lastName?: string;
    email?: string;
    phoneE164: string;
}): string {
    const parts = [
        data.firstName,
        data.lastName || "",
        data.email || "",
        data.phoneE164,
        // Add phone without + for easier searching
        data.phoneE164.replace(/^\+/, ""),
    ];
    return parts.filter(Boolean).join(" ").toLowerCase();
}

export const getByPhone = query({
    args: { phoneE164: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("customers")
            .withIndex("by_phone", (q) => q.eq("phoneE164", args.phoneE164))
            .unique();
    },
});

// Get customer by ID (public - used for QR code display and admin pages)
// Note: This is intentionally public as customers access their own data via QR URL
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
        const searchText = buildSearchText({
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email,
            phoneE164: args.phoneE164,
        });

        const customerId = await ctx.db.insert("customers", {
            phoneE164: args.phoneE164,
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email,
            searchText,
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

/**
 * Full-text search for customers (requires staff role).
 * Uses Convex's built-in search index for efficient typeahead search.
 * Searches across firstName, lastName, email, and phone.
 */
export const search = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        // Require staff role
        await requireRole(ctx, "staff");

        const searchQuery = args.query.trim();

        if (!searchQuery) {
            return [];
        }

        // Use the full-text search index
        const results = await ctx.db
            .query("customers")
            .withSearchIndex("search_customers", (q) =>
                q.search("searchText", searchQuery)
            )
            .take(50);

        return results;
    },
});

// Update customer profile (requires trusted role)
export const update = mutation({
    args: {
        id: v.id("customers"),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
        phoneE164: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Require trusted or higher role
        await requireRole(ctx, "trusted");

        const customer = await ctx.db.get(args.id);
        if (!customer) {
            throw new Error("Customer not found");
        }

        // If phone is being changed, check for duplicates
        if (args.phoneE164 && args.phoneE164 !== customer.phoneE164) {
            const newPhone = args.phoneE164;
            const existing = await ctx.db
                .query("customers")
                .withIndex("by_phone", (q) => q.eq("phoneE164", newPhone))
                .unique();

            if (existing) {
                throw new Error("Another customer with this phone number already exists");
            }
        }

        // Build updated data for searchText
        const updatedData = {
            firstName: args.firstName ?? customer.firstName,
            lastName: args.lastName ?? customer.lastName,
            email: args.email ?? customer.email,
            phoneE164: args.phoneE164 ?? customer.phoneE164,
        };

        const updates: Record<string, unknown> = {
            updatedAt: Date.now(),
            searchText: buildSearchText(updatedData),
        };

        if (args.firstName !== undefined) updates.firstName = args.firstName;
        if (args.lastName !== undefined) updates.lastName = args.lastName;
        if (args.email !== undefined) updates.email = args.email;
        if (args.phoneE164 !== undefined) updates.phoneE164 = args.phoneE164;

        await ctx.db.patch(args.id, updates);

        return args.id;
    },
});

