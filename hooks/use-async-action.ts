"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseAsyncActionOptions<R> {
    onSuccess?: (result: R) => void;
    onError?: (error: unknown) => void;
    successMessage?: string;
    errorMessage?: string;
}

/**
 * A hook that wraps an async action with loading state and toast notifications.
 *
 * @param action - The async action to execute
 * @param options - Configuration options for success/error handling
 * @returns An object with the execute function and loading state
 */
export function useAsyncAction<T, R>(
    action: (data: T) => Promise<R>,
    options: UseAsyncActionOptions<R> = {}
) {
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(
        async (data: T): Promise<R | undefined> => {
            setIsLoading(true);
            try {
                const result = await action(data);
                if (options.successMessage) {
                    toast.success(options.successMessage);
                }
                options.onSuccess?.(result);
                return result;
            } catch (error) {
                const message = options.errorMessage ?? "Something went wrong";
                toast.error(message);
                console.error(error);
                options.onError?.(error);
                return undefined;
            } finally {
                setIsLoading(false);
            }
        },
        [action, options]
    );

    return { execute, isLoading };
}

/**
 * A simpler version that doesn't require input data
 */
export function useAsyncCallback<R>(
    action: () => Promise<R>,
    options: UseAsyncActionOptions<R> = {}
) {
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async (): Promise<R | undefined> => {
        setIsLoading(true);
        try {
            const result = await action();
            if (options.successMessage) {
                toast.success(options.successMessage);
            }
            options.onSuccess?.(result);
            return result;
        } catch (error) {
            const message = options.errorMessage ?? "Something went wrong";
            toast.error(message);
            console.error(error);
            options.onError?.(error);
            return undefined;
        } finally {
            setIsLoading(false);
        }
    }, [action, options]);

    return { execute, isLoading };
}
