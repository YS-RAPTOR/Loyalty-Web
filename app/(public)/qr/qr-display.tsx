"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { branding } from "@/lib/branding";
import { Logo } from "@/components/ui/logo";
import { Download } from "lucide-react";

type Props = {
    customerId: string;
};

export function QrDisplay({ customerId }: Props) {
    const qrUrl = `/api/qr?id=${customerId}`;

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <Logo size="lg" className="mx-auto mb-4" />
                    <h1 className="text-2xl font-bold tracking-tight">
                        {branding.qr.heading}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {branding.qr.subtitle}
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <div className="overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-white p-4">
                        <Image
                            src={qrUrl}
                            alt={branding.qr.altText}
                            width={280}
                            height={280}
                            className="rounded-lg"
                            unoptimized
                        />
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <Button
                        render={
                            <a href={qrUrl} download={branding.qr.downloadFilename} />
                        }
                        nativeButton={false}
                        className="w-full"
                        size="lg"
                    >
                        <Download className="mr-2 h-5 w-5" />
                        Download QR Code
                    </Button>
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    {branding.qr.saveInstruction}
                </p>
            </div>
        </div>
    );
}
