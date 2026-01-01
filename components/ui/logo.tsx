import Image from "next/image";
import { branding } from "@/lib/branding";
import { cn } from "@/lib/utils";

type LogoProps = {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
};

export function Logo({ size = "md", className }: LogoProps) {
    const { width, height } = sizes[size];

    return (
        <Image
            src={branding.logo.src}
            alt={branding.logo.alt}
            width={width}
            height={height}
            className={cn("object-contain", className)}
            priority
        />
    );
}
