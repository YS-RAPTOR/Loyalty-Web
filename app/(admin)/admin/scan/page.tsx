"use client";

import { PageHeader } from "@/components/ui/page-header";
import { QrScanner } from "./qr-scanner";

export default function ScanPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Scan QR Code"
                description="Scan a customer's QR code to view their profile"
            />

            <div className="max-w-md mx-auto">
                <QrScanner />
            </div>
        </div>
    );
}
