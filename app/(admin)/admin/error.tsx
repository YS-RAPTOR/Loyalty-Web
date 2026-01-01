"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ui/error-display";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin error:", error);
    }, [error]);

    return (
        <ErrorDisplay
            error={error}
            reset={reset}
            homeHref="/admin"
            homeLabel="Back to Admin"
            className="min-h-[50vh]"
        />
    );
}
