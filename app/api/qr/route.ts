import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";

const QR_CONFIG = { width: 600, margin: 4, logoSize: 150 } as const;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing id parameter" },
            { status: 400 },
        );
    }

    try {
        // Validate customer exists
        const customer = await convex().query(api.customers.getById, {
            id: id as Id<"customers">,
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 },
            );
        }

        // Generate QR code with high error correction (allows up to 30% damage/coverage)
        const qrBuffer = await QRCode.toBuffer(id, {
            type: "png",
            width: QR_CONFIG.width,
            margin: QR_CONFIG.margin,
            errorCorrectionLevel: "H",
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });

        // Load and resize logo
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        const logo = await sharp(logoPath)
            .resize(QR_CONFIG.logoSize, QR_CONFIG.logoSize, {
                fit: "contain",
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .png()
            .toBuffer();

        // Calculate position to center the logo
        const logoOffset = Math.floor((QR_CONFIG.width - QR_CONFIG.logoSize) / 2);

        // Composite logo onto QR code
        const finalImage = await sharp(qrBuffer)
            .composite([
                {
                    input: logo,
                    top: logoOffset,
                    left: logoOffset,
                },
            ])
            .png()
            .toBuffer();

        return new NextResponse(new Uint8Array(finalImage), {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("QR generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate QR code" },
            { status: 500 },
        );
    }
}
