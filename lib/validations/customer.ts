import { z } from "zod";

/**
 * Australian phone number validation
 * Accepts formats: +61XXXXXXXXX, 61XXXXXXXXX, 0XXXXXXXXX
 */
export const phoneSchema = z
    .string()
    .min(1, "Phone number is required")
    .regex(
        /^(\+?61|0)[2-9]\d{8}$/,
        "Please enter a valid Australian phone number"
    );

/**
 * Name validation - trimmed, max 100 chars
 */
export const nameSchema = z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .transform((val) => val.trim());

/**
 * Optional name validation
 */
export const optionalNameSchema = z
    .string()
    .max(100, "Name must be less than 100 characters")
    .transform((val) => val.trim())
    .optional()
    .or(z.literal(""));

/**
 * Email validation using Zod v4 email format
 */
export const emailSchema = z
    .email("Please enter a valid email address")
    .max(254, "Email must be less than 254 characters");

/**
 * Optional email validation
 */
export const optionalEmailSchema = z
    .email("Please enter a valid email address")
    .max(254, "Email must be less than 254 characters")
    .optional()
    .or(z.literal(""));

/**
 * Registration form schema
 */
export const registrationSchema = z.object({
    phone: phoneSchema,
    firstName: nameSchema,
    lastName: optionalNameSchema,
    email: optionalEmailSchema,
    acceptedTerms: z.literal(true, {
        error: "You must accept the terms and conditions",
    }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Customer edit form schema
 */
export const customerEditSchema = z.object({
    firstName: nameSchema,
    lastName: optionalNameSchema,
    email: optionalEmailSchema,
    phoneE164: z
        .string()
        .min(1, "Phone number is required")
        .regex(/^\+61[2-9]\d{8}$/, "Phone must be in E.164 format (+61XXXXXXXXX)"),
});

export type CustomerEditFormData = z.infer<typeof customerEditSchema>;
