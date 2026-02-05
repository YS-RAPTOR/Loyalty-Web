"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { branding } from "@/lib/branding";
import { cn } from "@/lib/utils";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
                    <Logo size="lg" className="mx-auto mb-6" />
                    <h1 className="text-2xl font-bold tracking-tight">
                        {branding.home.heading}
                    </h1>
                    <p className="mt-2 text-pretty text-muted-foreground">
                        {branding.tagline}
                    </p>

                    <div className="mt-8 space-y-6">
                        {/* Customer section */}
                        <div className="space-y-3">
                            <p className="text-pretty text-sm text-muted-foreground">
                                {branding.home.customerText}
                            </p>
                            <Link
                                href="/register"
                                className={cn(buttonVariants({ variant: "default" }), "w-full gap-2")}
                            >
                                <UserPlus className="h-4 w-4" />
                                {branding.home.customerCta}
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Staff section */}
                        <div className="space-y-3">
                            <p className="text-pretty text-sm text-muted-foreground">
                                {branding.home.staffText}
                            </p>
                            <Link
                                href="/sign-in"
                                className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                {branding.home.staffCta}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
