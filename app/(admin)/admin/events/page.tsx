"use client";

import { useState, useEffect } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingCard, EmptyState } from "@/components/ui/empty-state";
import { ColorDot } from "@/components/ui/color-dot";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { toast } from "sonner";
import { User, Calendar, Gift, Loader2 } from "lucide-react";
import Link from "next/link";
import { getClerkUsers, type ClerkUser } from "@/lib/actions/clerk";
import { formatDate, formatTime } from "@/lib/date";

export default function EventsPage() {
    const [clerkUsers, setClerkUsers] = useState<Record<string, ClerkUser> | undefined>(undefined);
    const { results: events, status, loadMore } = usePaginatedQuery(
        api.offerEvents.listAll,
        {},
        { initialNumItems: 25 }
    );
    const deleteEvent = useMutation(api.offerEvents.deleteEvent);

    useEffect(() => {
        getClerkUsers().then((result) => {
            if (result.success && result.users) {
                setClerkUsers(result.users);
            }
        });
    }, []);

    const getStaffDisplay = (clerkUserId: string) => {
        const user = clerkUsers![clerkUserId];
        if (!user) {
            return { name: null, email: null };
        }
        const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
        return { name, email: user.email };
    };

    const handleDelete = async (id: Id<"offerEvents">) => {
        try {
            await deleteEvent({ id });
            toast.success("Event deleted successfully");
        } catch (error) {
            toast.error("Failed to delete event");
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Offer Events Log"
                description="Audit log of all qualifying purchases and raffle entries"
            />

            {status === "LoadingFirstPage" || clerkUsers === undefined ? (
                <LoadingCard message="Loading events..." />
            ) : events.length === 0 ? (
                <EmptyState title="No events recorded yet" />
            ) : (
                <>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Offer</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Staff</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow key={event._id}>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="text-sm">
                                                {formatDate(event.createdAt)}
                                            </div>
                                            <div className="text-xs text-stone-500">
                                                {formatTime(event.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {event.customer ? (
                                                <div>
                                                    <Link
                                                        href={`/admin/customers/${event.customerId}`}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        {event.customer.firstName}{" "}
                                                        {event.customer.lastName || ""}
                                                    </Link>
                                                    <div className="text-xs text-stone-500 font-mono">
                                                        {event.customer.phoneE164}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-stone-400">Deleted customer</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {event.offer ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <ColorDot color={event.offer.color} />
                                                    <span>{event.offer.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-stone-400">Deleted offer</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {event.offer?.rule.kind === "frequency" ? (
                                                <span className="text-sm">Purchase</span>
                                            ) : (
                                                <span className="text-sm">Raffle Entry</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                const staff = getStaffDisplay(event.createdByClerkUserId);
                                                return staff.name || staff.email ? (
                                                    <div>
                                                        {staff.name && (
                                                            <div className="text-sm font-medium">
                                                                {staff.name}
                                                            </div>
                                                        )}
                                                        {staff.email && (
                                                            <div className="text-xs text-stone-500">
                                                                {staff.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-stone-500 font-mono">
                                                        {event.createdByClerkUserId.slice(0, 8)}...
                                                    </span>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <DeleteConfirmDialog
                                                title="Delete Event"
                                                description="This action cannot be undone. This will permanently delete this offer event from the audit log."
                                                confirmText={event._id.slice(-8)}
                                                triggerSize="sm"
                                                onDelete={() => handleDelete(event._id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-stone-400" />
                                                    <span>
                                                        {event.customer
                                                            ? `${event.customer.firstName} ${event.customer.lastName || ""}`
                                                            : "Unknown customer"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Gift className="h-4 w-4 text-stone-400" />
                                                    <span>{event.offer?.name || "Unknown offer"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-stone-400" />
                                                    <span>{new Date(event.createdAt).toLocaleString()}</span>
                                                </div>
                                            </DeleteConfirmDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {status === "CanLoadMore" && (
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => loadMore(25)}
                            >
                                Load More
                            </Button>
                        </div>
                    )}
                    {status === "LoadingMore" && (
                        <div className="flex justify-center">
                            <Button variant="outline" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
