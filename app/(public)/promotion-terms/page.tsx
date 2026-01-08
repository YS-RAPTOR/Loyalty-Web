import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { TermsPageLayout } from "@/components/ui/terms-page-layout";

export const metadata: Metadata = {
    title: "Promotion Terms & Conditions",
    description: "Promotion Terms & Conditions for Triple T Café",
};

async function getPromotionTermsContent() {
    const filePath = path.join(process.cwd(), "content", "promotion-terms.md");
    const source = fs.readFileSync(filePath, "utf-8");
    const { content } = await compileMDX({
        source,
        options: { parseFrontmatter: false },
    });
    return content;
}

export default async function PromotionTermsPage() {
    const content = await getPromotionTermsContent();

    return (
        <TermsPageLayout
            title="Promotion Terms & Conditions"
            subtitle="Win a return trip to Bali with Jetstar"
        >
            {content}
        </TermsPageLayout>
    );
}
