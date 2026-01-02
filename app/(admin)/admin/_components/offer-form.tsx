"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { type OfferFormData, defaultFormData } from "./types";
import { offerSchema } from "@/lib/validations/offer";

interface OfferFormProps {
    initialData?: OfferFormData;
    onSubmit: (data: OfferFormData) => void;
    onCancel: () => void;
    submitLabel: string;
    isLoading: boolean;
    isEditMode?: boolean;
}

export function OfferForm({
    initialData = defaultFormData,
    onSubmit,
    onCancel,
    submitLabel,
    isLoading,
    isEditMode = false,
}: OfferFormProps) {
    const [formData, setFormData] = useState<OfferFormData>(initialData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
    const colorInputRef = useRef<HTMLInputElement>(null);
    const hexInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Read color from uncontrolled input at submit time
        const color = colorInputRef.current?.value ?? formData.color;
        const dataToValidate = { ...formData, color };

        // Validate with zod
        const result = offerSchema.safeParse(dataToValidate);

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
        onSubmit(dataToValidate);
    };

    // Sync color picker to hex input without React re-renders
    const handleColorInput = (e: React.FormEvent<HTMLInputElement>) => {
        if (hexInputRef.current) {
            hexInputRef.current.value = e.currentTarget.value;
        }
        if (fieldErrors.color) {
            setFieldErrors({ ...fieldErrors, color: undefined });
        }
    };

    // Sync to React state only on blur
    const handleColorBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setFormData({ ...formData, color: e.target.value });
    };

    // When hex input changes, sync to color picker and React state
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        if (colorInputRef.current) {
            colorInputRef.current.value = color;
        }
        setFormData({ ...formData, color });
        if (fieldErrors.color) {
            setFieldErrors({ ...fieldErrors, color: undefined });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup className="max-h-[60vh] overflow-y-auto">
                <Field>
                    <FieldLabel htmlFor="name">Offer Name</FieldLabel>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (fieldErrors.name) {
                                setFieldErrors({ ...fieldErrors, name: undefined });
                            }
                        }}
                        placeholder="e.g., Coffee Loyalty"
                        maxLength={100}
                        aria-invalid={!!fieldErrors.name}
                    />
                    {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            if (fieldErrors.description) {
                                setFieldErrors({ ...fieldErrors, description: undefined });
                            }
                        }}
                        placeholder="e.g., Buy 5 coffees, get 1 free!"
                        rows={2}
                        maxLength={500}
                        aria-invalid={!!fieldErrors.description}
                    />
                    {fieldErrors.description && <FieldError>{fieldErrors.description}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel htmlFor="color">Color</FieldLabel>
                    <div className="flex items-center gap-3">
                        <input
                            ref={colorInputRef}
                            type="color"
                            id="color"
                            defaultValue={formData.color}
                            onInput={handleColorInput}
                            onBlur={handleColorBlur}
                            className="h-11 w-14 cursor-pointer rounded border border-border p-1"
                        />
                        <input
                            ref={hexInputRef}
                            type="text"
                            defaultValue={formData.color}
                            onChange={handleHexChange}
                            placeholder="#3b82f6"
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-28 rounded-md border bg-transparent px-2.5 py-1 font-mono text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] placeholder:text-muted-foreground"
                            aria-invalid={!!fieldErrors.color}
                        />
                    </div>
                    {fieldErrors.color && <FieldError>{fieldErrors.color}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel htmlFor="ruleKind">Offer Type</FieldLabel>
                    <Select
                        value={formData.ruleKind}
                        onValueChange={(value) => {
                            if (value === "frequency" || value === "raffle") {
                                const newData = { ...formData, ruleKind: value };
                                if (value === "raffle") {
                                    newData.effectKind = "raffle_entry";
                                } else {
                                    newData.effectKind = "percent_off";
                                }
                                setFormData(newData);
                            }
                        }}
                        disabled={isEditMode}
                    >
                        <SelectTrigger id="ruleKind">
                            <SelectValue>
                                {
                                    formData.ruleKind === "frequency" ? "Frequency (every N purchases)" : "Raffle (entry per purchase)"
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="frequency">Frequency (every N purchases)</SelectItem>
                            <SelectItem value="raffle">Raffle (entry per purchase)</SelectItem>
                        </SelectContent>
                    </Select>
                    {isEditMode && (
                        <FieldDescription>
                            Offer type cannot be changed. To use a different type, create a new offer and discontinue this one.
                        </FieldDescription>
                    )}
                </Field>

                {formData.ruleKind === "frequency" && (
                    <>
                        <Field>
                            <FieldLabel htmlFor="requiredCount">Required Purchases</FieldLabel>
                            <Input
                                id="requiredCount"
                                type="number"
                                min="1"
                                value={formData.requiredCount}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        requiredCount: parseInt(e.target.value) || 1,
                                    });
                                    if (fieldErrors.requiredCount) {
                                        setFieldErrors({ ...fieldErrors, requiredCount: undefined });
                                    }
                                }}
                                disabled={isEditMode}
                                aria-invalid={!!fieldErrors.requiredCount}
                            />
                            {fieldErrors.requiredCount && <FieldError>{fieldErrors.requiredCount}</FieldError>}
                            <FieldDescription>
                                {isEditMode
                                    ? "Required purchases cannot be changed. To use a different amount, create a new offer and discontinue this one."
                                    : "Number of qualifying purchases before reward"}
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="percent">Reward Discount (%)</FieldLabel>
                            <Input
                                id="percent"
                                type="number"
                                min="1"
                                max="100"
                                value={formData.percent}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        percent: parseInt(e.target.value) || 100,
                                    });
                                    if (fieldErrors.percent) {
                                        setFieldErrors({ ...fieldErrors, percent: undefined });
                                    }
                                }}
                                aria-invalid={!!fieldErrors.percent}
                            />
                            {fieldErrors.percent && <FieldError>{fieldErrors.percent}</FieldError>}
                            <FieldDescription>100% = free item</FieldDescription>
                        </Field>
                    </>
                )}
            </FieldGroup>
            <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : submitLabel}
                </Button>
            </DialogFooter>
        </form>
    );
}
