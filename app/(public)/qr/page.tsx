import type { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import { clientConfig } from "@/lib/config";
import { QrDisplay } from "./qr-display";

type Props = {
    searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({
    searchParams,
}: Props): Promise<Metadata> {
    const { id } = await searchParams;

    if (!id) {
        return {
            title: "QR Code - Loyalty Program",
            description: "Your loyalty program QR code",
        };
    }

    const baseUrl = clientConfig.appUrl;

    return {
        title: "Your QR Code - Loyalty Program",
        description: "Scan this QR code at checkout to earn rewards",
        openGraph: {
            title: "Your QR Code - Loyalty Program",
            description: "Scan this QR code at checkout to earn rewards",
            images: [
                {
                    url: `${baseUrl}/api/qr?id=${id}&size=og`,
                    width: 600,
                    height: 600,
                    alt: "Loyalty Program QR Code",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "Your QR Code - Loyalty Program",
            description: "Scan this QR code at checkout to earn rewards",
            images: [`${baseUrl}/api/qr?id=${id}&size=og`],
        },
    };
}

export default async function QrPage({ searchParams }: Props) {
    const { id } = await searchParams;

    if (!id) {
        return (
            <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Invalid QR Link</h1>
                    <p className="mt-2 text-muted-foreground">
                        No customer ID provided. Please use the link sent to
                        your phone.
                    </p>
                </div>
            </main>
        );
    }

    // Validate customer exists
    let customer = null;
    try {
        customer = await convex.query(api.customers.getById, {
            id: id as Id<"customers">,
        });
    } catch {
        customer = null;
    }

    if (!customer) {
        return (
            <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Customer Not Found</h1>
                    <p className="mt-2 text-muted-foreground">
                        This QR code is invalid or the customer no longer
                        exists.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
            <QrDisplay customerId={id} />
        </main>
    );
}
