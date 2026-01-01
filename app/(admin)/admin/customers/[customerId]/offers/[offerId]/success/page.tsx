"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState, LoadingSpinner } from "@/components/ui/empty-state";
import { ColorDot } from "@/components/ui/color-dot";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CheckCircle, Gift, Ticket } from "lucide-react";
import Link from "next/link";
import { getOfferDescription } from "@/lib/types/offer";

interface PageProps {
    params: Promise<{ customerId: string; offerId: string }>;
}

export default function OfferSuccessPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const customerId = resolvedParams.customerId as Id<"customers">;
    const offerId = resolvedParams.offerId as Id<"offers">;
    const searchParams = useSearchParams();
    const eventId = searchParams.get("eventId");

    const customer = useQuery(api.customers.getById, { id: customerId });
    const offer = useQuery(api.offers.getById, { id: offerId });
    const progress = useQuery(api.offerEvents.getProgress, {
        customerId,
        offerId,
    });

    if (customer === undefined || offer === undefined || progress === undefined) {
        return <LoadingSpinner />;
    }

    if (!customer || !offer) {
        return (
            <div className="space-y-6">
                <BackLink href={`/admin/search`}>Back to Search</BackLink>
                <EmptyState title="Customer or offer not found" />
            </div>
        );
    }

    const isFrequency = offer.rule.kind === "frequency";
    const requiredCount = isFrequency ? (offer.rule as { kind: "frequency"; requiredCount: number }).requiredCount : null;
    const requirementMet = isFrequency && requiredCount
        ? progress > 0 && progress % requiredCount === 0
        : false;

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <BackLink href={`/admin/customers/${customerId}`}>Back to Customer</BackLink>

            <Card className={requirementMet ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}>
                <CardHeader className="text-center pb-2">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${requirementMet ? "bg-amber-100" : "bg-green-100"}`}>
                        {requirementMet ? (
                            <Gift className="h-8 w-8 text-amber-600" />
                        ) : (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        )}
                    </div>
                    <CardTitle className={`text-2xl ${requirementMet ? "text-amber-800" : "text-green-800"}`}>
                        {requirementMet ? "Reward Threshold Reached!" : "Event Logged Successfully!"}
                    </CardTitle>
                    <CardDescription className={requirementMet ? "text-amber-700" : "text-green-700"}>
                        {requirementMet && offer.effect.kind === "percent_off" ? (
                            <>
                                Customer is eligible for{" "}
                                {offer.effect.percent === 100
                                    ? "a free item"
                                    : `${offer.effect.percent}% off`}
                            </>
                        ) : (
                            isFrequency ? "Qualifying purchase recorded" : "Raffle entry recorded"
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Event ID */}
                    {eventId && (
                        <div className="rounded-lg bg-white p-4 text-center">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                                Event ID
                            </p>
                            <p className="font-mono text-sm break-all">{eventId}</p>
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="rounded-lg bg-white p-4">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                            Customer
                        </p>
                        <p className="font-medium">
                            {customer.firstName} {customer.lastName || ""}
                        </p>
                        <p className="text-sm text-stone-500 font-mono">
                            {customer.phoneE164}
                        </p>
                    </div>

                    {/* Offer Info */}
                    <div className="rounded-lg bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ColorDot color={offer.color} />
                            <p className="font-medium">{offer.name}</p>
                        </div>
                        <p className="text-sm text-stone-500 mb-3">{getOfferDescription(offer)}</p>

                        {isFrequency && requiredCount ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-stone-500">Progress</span>
                                    <span className="font-medium">
                                        {progress % requiredCount} / {requiredCount}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={progress % requiredCount}
                                    max={requiredCount}
                                    color={offer.color}
                                    size="lg"
                                />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-stone-500">Total purchases</span>
                                    <span className="font-medium">{progress}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-stone-500">Rewards earned</span>
                                    <span className="font-medium">
                                        {Math.floor(progress / requiredCount)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm">
                                <Ticket className="h-4 w-4 text-stone-400" />
                                <span>
                                    <span className="font-medium">{progress}</span> raffle{" "}
                                    {progress === 1 ? "entry" : "entries"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                        <Link href={`/admin/customers/${customerId}`}>
                            <Button className="w-full">
                                Return to Customer
                            </Button>
                        </Link>
                        <Link href="/admin/search">
                            <Button variant="outline" className="w-full">
                                Search Another Customer
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
