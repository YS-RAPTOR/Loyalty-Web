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
import { Pencil, Ban } from "lucide-react";
import { type Offer, formatRule, formatEffect } from "./types";
import { formatDate } from "@/lib/date";

interface ActiveOffersTabProps {
    offers: Offer[] | undefined;
    onEdit: (offer: Offer) => void;
    onDiscontinue: (id: Id<"offers">) => void;
}

export function ActiveOffersTab({ offers, onEdit, onDiscontinue }: ActiveOffersTabProps) {
    if (offers === undefined) {
        return <div className="text-center py-8 text-stone-500">Loading...</div>;
    }

    if (offers.length === 0) {
        return (
            <EmptyState title="No active offers. Create one to get started!" />
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {offers.map((offer) => (
                        <TableRow key={offer._id}>
                            <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                    <ColorDot color={offer.color} />
                                    <span className="font-medium">{offer.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{formatRule(offer.rule)}</TableCell>
                            <TableCell>{formatEffect(offer.effect)}</TableCell>
                            <TableCell>
                                {formatDate(offer.createdAt)}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(offer)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDiscontinue(offer._id)}
                                >
                                    <Ban className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
