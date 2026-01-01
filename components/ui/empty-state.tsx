import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * A card component for displaying empty states with an optional icon and description.
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    className,
    children,
}: EmptyStateProps) {
    return (
        <Card className={className}>
            <CardContent className="py-12 text-center text-stone-500">
                {Icon && <Icon className="mx-auto mb-4 h-12 w-12 text-stone-300" />}
                <p>{title}</p>
                {description && <p className="text-sm">{description}</p>}
                {children}
            </CardContent>
        </Card>
    );
}

interface LoadingCardProps {
    message?: string;
    className?: string;
}

/**
 * A card component for displaying loading states.
 */
export function LoadingCard({ message = "Loading...", className }: LoadingCardProps) {
    return (
        <Card className={className}>
            <CardContent className="py-8 text-center text-stone-500">
                {message}
            </CardContent>
        </Card>
    );
}

interface LoadingSpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

/**
 * A centered loading spinner component.
 */
export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
    const sizes = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    return (
        <div className={cn("flex items-center justify-center py-12", className)}>
            <div
                className={cn(
                    "animate-spin rounded-full border-b-2 border-stone-900",
                    sizes[size]
                )}
            />
        </div>
    );
}

interface LoadingSkeletonProps {
    className?: string;
}

/**
 * A skeleton loading component for page content.
 */
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn("space-y-6", className)}>
            <div className="h-8 w-48 bg-stone-200 animate-pulse rounded" />
            <div className="h-64 bg-stone-100 animate-pulse rounded-lg" />
        </div>
    );
}
