/**
 * Format a date as a localized date string (e.g., "1/15/2024")
 */
export function formatDate(date: number | Date): string {
    return new Date(date).toLocaleDateString();
}

/**
 * Format a date as a localized time string (e.g., "3:45:30 PM")
 */
export function formatTime(date: number | Date): string {
    return new Date(date).toLocaleTimeString();
}

/**
 * Format a date as a localized date and time string (e.g., "1/15/2024, 3:45:30 PM")
 */
export function formatDateTime(date: number | Date): string {
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
