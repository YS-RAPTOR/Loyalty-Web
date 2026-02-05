"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingCard } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { getClerkUsers, type ClerkUser } from "@/lib/actions/clerk";
import { Users, Activity, UserCheck } from "lucide-react";
import { startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { HorizontalBarChart } from "./_components/horizontal-bar-chart";
import { CustomerActivityChart } from "./_components/customer-activity-chart";

function getDefaultRange(): DateRange {
    const today = new Date();
    return { from: startOfDay(today), to: endOfDay(today) };
}

export default function InsightsPage() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultRange());
    const [clerkUsers, setClerkUsers] = useState<Record<string, ClerkUser> | undefined>(undefined);

    // Convert date range to timestamps for query
    const queryParams = useMemo(() => {
        if (!dateRange?.from) {
            return { startDate: undefined, endDate: undefined };
        }
        return {
            startDate: dateRange.from.getTime(),
            endDate: dateRange.to ? endOfDay(dateRange.to).getTime() : endOfDay(dateRange.from).getTime(),
        };
    }, [dateRange]);

    const insights = useQuery(api.insights.getInsights, queryParams);

    useEffect(() => {
        getClerkUsers().then((result) => {
            if (result.success && result.users) {
                setClerkUsers(result.users);
            }
        });
    }, []);

    const getStaffName = (clerkUserId: string): string => {
        if (!clerkUsers) return clerkUserId.slice(0, 12) + "...";
        const user = clerkUsers[clerkUserId];
        if (!user) return clerkUserId.slice(0, 12) + "...";
        const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
        return name || user.email || clerkUserId.slice(0, 12) + "...";
    };

    const isLoading = insights === undefined || clerkUsers === undefined;

    // Build chart config for offers (sorted by name for consistent legend order)
    const offersSortedByName = useMemo(() => {
        if (!insights) return [];
        return [...insights.eventsByOffer].sort((a, b) => a.name.localeCompare(b.name));
    }, [insights]);

    const offerChartConfig: ChartConfig = useMemo(() => {
        if (!insights) return {};
        const config: ChartConfig = {};
        for (const offer of offersSortedByName) {
            config[offer.offerId] = {
                label: offer.displayName,
                color: offer.color,
            };
        }
        return config;
    }, [insights, offersSortedByName]);

    // Staff chart uses primary color
    const staffChartConfig: ChartConfig = {
        count: {
            label: "Events",
            color: "var(--primary)",
        },
    };

    // Prepare events by offer chart data
    const eventsByOfferChartData = useMemo(() => {
        if (!insights) return [];
        return insights.eventsByOffer.map((item) => ({
            name: item.displayName,
            count: item.count,
            fill: "var(--primary)",
            offerId: item.offerId,
        }));
    }, [insights]);

    // Prepare events by staff chart data
    const eventsByStaffChartData = useMemo(() => {
        if (!insights) return [];
        return insights.eventsByStaff.map((item) => ({
            name: getStaffName(item.clerkUserId),
            count: item.count,
            fill: "var(--primary)",
        }));
    }, [insights, clerkUsers]);

    // Prepare customer offer breakdown chart data
    const customerOfferChartData = useMemo(() => {
        if (!insights) return [];
        return insights.customerOfferBreakdown.map((item) => {
            // Extract offer counts (dynamic keys) from item
            const offerCounts: Record<string, number> = {};
            for (const key of Object.keys(item)) {
                if (key !== "customerId" && key !== "customerName" && key !== "total") {
                    offerCounts[key] = item[key as keyof typeof item] as number;
                }
            }
            return {
                customerId: item.customerId,
                customerName: item.customerName,
                total: item.total,
                ...offerCounts,
            };
        });
    }, [insights]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Insights"
                description="Business metrics and analytics"
            >
                <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                />
            </PageHeader>

            {isLoading ? (
                <LoadingCard message="Loading insights..." />
            ) : (
                <>
                    {/* Stat Cards - Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    New Customers
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {insights.newCustomersCount}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Events
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {insights.totalEventsCount}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="sm:col-span-2 lg:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Active Customers
                                </CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {insights.activeCustomersCount}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts - Responsive grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Events by Offer - Horizontal Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Events by Offer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {eventsByOfferChartData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No events in selected period
                                    </p>
                                ) : (
                                    <HorizontalBarChart
                                        data={eventsByOfferChartData}
                                        config={offerChartConfig}
                                        yAxisWidth={120}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Events by Staff - Horizontal Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Events by Staff</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {eventsByStaffChartData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No events in selected period
                                    </p>
                                ) : (
                                    <HorizontalBarChart
                                        data={eventsByStaffChartData}
                                        config={staffChartConfig}
                                        yAxisWidth={120}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer-Offer Breakdown - Full Width Stacked Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Activity Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customerOfferChartData.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No customer activity in selected period
                                </p>
                            ) : (
                                <CustomerActivityChart
                                    data={customerOfferChartData}
                                    offers={offersSortedByName}
                                    config={offerChartConfig}
                                    onCustomerClick={(customerId) => router.push(`/admin/customers/${customerId}`)}
                                />
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
