"use client";

import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the provided value.
 * The returned value will only update after the specified delay has passed
 * without any new updates to the input value.
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 200)
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
