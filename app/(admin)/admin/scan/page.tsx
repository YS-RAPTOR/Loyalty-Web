"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Camera } from "lucide-react";

export default function ScanPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Scan QR Code"
                description="Scan a customer's QR code to view their profile"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        QR Scanner
                    </CardTitle>
                    <CardDescription>
                        Coming in Phase 3
                    </CardDescription>
                </CardHeader>
                <CardContent className="py-12 text-center text-stone-500">
                    <Camera className="mx-auto mb-4 h-16 w-16 text-stone-300" />
                    <p>QR scanner functionality will be available in Phase 3.</p>
                    <p className="text-sm mt-2">
                        For now, use the Search page to find customers.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
