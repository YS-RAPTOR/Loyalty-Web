import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Re-export getOfferDescription from the consolidated types file for backward compatibility
export { getOfferDescription } from "@/lib/types/offer";
