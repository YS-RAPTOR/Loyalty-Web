"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    customerId: string;
};

export function QrDisplay({ customerId }: Props) {
    const qrUrl = `/api/qr?id=${customerId}`;

    return (
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle>Your Loyalty QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                    Show this QR code at checkout to earn rewards
                </p>

                <div className="flex justify-center">
                    <Image
                        src={qrUrl}
                        alt="Your Loyalty QR Code"
                        width={300}
                        height={300}
                        className="rounded-lg border"
                        unoptimized
                    />
                </div>

                <Button
                    render={<a href={qrUrl} download="loyalty-qr-code.png" />}
                    nativeButton={false}
                    className="w-full"
                >
                    Download QR Code
                </Button>

                <p className="text-xs text-muted-foreground">
                    Save this QR code to your phone for easy access
                </p>
            </CardContent>
        </Card>
    );
}
