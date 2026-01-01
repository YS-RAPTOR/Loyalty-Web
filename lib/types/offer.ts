import type { Id } from "@/convex/_generated/dataModel";

export type OfferRule =
    | { kind: "frequency"; requiredCount: number }
    | { kind: "raffle" };

export type OfferEffect =
    | { kind: "percent_off"; percent: number }
    | { kind: "raffle_entry" };

export type Offer = {
    _id: Id<"offers">;
    _creationTime: number;
    name: string;
    description?: string;
    color: string;
    status: "active" | "discontinued";
    rule: OfferRule;
    effect: OfferEffect;
    createdAt: number;
    updatedAt: number;
    discontinuedAt?: number;
};

export interface OfferFormData {
    name: string;
    description: string;
    color: string;
    ruleKind: "frequency" | "raffle";
    requiredCount: number;
    effectKind: "percent_off" | "raffle_entry";
    percent: number;
}

export const defaultFormData: OfferFormData = {
    name: "",
    description: "",
    color: "#3b82f6",
    ruleKind: "frequency",
    requiredCount: 5,
    effectKind: "percent_off",
    percent: 100,
};

export function formatRule(rule: OfferRule): string {
    if (rule.kind === "frequency") {
        return `Every ${rule.requiredCount} purchases`;
    }
    return "Raffle entry";
}

export function formatEffect(effect: OfferEffect): string {
    if (effect.kind === "percent_off") {
        return effect.percent === 100 ? "Free item" : `${effect.percent}% off`;
    }
    return "Raffle entry";
}

export function getEditFormData(offer: Offer): OfferFormData {
    return {
        name: offer.name,
        description: offer.description || "",
        color: offer.color,
        ruleKind: offer.rule.kind,
        requiredCount: offer.rule.kind === "frequency" ? offer.rule.requiredCount : 5,
        effectKind: offer.effect.kind,
        percent: offer.effect.kind === "percent_off" ? offer.effect.percent : 100,
    };
}

/**
 * Returns the offer description, or generates a default one based on the offer type.
 */
export function getOfferDescription(offer: {
    description?: string;
    rule: OfferRule;
    effect: OfferEffect;
}): string {
    if (offer.description) {
        return offer.description;
    }

    if (offer.rule.kind === "frequency" && offer.effect.kind === "percent_off") {
        const reward = offer.effect.percent === 100
            ? "Free item"
            : `${offer.effect.percent}% off`;
        return `${reward} every ${offer.rule.requiredCount} purchases`;
    }

    if (offer.rule.kind === "raffle") {
        return "Raffle entry per qualifying purchase";
    }

    return "";
}
