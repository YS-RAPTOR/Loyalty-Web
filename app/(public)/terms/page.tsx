import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "Terms and Conditions for the loyalty program",
};

async function getTermsContent() {
    const filePath = path.join(process.cwd(), "content", "terms.md");
    const source = fs.readFileSync(filePath, "utf-8");
    const { content } = await compileMDX({
        source,
        options: { parseFrontmatter: false },
    });
    return content;
}

export default async function TermsPage() {
    const content = await getTermsContent();

    return (
        <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto max-w-3xl px-4 py-12">
                <div className="mb-8 text-center">
                    <Logo size="lg" className="mx-auto mb-4" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        Terms and Conditions
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Please read these terms carefully before using our loyalty program
                    </p>
                </div>
                <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
                        {content}
                    </article>
                </div>
            </div>
        </main>
    );
}
