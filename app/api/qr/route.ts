import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";

const SIZE_CONFIG = {
    default: { width: 400, margin: 2, logoSize: 100 },
    og: { width: 1200, margin: 4, logoSize: 300 },
} as const;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const size = searchParams.get("size") as keyof typeof SIZE_CONFIG | null;

    if (!id) {
        return NextResponse.json(
            { error: "Missing id parameter" },
            { status: 400 },
        );
    }

    // Get IP for rate limiting (use x-forwarded-for or fallback)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        ?? request.headers.get("x-real-ip")
        ?? "anonymous";

    try {
        const client = convex();

        // Check rate limit
        const rateLimit = await client.mutation(api.rateLimits.consumeQrGenerationLimit, {
            identifier: ip,
        });

        if (!rateLimit.ok) {
            const retryAfter = Math.ceil((rateLimit.retryAfter ?? 60000) / 1000);
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                    },
                },
            );
        }

        // Validate customer exists
        const customer = await client.query(api.customers.getById, {
            id: id as Id<"customers">,
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 },
            );
        }

        const config = SIZE_CONFIG[size ?? "default"] ?? SIZE_CONFIG.default;

        // Generate QR code with high error correction (allows up to 30% damage/coverage)
        const qrBuffer = await QRCode.toBuffer(id, {
            type: "png",
            width: config.width,
            margin: config.margin,
            errorCorrectionLevel: "H",
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });

        // Load and resize logo
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        const logo = await sharp(logoPath)
            .resize(config.logoSize, config.logoSize, {
                fit: "contain",
                background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .png()
            .toBuffer();

        // Calculate position to center the logo
        const logoOffset = Math.floor((config.width - config.logoSize) / 2);

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
