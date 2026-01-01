"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteUser } from "@/lib/actions/clerk";
import { type UserRole, roleDisplayNames, roleDescriptions } from "@/lib/roles";

interface InviteMemberDialogProps {
    onInvited?: () => void;
}

export function InviteMemberDialog({ onInvited }: InviteMemberDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>("staff");
    const [isInviting, setIsInviting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsInviting(true);
        try {
            const result = await inviteUser(email, role);
            if (result.success) {
                toast.success(`Invitation sent to ${email}`);
                setOpen(false);
                setEmail("");
                setRole("staff");
                onInvited?.();
            } else {
                toast.error(result.error || "Failed to send invitation");
            }
        } catch (error) {
            toast.error("Failed to send invitation");
            console.error(error);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
                setEmail("");
                setRole("staff");
            }
        }}>
            <DialogTrigger render={<Button className="w-full sm:w-auto gap-2" />}>
                <UserPlus className="h-4 w-4" />
                Invite Member
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation email to a new team member
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="email">Email Address</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="role">Role</FieldLabel>
                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as UserRole)}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    {roleDisplayNames[role]}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="staff">
                                    {roleDisplayNames.staff}
                                </SelectItem>
                                <SelectItem value="trusted">
                                    {roleDisplayNames.trusted}
                                </SelectItem>
                                <SelectItem value="admin">
                                    {roleDisplayNames.admin}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldDescription>
                            {roleDescriptions[role]}
                        </FieldDescription>
                    </Field>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isInviting}>
                            {isInviting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
