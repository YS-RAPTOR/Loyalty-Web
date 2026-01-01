"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackLinkPropsWithHref {
    href: string;
    back?: never;
    children: React.ReactNode;
    className?: string;
}

type BackLinkProps = BackLinkPropsWithHref;

/**
 * A styled back navigation link with an arrow icon.
 * Use `href` for static navigation or `back` for browser history navigation.
 */
export function BackLink({ href, back, children, className }: BackLinkProps) {
    const router = useRouter();

    const linkClassName = cn(
        "inline-flex items-center text-sm text-stone-500 hover:text-stone-700 cursor-pointer",
        className
    );

    if (back) {
        return (
            <button
                type="button"
                onClick={() => router.back()}
                className={linkClassName}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {children}
            </button>
        );
    }

    return (
        <Link href={href} className={linkClassName}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {children}
        </Link>
    );
}
