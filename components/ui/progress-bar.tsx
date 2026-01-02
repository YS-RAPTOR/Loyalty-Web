import { cn } from "@/lib/utils";

interface ProgressBarProps {
    value: number;
    max: number;
    color?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * A progress bar component with customizable color and size.
 */
export function ProgressBar({
    value,
    max,
    color,
    size = "md",
    className,
}: ProgressBarProps) {
    const percent = Math.min((value / max) * 100, 100);
    const heights = {
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3",
    };

    return (
        <div
            className={cn(
                "rounded-full bg-muted overflow-hidden",
                heights[size],
                className
            )}
        >
            <div
                className="h-full transition-all"
                style={{
                    backgroundColor: color ?? "var(--primary)",
                    width: `${percent}%`,
                }}
            />
        </div>
    );
}
