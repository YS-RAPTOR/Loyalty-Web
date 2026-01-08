import { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

interface TermsPageLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export function TermsPageLayout({ title, subtitle, children }: TermsPageLayoutProps) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto max-w-3xl px-4 py-12">
                <div className="mb-8 text-center">
                    <Logo size="lg" className="mx-auto mb-4" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
                <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
                        {children}
                    </article>
                </div>
            </div>
        </main>
    );
}
