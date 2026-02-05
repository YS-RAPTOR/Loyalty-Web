import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./auth";
import type { Id } from "./_generated/dataModel";

export const getInsights = query({
    args: {
        startDate: v.optional(v.number()), // undefined = no lower bound (all time)
        endDate: v.optional(v.number()), // undefined = no upper bound
    },
    handler: async (ctx, { startDate, endDate }) => {
        await requireRole(ctx, "admin");

        // Helper for date range filtering on indexes
        const withDateRange = (q: any) => {
            if (startDate !== undefined && endDate !== undefined) {
                return q.gte("createdAt", startDate).lte("createdAt", endDate);
            } else if (startDate !== undefined) {
                return q.gte("createdAt", startDate);
            } else if (endDate !== undefined) {
                return q.lte("createdAt", endDate);
            }
            return q;
        };

        // 1. Get customers and events in parallel using index with range bounds
        const [newCustomers, events] = await Promise.all([
            ctx.db.query("customers").withIndex("by_createdAt", withDateRange).collect(),
            ctx.db.query("offerEvents").withIndex("by_createdAt", withDateRange).collect(),
        ]);

        // Early return if no events
        if (events.length === 0) {
            return {
                newCustomersCount: newCustomers.length,
                totalEventsCount: 0,
                activeCustomersCount: 0,
                eventsByOffer: [],
                eventsByStaff: [],
                customerOfferBreakdown: [],
            };
        }

        // 2. Single pass: build all aggregation maps
        const eventsByOfferMap = new Map<string, number>();
        const eventsByStaffMap = new Map<string, number>();
        const customerOfferMap = new Map<string, Map<string, number>>();

        for (const event of events) {
            const { customerId, offerId, createdByClerkUserId } = event;

            eventsByOfferMap.set(offerId, (eventsByOfferMap.get(offerId) || 0) + 1);
            eventsByStaffMap.set(
                createdByClerkUserId,
                (eventsByStaffMap.get(createdByClerkUserId) || 0) + 1
            );

            if (!customerOfferMap.has(customerId)) {
                customerOfferMap.set(customerId, new Map());
            }
            customerOfferMap.get(customerId)!.set(
                offerId,
                (customerOfferMap.get(customerId)!.get(offerId) || 0) + 1
            );
        }

        // 3. Batch fetch all customers and offers in parallel
        const customerIds = Array.from(customerOfferMap.keys()) as Id<"customers">[];
        const [customers, allOffers] = await Promise.all([
            Promise.all(customerIds.map((id) => ctx.db.get(id))),
            ctx.db.query("offers").collect(),
        ]);
        const offersById = new Map(allOffers.map((o) => [o._id as string, o]));

        // 4. Enrich events by offer
        const eventsByOffer = Array.from(eventsByOfferMap.entries()).map(
            ([offerId, count]) => {
                const offer = offersById.get(offerId);
                const isDiscontinued = !offer || offer.status === "discontinued";
                const name = offer?.name ?? "Deleted Offer";
                return {
                    offerId,
                    name,
                    displayName: isDiscontinued ? `${name} (Discontinued)` : name,
                    color: offer?.color ?? "#888888",
                    status: offer?.status ?? "discontinued",
                    isDiscontinued,
                    count,
                };
            }
        );

        // 5. Build customer-offer breakdown for stacked chart
        const customerOfferBreakdown = customerIds.map((customerId, i) => {
            const customer = customers[i];
            const customerName = customer
                ? `${customer.firstName}${customer.lastName ? ` ${customer.lastName}` : ""}`
                : "Deleted Customer";

            const offerCounts = customerOfferMap.get(customerId)!;
            const offerData: Record<string, number> = {};
            let total = 0;
            for (const [offerId, count] of offerCounts.entries()) {
                offerData[offerId] = count;
                total += count;
            }

            return {
                customerId,
                customerName,
                total,
                ...offerData,
            };
        });

        return {
            newCustomersCount: newCustomers.length,
            totalEventsCount: events.length,
            activeCustomersCount: customerOfferMap.size,
            eventsByOffer: eventsByOffer.sort((a, b) => b.count - a.count),
            eventsByStaff: Array.from(eventsByStaffMap.entries())
                .map(([clerkUserId, count]) => ({ clerkUserId, count }))
                .sort((a, b) => b.count - a.count),
            customerOfferBreakdown: customerOfferBreakdown.sort((a, b) => b.total - a.total),
        };
    },
});
