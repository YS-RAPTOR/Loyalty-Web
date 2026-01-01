import { clientConfig } from "@/lib/config";

/**
 * Build the QR page URL for a customer
 */
export function buildQrUrl(customerId: string): string {
    return `${clientConfig.appUrl}/qr?id=${customerId}`;
}

/**
 * Normalize Australian phone number to E.164 format
 */
export function normalizeAuPhone(phone: string): string | null {
    const cleaned = phone.replace(/[\s\-()]/g, "");

    if (/^\+61[2-9]\d{8}$/.test(cleaned)) return cleaned;
    if (/^61[2-9]\d{8}$/.test(cleaned)) return `+${cleaned}`;
    if (/^0[2-9]\d{8}$/.test(cleaned)) return `+61${cleaned.slice(1)}`;

    return null;
}
