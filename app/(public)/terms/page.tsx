import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

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
        <main className="container mx-auto max-w-3xl px-4 py-8">
            <article className="prose prose-neutral dark:prose-invert max-w-none">
                {content}
            </article>
        </main>
    );
}
