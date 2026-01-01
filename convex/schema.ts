import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const offerRule = v.union(
    v.object({
        kind: v.literal("frequency"),
        requiredCount: v.number(),
    }),
    v.object({
        kind: v.literal("raffle"),
    })
);

export const offerEffect = v.union(
    v.object({
        kind: v.literal("percent_off"),
        percent: v.number(),
    }),
    v.object({
        kind: v.literal("raffle_entry"),
    })
);

export const offerStatus = v.union(v.literal("active"), v.literal("discontinued"));


export default defineSchema({
    customers: defineTable({
        phoneE164: v.string(),
        firstName: v.string(),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
        // Concatenated field for full-text search (firstName + lastName + email + phone)
        searchText: v.string(),
        welcomeSmsSent: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_phone", ["phoneE164"])
        .searchIndex("search_customers", {
            searchField: "searchText",
        }),

    offers: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        color: v.string(),
        status: offerStatus,
        rule: offerRule,
        effect: offerEffect,
        createdAt: v.number(),
        updatedAt: v.number(),
        discontinuedAt: v.optional(v.number()),
    }).index("by_status", ["status"]),

    offerEvents: defineTable({
        customerId: v.id("customers"),
        offerId: v.id("offers"),
        type: v.literal("QUALIFY"),
        createdByClerkUserId: v.string(),
        createdAt: v.number(),
    })
        .index("by_customer", ["customerId"])
        .index("by_offer", ["offerId"])
        .index("by_customer_offer", ["customerId", "offerId"])
        .index("by_createdAt", ["createdAt"])
        .index("by_clerk_user", ["createdByClerkUserId"]),
});
