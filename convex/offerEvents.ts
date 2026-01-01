import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

// Log a qualifying event for a customer/offer (requires staff role)
export const logQualifyingEvent = mutation({
    args: {
        customerId: v.id("customers"),
        offerId: v.id("offers"),
    },
    handler: async (ctx, args) => {
        // Require staff or higher role, and get the user ID from auth
        const user = await requireRole(ctx, "staff");

        // Verify customer exists
        const customer = await ctx.db.get(args.customerId);
        if (!customer) {
            throw new Error("Customer not found");
        }

        // Verify offer exists and is active
        const offer = await ctx.db.get(args.offerId);
        if (!offer) {
            throw new Error("Offer not found");
        }

        if (offer.status !== "active") {
            throw new Error("Cannot log event for discontinued offer");
        }

        const eventId = await ctx.db.insert("offerEvents", {
            customerId: args.customerId,
            offerId: args.offerId,
            type: "QUALIFY",
            createdByClerkUserId: user.userId,
            createdAt: Date.now(),
        });

        return eventId;
    },
});


// Get progress for a customer on an offer (requires staff role)
export const getProgress = query({
    args: {
        customerId: v.id("customers"),
        offerId: v.id("offers"),
    },
    handler: async (ctx, args) => {
        // Require staff role
        await requireRole(ctx, "staff");

        const events = await ctx.db
            .query("offerEvents")
            .withIndex("by_customer_offer", (q) =>
                q.eq("customerId", args.customerId).eq("offerId", args.offerId)
            )
            .collect();

        return events.length;
    },
});

// Get all events (requires admin role - for audit log)
export const listAll = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        // Require admin role
        await requireRole(ctx, "admin");

        // Use by_createdAt index for consistent time-based ordering
        const results = await ctx.db
            .query("offerEvents")
            .withIndex("by_createdAt")
            .order("desc")
            .paginate(args.paginationOpts);

        // Denormalize customer and offer data for display
        // This follows the relationship pattern: fetch via ID, then enrich
        const enrichedPage = await Promise.all(
            results.page.map(async (event) => {
                const customer = await ctx.db.get(event.customerId);
                const offer = await ctx.db.get(event.offerId);

                return {
                    ...event,
                    customer: customer
                        ? {
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            phoneE164: customer.phoneE164,
                            email: customer.email,
                        }
                        : null,
                    offer: offer
                        ? {
                            name: offer.name,
                            color: offer.color,
                            rule: offer.rule,
                            effect: offer.effect,
                        }
                        : null,
                };
            })
        );

        return {
            ...results,
            page: enrichedPage,
        };
    },
});

// Delete an event (requires admin role - for mistake correction)
export const deleteEvent = mutation({
    args: { id: v.id("offerEvents") },
    handler: async (ctx, args) => {
        // Require admin role
        await requireRole(ctx, "admin");

        const event = await ctx.db.get(args.id);
        if (!event) {
            throw new Error("Event not found");
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});

// Get customer progress for all active offers (requires staff role)
export const getCustomerProgress = query({
    args: { customerId: v.id("customers") },
    handler: async (ctx, args) => {
        // Require staff role
        await requireRole(ctx, "staff");

        // Get all active offers
        const activeOffers = await ctx.db
            .query("offers")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        // Get all events for this customer
        const events = await ctx.db
            .query("offerEvents")
            .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
            .collect();

        // Calculate progress per offer
        const progressMap = new Map<string, number>();
        for (const event of events) {
            const current = progressMap.get(event.offerId) || 0;
            progressMap.set(event.offerId, current + 1);
        }

        // Build result with offer details and progress
        return activeOffers.map((offer) => {
            const progress = progressMap.get(offer._id) || 0;
            let requiredCount: number | null = null;
            let requirementMet = false;

            if (offer.rule.kind === "frequency") {
                requiredCount = offer.rule.requiredCount;
                requirementMet = progress > 0 && progress % requiredCount === 0;
            }

            return {
                offer,
                progress,
                requiredCount,
                requirementMet,
            };
        });
    },
});
