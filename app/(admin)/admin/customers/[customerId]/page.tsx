"use client";

import { useState, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState, LoadingSkeleton } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { toast } from "sonner";
import {
    Phone,
    Mail,
    Gift,
    Ticket,
    Send,
    Pencil,
    QrCode,
} from "lucide-react";
import Link from "next/link";
import { resendQrAction } from "@/lib/actions/customer";
import { formatDate } from "@/lib/date";
import { type OfferRule, type OfferEffect, getOfferDescription } from "@/lib/types/offer";
import { getRoleFromPublicMetadata, hasMinRoles } from "@/lib/roles";
import { customerEditSchema } from "@/lib/validations/customer";

interface PageProps {
    params: Promise<{ customerId: string }>;
}

function OfferProgressCard({
    offer,
    progress,
    requiredCount,
    requirementMet,
    showReadyBadge,
    onLog,
    isLogging,
}: {
    offer: {
        _id: Id<"offers">;
        name: string;
        description?: string;
        color: string;
        rule: OfferRule;
        effect: OfferEffect;
    };
    progress: number;
    requiredCount: number | null;
    requirementMet: boolean;
    showReadyBadge: boolean;
    onLog: () => void;
    isLogging: boolean;
}) {
    const isFrequency = offer.rule.kind === "frequency";
    const isRaffle = offer.rule.kind === "raffle";
    const description = getOfferDescription(offer);

    return (
        <Card className="relative overflow-hidden">
            <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: offer.color }}
            />
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{offer.name}</CardTitle>
                    {showReadyBadge && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            Reward Ready!
                        </Badge>
                    )}
                </div>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {isFrequency && requiredCount && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                                {progress % requiredCount} / {requiredCount}
                            </span>
                        </div>
                        <ProgressBar
                            value={progress % requiredCount}
                            max={requiredCount}
                            color={offer.color}
                        />
                        {progress > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Total purchases: {progress} | Rewards earned:{" "}
                                {Math.floor(progress / requiredCount)}
                            </p>
                        )}
                    </div>
                )}

                {isRaffle && (
                    <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                            <span className="font-medium">{progress}</span> raffle{" "}
                            {progress === 1 ? "entry" : "entries"}
                        </span>
                    </div>
                )}

                <Button
                    onClick={onLog}
                    disabled={isLogging}
                    className="w-full text-white hover:opacity-90"
                    style={{ backgroundColor: offer.color }}
                >
                    {isLogging ? (
                        "Logging..."
                    ) : (
                        <>
                            {isFrequency ? (
                                <>
                                    <Gift className="mr-2 h-4 w-4" />
                                    Log Qualifying Purchase
                                </>
                            ) : (
                                <>
                                    <Ticket className="mr-2 h-4 w-4" />
                                    Log Raffle Entry
                                </>
                            )}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

function EditCustomerDialog({
    customer,
    onSave,
}: {
    customer: {
        _id: Id<"customers">;
        firstName: string;
        lastName?: string;
        email?: string;
        phoneE164: string;
    };
    onSave: (data: {
        firstName: string;
        lastName?: string;
        email?: string;
        phoneE164: string;
    }) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [form, setForm] = useState({
        firstName: customer.firstName,
        lastName: customer.lastName || "",
        email: customer.email || "",
        phoneE164: customer.phoneE164,
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

    // Reset form when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setForm({
                firstName: customer.firstName,
                lastName: customer.lastName || "",
                email: customer.email || "",
                phoneE164: customer.phoneE164,
            });
            setFieldErrors({});
        }
        setOpen(isOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate with zod
        const result = customerEditSchema.safeParse({
            firstName: form.firstName,
            lastName: form.lastName || undefined,
            email: form.email || undefined,
            phoneE164: form.phoneE164,
        });

        if (!result.success) {
            const errors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as string;
                if (!errors[field]) {
                    errors[field] = issue.message;
                }
            }
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setIsUpdating(true);
        try {
            await onSave({
                firstName: result.data.firstName,
                lastName: result.data.lastName || undefined,
                email: result.data.email || undefined,
                phoneE164: result.data.phoneE164,
            });
            setOpen(false);
        } catch {
            // Error handled by parent
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={<Button variant="outline" size="sm" />}
            >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>
                            Update customer information. Click save when done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                                <Input
                                    id="firstName"
                                    value={form.firstName}
                                    onChange={(e) => {
                                        setForm({ ...form, firstName: e.target.value });
                                        if (fieldErrors.firstName) {
                                            setFieldErrors({ ...fieldErrors, firstName: undefined });
                                        }
                                    }}
                                    placeholder="First name"
                                    maxLength={100}
                                    aria-invalid={!!fieldErrors.firstName}
                                />
                                {fieldErrors.firstName && <FieldError>{fieldErrors.firstName}</FieldError>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="lastName">Last name (optional)</FieldLabel>
                                <Input
                                    id="lastName"
                                    value={form.lastName}
                                    onChange={(e) => {
                                        setForm({ ...form, lastName: e.target.value });
                                        if (fieldErrors.lastName) {
                                            setFieldErrors({ ...fieldErrors, lastName: undefined });
                                        }
                                    }}
                                    placeholder="Last name"
                                    maxLength={100}
                                    aria-invalid={!!fieldErrors.lastName}
                                />
                                {fieldErrors.lastName && <FieldError>{fieldErrors.lastName}</FieldError>}
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="phoneE164">Phone number</FieldLabel>
                            <Input
                                id="phoneE164"
                                value={form.phoneE164}
                                onChange={(e) => {
                                    setForm({ ...form, phoneE164: e.target.value });
                                    if (fieldErrors.phoneE164) {
                                        setFieldErrors({ ...fieldErrors, phoneE164: undefined });
                                    }
                                }}
                                placeholder="+61412345678"
                                aria-invalid={!!fieldErrors.phoneE164}
                            />
                            {fieldErrors.phoneE164 && <FieldError>{fieldErrors.phoneE164}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Email (optional)</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => {
                                    setForm({ ...form, email: e.target.value });
                                    if (fieldErrors.email) {
                                        setFieldErrors({ ...fieldErrors, email: undefined });
                                    }
                                }}
                                placeholder="customer@example.com"
                                maxLength={254}
                                aria-invalid={!!fieldErrors.email}
                            />
                            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
                        </Field>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function CustomerPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const customerId = resolvedParams.customerId as Id<"customers">;
    const router = useRouter();
    const { user: clerkUser } = useUser();

    const customer = useQuery(api.customers.getById, { id: customerId });
    const offerProgress = useQuery(api.offerEvents.getCustomerProgress, {
        customerId,
    });

    const updateCustomer = useMutation(api.customers.update);
    const logEvent = useMutation(api.offerEvents.logQualifyingEvent);

    const [loggingOfferId, setLoggingOfferId] = useState<Id<"offers"> | null>(null);
    const [isResendingQr, setIsResendingQr] = useState(false);

    // Check if user has trusted or higher role
    const userRole = getRoleFromPublicMetadata(clerkUser?.publicMetadata);
    const canEdit = hasMinRoles(userRole, "trusted");
    const canResendQr = hasMinRoles(userRole, "trusted");

    const handleSaveEdit = async (data: {
        firstName: string;
        lastName?: string;
        email?: string;
        phoneE164: string;
    }) => {
        try {
            await updateCustomer({
                id: customerId,
                ...data,
            });
            toast.success("Customer updated successfully");
        } catch (error) {
            toast.error("Failed to update customer");
            console.error(error);
            throw error;
        }
    };

    const handleLogEvent = async (offerId: Id<"offers">) => {
        if (!clerkUser) {
            toast.error("You must be logged in to log events");
            return;
        }

        setLoggingOfferId(offerId);
        try {
            const eventId = await logEvent({
                customerId,
                offerId,
            });
            toast.success("Event logged successfully");
            // Redirect to success page
            router.push(
                `/admin/customers/${customerId}/offers/${offerId}/success?eventId=${eventId}`
            );
        } catch (error) {
            toast.error("Failed to log event");
            console.error(error);
            setLoggingOfferId(null);
        }
    };

    const handleResendQr = async () => {
        setIsResendingQr(true);
        try {
            const result = await resendQrAction(customerId);

            if (!result.success) {
                throw new Error(result.error || "Failed to resend QR link");
            }

            toast.success("QR link sent via SMS");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send QR link");
            console.error(error);
        } finally {
            setIsResendingQr(false);
        }
    };

    if (customer === undefined || offerProgress === undefined) {
        return <LoadingSkeleton />;
    }

    if (customer === null) {
        return (
            <div className="space-y-6">
                <BackLink href="/admin/search">Back to Search</BackLink>
                <EmptyState title="Customer not found" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <BackLink href="/admin/search">Back to Search</BackLink>

            {/* Customer Profile */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">
                                {customer.firstName} {customer.lastName || ""}
                            </CardTitle>
                            <CardDescription>
                                Customer since {formatDate(customer.createdAt)}
                            </CardDescription>
                        </div>
                        {canEdit && (
                            <EditCustomerDialog
                                customer={customer}
                                onSave={handleSaveEdit}
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-mono">{customer.phoneE164}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{customer.email || "No email"}</span>
                        </div>
                    </div>

                    <Separator />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">QR Code</p>
                            <p className="text-xs text-muted-foreground">
                                View or send the customer their QR code
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                render={<Link href={`/qr?id=${customerId}`} />}
                                className="w-full sm:w-auto"
                                nativeButton={false}
                            >
                                <QrCode className="mr-2 h-4 w-4" />
                                View QR Code
                            </Button>
                            {canResendQr && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResendQr}
                                    disabled={isResendingQr}
                                    className="w-full sm:w-auto"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {isResendingQr ? "Sending..." : "Resend QR Link"}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Offers */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Offers</h2>
                {offerProgress.length === 0 ? (
                    <EmptyState title="No active offers available" />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {offerProgress.map(({ offer, progress, requiredCount, requirementMet, showReadyBadge }) => (
                            <OfferProgressCard
                                key={offer._id}
                                offer={offer}
                                progress={progress}
                                requiredCount={requiredCount}
                                requirementMet={requirementMet}
                                showReadyBadge={showReadyBadge}
                                onLog={() => handleLogEvent(offer._id)}
                                isLogging={loggingOfferId === offer._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
