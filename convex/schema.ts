import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    customers: defineTable({
        phoneE164: v.string(),
        firstName: v.string(),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
        welcomeSmsSent: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_phone", ["phoneE164"]),
});
