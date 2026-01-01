"use client";

import { useState, type ReactNode, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
    /** Title for the dialog */
    title: string;
    /** Description text explaining what will be deleted */
    description: string;
    /** The text the user must type to confirm deletion */
    confirmText: string;
    /** Label for the confirm input field */
    confirmLabel?: string;
    /** Content to display showing details of what's being deleted */
    children?: ReactNode;
    /** Called when deletion is confirmed. Should throw on error to keep dialog open */
    onDelete: () => Promise<void>;
    /** Custom trigger element. Defaults to ghost icon button with trash icon */
    trigger?: ReactElement;
    /** Button size for default trigger */
    triggerSize?: "sm" | "icon" | "default";
}

export function DeleteConfirmDialog({
    title,
    description,
    confirmText,
    confirmLabel,
    children,
    onDelete,
    trigger,
    triggerSize = "icon",
}: DeleteConfirmDialogProps) {
    const [confirmValue, setConfirmValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);

    const canDelete = confirmValue === confirmText;

    const handleDelete = async () => {
        if (!canDelete) return;

        setIsDeleting(true);
        try {
            await onDelete();
            setOpen(false);
            setConfirmValue("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={(o) => {
            setOpen(o);
            if (!o) setConfirmValue("");
        }}>
            <AlertDialogTrigger
                render={trigger ?? <Button variant="ghost" size={triggerSize} />}
                onClick={() => setOpen(true)}
            >
                {!trigger && <Trash2 className="h-4 w-4 text-red-500" />}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    {children && (
                        <div className="rounded-lg bg-stone-50 p-3 space-y-2 text-sm">
                            {children}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="confirmDelete">
                            {confirmLabel ?? (
                                <span className="text-wrap">
                                    Type <code className="rounded bg-stone-100 px-1 break-all">{confirmText}</code> to
                                    confirm deletion:
                                </span>
                            )}
                        </FieldLabel>
                        <Input
                            id="confirmDelete"
                            value={confirmValue}
                            onChange={(e) => setConfirmValue(e.target.value)}
                            placeholder="Type to confirm"
                        />
                    </Field>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={!canDelete || isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
