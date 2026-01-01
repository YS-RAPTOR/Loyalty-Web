"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Logo } from "@/components/ui/logo";

export default function PublicError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Public page error:", error);
    }, [error]);

    return (
        <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
                    <Logo size="lg" className="mx-auto mb-4" />
                    <ErrorDisplay 
                        error={error} 
                        reset={reset} 
                        className="min-h-0"
                        homeHref="/register"
                        homeLabel="Go to Registration"
                    />
                </div>
            </div>
        </main>
    );
}
