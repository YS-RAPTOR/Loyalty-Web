import { z } from "zod";

/**
 * Hex color validation
 */
export const hexColorSchema = z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color (e.g., #3b82f6)");

/**
 * Offer form schema
 */
export const offerSchema = z
    .object({
        name: z
            .string()
            .min(1, "Offer name is required")
            .max(100, "Offer name must be less than 100 characters")
            .transform((val) => val.trim()),
        description: z
            .string()
            .max(500, "Description must be less than 500 characters")
            .transform((val) => val.trim())
            .optional()
            .or(z.literal("")),
        color: hexColorSchema,
        ruleKind: z.enum(["frequency", "raffle"]),
        requiredCount: z.number().int().min(1, "Required count must be at least 1").optional(),
        effectKind: z.enum(["percent_off", "raffle_entry"]),
        percent: z
            .number()
            .int()
            .min(1, "Discount must be at least 1%")
            .max(100, "Discount cannot exceed 100%")
            .optional(),
    })
    .superRefine((data, ctx) => {
        // Frequency offers require requiredCount and percent
        if (data.ruleKind === "frequency") {
            if (!data.requiredCount || data.requiredCount < 1) {
                ctx.addIssue({
                    code: "custom",
                    message: "Required count must be at least 1",
                    path: ["requiredCount"],
                });
            }
            if (!data.percent || data.percent < 1) {
                ctx.addIssue({
                    code: "custom",
                    message: "Discount percentage is required",
                    path: ["percent"],
                });
            }
        }
    });

export type OfferFormData = z.infer<typeof offerSchema>;

/**
 * Validate offer form data
 */
export function validateOfferForm(data: unknown): {
    success: boolean;
    data?: OfferFormData;
    errors?: Record<string, string>;
} {
    const result = offerSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) {
            errors[path] = issue.message;
        }
    }

    return { success: false, errors };
}
