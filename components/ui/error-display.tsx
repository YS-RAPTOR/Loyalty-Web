"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
    description?: string;
    homeHref?: string;
    homeLabel?: string;
    className?: string;
}

export function ErrorDisplay({
    error,
    reset,
    title = "Something went wrong",
    description = "An unexpected error occurred. Please try again.",
    homeHref = "/",
    homeLabel = "Go home",
    className = "min-h-screen",
}: ErrorDisplayProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
            <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h1 className="mb-2 text-xl font-semibold text-foreground">
                    {title}
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    {description}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={reset}>Try again</Button>
                    <Button variant="outline" onClick={() => window.location.href = homeHref}>
                        {homeLabel}
                    </Button>
                </div>
                {error.digest && (
                    <p className="mt-4 text-xs text-muted-foreground/70">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
