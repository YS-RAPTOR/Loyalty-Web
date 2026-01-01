import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { offerRule, offerEffect, offerStatus } from "./schema";
import { requireRole } from "./auth";

// Query offers by status (requires admin role - used on admin dashboard)
export const listByStatus = query({
    args: { status: offerStatus },
    handler: async (ctx, args) => {
        // Require admin role
        await requireRole(ctx, "admin");

        return await ctx.db
            .query("offers")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .collect();
    },
});

// Get a single offer by ID (requires staff role)
export const getById = query({
    args: { id: v.id("offers") },
    handler: async (ctx, args) => {
        // Require staff role
        await requireRole(ctx, "staff");

        return await ctx.db.get(args.id);
    },
});

// Create a new offer (requires admin role)
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        color: v.string(),
        rule: offerRule,
        effect: offerEffect,
    },
    handler: async (ctx, args) => {
        // Require admin role
        await requireRole(ctx, "admin");

        const now = Date.now();
        const offerId = await ctx.db.insert("offers", {
            name: args.name,
            description: args.description,
            color: args.color,
            status: "active",
            rule: args.rule,
            effect: args.effect,
            createdAt: now,
            updatedAt: now,
        });

        return offerId;
    },
});

// Update an existing offer (requires admin role)
// Note: name, description, color, effect only - rule cannot be changed
export const update = mutation({
    args: {
        id: v.id("offers"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        effect: v.optional(offerEffect),
    },
    handler: async (ctx, args) => {
        // Require admin role
        await requireRole(ctx, "admin");

        const offer = await ctx.db.get(args.id);
        if (!offer) {
            throw new Error("Offer not found");
        }

        const updates: Record<string, unknown> = {
            updatedAt: Date.now(),
        };

        if (args.name !== undefined) updates.name = args.name;
        if (args.description !== undefined) updates.description = args.description || undefined;
        if (args.color !== undefined) updates.color = args.color;
        if (args.effect !== undefined) updates.effect = args.effect;

        await ctx.db.patch(args.id, updates);

        return args.id;
    },
});

// Discontinue an offer (requires admin role)
export const discontinue = mutation({
    args: { id: v.id("offers") },
    handler: async (ctx, args) => {
        // Require admin role
        await requireRole(ctx, "admin");

        const offer = await ctx.db.get(args.id);
        if (!offer) {
            throw new Error("Offer not found");
        }

        if (offer.status === "discontinued") {
            throw new Error("Offer is already discontinued");
        }

        const now = Date.now();
        await ctx.db.patch(args.id, {
            status: "discontinued",
            discontinuedAt: now,
            updatedAt: now,
        });

        return args.id;
    },
});

// Restart a discontinued offer (requires admin role)
export const restart = mutation({
    args: { id: v.id("offers") },
    handler: async (ctx, args) => {
        // Require admin role
        await requireRole(ctx, "admin");

        const offer = await ctx.db.get(args.id);
        if (!offer) {
            throw new Error("Offer not found");
        }

        if (offer.status === "active") {
            throw new Error("Offer is already active");
        }

        await ctx.db.patch(args.id, {
            status: "active",
            discontinuedAt: undefined,
            updatedAt: Date.now(),
        });

        return args.id;
    },
});
