import { cn } from "@/lib/utils";

interface ColorDotProps {
    color: string;
    size?: "sm" | "md" | "lg";
    muted?: boolean;
    className?: string;
}

/**
 * A colored dot indicator, commonly used to display offer colors.
 */
export function ColorDot({
    color,
    size = "md",
    muted = false,
    className,
}: ColorDotProps) {
    const sizes = {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
    };

    return (
        <div
            className={cn("rounded-full", sizes[size], muted && "opacity-50", className)}
            style={{ backgroundColor: color }}
        />
    );
}
