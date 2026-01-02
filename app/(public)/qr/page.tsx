import type { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import { clientConfig } from "@/lib/config";
import { branding } from "@/lib/branding";
import { QrDisplay } from "./qr-display";
import { Logo } from "@/components/ui/logo";
import { AlertTriangle, Ban } from "lucide-react";

type Props = {
    searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({
    searchParams,
}: Props): Promise<Metadata> {
    const { id } = await searchParams;

    if (!id) {
        return {
            title: branding.meta.qrTitle,
            description: branding.meta.qrDescription,
        };
    }

    const baseUrl = clientConfig.appUrl;

    return {
        title: branding.meta.qrWithIdTitle,
        description: branding.meta.qrWithIdDescription,
        openGraph: {
            title: branding.meta.qrWithIdTitle,
            description: branding.meta.qrWithIdDescription,
            images: [
                {
                    url: `${baseUrl}/api/qr?id=${id}`,
                    width: 600,
                    height: 600,
                    alt: branding.meta.qrOgAlt,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: branding.meta.qrWithIdTitle,
            description: branding.meta.qrWithIdDescription,
            images: [`${baseUrl}/api/qr?id=${id}`],
        },
    };
}

export default async function QrPage({ searchParams }: Props) {
    const { id } = await searchParams;

    if (!id) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
                        <Logo size="lg" className="mx-auto mb-4" />
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Invalid QR Link
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            No customer ID provided. Please use the link sent to
                            your phone.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // Validate customer exists
    let customer = null;
    try {
        customer = await convex().query(api.customers.getById, {
            id: id as Id<"customers">,
        });
    } catch {
        customer = null;
    }

    if (!customer) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
                        <Logo size="lg" className="mx-auto mb-4" />
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <Ban className="h-8 w-8 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Customer Not Found
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            This QR code is invalid or the customer no longer
                            exists.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <QrDisplay customerId={id} />
            </div>
        </main>
    );
}
