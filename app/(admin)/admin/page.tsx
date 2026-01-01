"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { OfferForm } from "./_components/offer-form";
import { ActiveOffersTab } from "./_components/active-offers-tab";
import { DiscontinuedOffersTab } from "./_components/discontinued-offers-tab";
import { TeamManagementTab } from "./_components/team-management-tab";
import { InviteMemberDialog } from "./_components/invite-member-dialog";
import {
    type Offer,
    type OfferFormData,
    type OfferRule,
    type OfferEffect,
    getEditFormData,
} from "./_components/types";

export default function AdminDashboardPage() {
    const activeOffers = useQuery(api.offers.listByStatus, { status: "active" });
    const discontinuedOffers = useQuery(api.offers.listByStatus, { status: "discontinued" });
    const createOffer = useMutation(api.offers.create);
    const updateOffer = useMutation(api.offers.update);
    const discontinueOffer = useMutation(api.offers.discontinue);
    const restartOffer = useMutation(api.offers.restart);

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleCreate = async (data: OfferFormData) => {
        setIsCreating(true);
        try {
            const rule: OfferRule =
                data.ruleKind === "frequency"
                    ? { kind: "frequency", requiredCount: data.requiredCount }
                    : { kind: "raffle" };

            const effect: OfferEffect =
                data.effectKind === "percent_off"
                    ? { kind: "percent_off", percent: data.percent }
                    : { kind: "raffle_entry" };

            await createOffer({
                name: data.name,
                description: data.description || undefined,
                color: data.color,
                rule,
                effect,
            });
            toast.success("Offer created successfully");
            setCreateDialogOpen(false);
        } catch (error) {
            toast.error("Failed to create offer");
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = async (data: OfferFormData) => {
        if (!editingOffer) return;

        setIsEditing(true);
        try {
            const effect: OfferEffect =
                data.effectKind === "percent_off"
                    ? { kind: "percent_off", percent: data.percent }
                    : { kind: "raffle_entry" };

            await updateOffer({
                id: editingOffer._id,
                name: data.name,
                description: data.description,
                color: data.color,
                effect,
            });
            toast.success("Offer updated successfully");
            setEditDialogOpen(false);
            setEditingOffer(null);
        } catch (error) {
            toast.error("Failed to update offer");
            console.error(error);
        } finally {
            setIsEditing(false);
        }
    };

    const handleDiscontinue = async (id: Id<"offers">) => {
        try {
            await discontinueOffer({ id });
            toast.success("Offer discontinued");
        } catch (error) {
            toast.error("Failed to discontinue offer");
            console.error(error);
        }
    };

    const handleRestart = async (id: Id<"offers">) => {
        try {
            await restartOffer({ id });
            toast.success("Offer restarted");
        } catch (error) {
            toast.error("Failed to restart offer");
            console.error(error);
        }
    };

    const handleOpenEdit = (offer: Offer) => {
        setEditingOffer(offer);
        setEditDialogOpen(true);
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <PageHeader
                title="Admin Dashboard"
                description="Manage offers and team members"
            >
                <div className="flex flex-col sm:flex-row gap-2">
                    <InviteMemberDialog />
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger render={<Button className="w-full sm:w-auto gap-2" />}>
                            <Plus className="h-4 w-4" />
                            Create Offer
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Offer</DialogTitle>
                                <DialogDescription>
                                    Set up a new loyalty offer for customers
                                </DialogDescription>
                            </DialogHeader>
                            <OfferForm
                                onSubmit={handleCreate}
                                onCancel={() => setCreateDialogOpen(false)}
                                submitLabel="Create Offer"
                                isLoading={isCreating}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </PageHeader>

            <Tabs defaultValue="active">
                <TabsList className="w-full flex-wrap h-auto gap-1 sm:w-auto sm:flex-nowrap">
                    <TabsTrigger value="active" className="flex-1 sm:flex-none text-xs sm:text-sm">
                        Active ({activeOffers?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value="discontinued" className="flex-1 sm:flex-none text-xs sm:text-sm">
                        Discontinued ({discontinuedOffers?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex-1 sm:flex-none text-xs sm:text-sm">
                        Team
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4 sm:mt-6">
                    <ActiveOffersTab
                        offers={activeOffers as Offer[] | undefined}
                        onEdit={handleOpenEdit}
                        onDiscontinue={handleDiscontinue}
                    />
                </TabsContent>

                <TabsContent value="discontinued" className="mt-4 sm:mt-6">
                    <DiscontinuedOffersTab
                        offers={discontinuedOffers as Offer[] | undefined}
                        onRestart={handleRestart}
                    />
                </TabsContent>

                <TabsContent value="team" className="mt-4 sm:mt-6">
                    <TeamManagementTab />
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
                setEditDialogOpen(open);
                if (!open) setEditingOffer(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Offer</DialogTitle>
                        <DialogDescription>
                            Update offer settings
                        </DialogDescription>
                    </DialogHeader>
                    {editingOffer && (
                        <OfferForm
                            initialData={getEditFormData(editingOffer)}
                            onSubmit={handleEdit}
                            onCancel={() => {
                                setEditDialogOpen(false);
                                setEditingOffer(null);
                            }}
                            submitLabel="Save Changes"
                            isLoading={isEditing}
                            isEditMode={true}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
