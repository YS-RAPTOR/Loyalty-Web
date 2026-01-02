"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ColorDot } from "@/components/ui/color-dot";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { RotateCcw } from "lucide-react";
import { type Offer, formatRule } from "./types";
import { formatDate } from "@/lib/date";

interface DiscontinuedOffersTabProps {
    offers: Offer[] | undefined;
    onRestart: (id: Id<"offers">) => void;
}

export function DiscontinuedOffersTab({ offers, onRestart }: DiscontinuedOffersTabProps) {
    if (offers === undefined) {
        return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
    }

    if (offers.length === 0) {
        return (
            <EmptyState title="No discontinued offers" />
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Discontinued</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {offers.map((offer) => (
                        <TableRow key={offer._id}>
                            <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                    <ColorDot color={offer.color} muted />
                                    <span className="font-medium text-muted-foreground">
                                        {offer.name}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatRule(offer.rule)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {offer.discontinuedAt
                                    ? formatDate(offer.discontinuedAt)
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRestart(offer._id)}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
