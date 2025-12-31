import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import QRCode from "qrcode";

const SIZE_CONFIG = {
    default: { width: 400, margin: 2 },
    og: { width: 600, margin: 4 },
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

    try {
        // Validate customer exists
        const customer = await convex.query(api.customers.getById, {
            id: id as Id<"customers">,
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 },
            );
        }

        const config = SIZE_CONFIG[size ?? "default"] ?? SIZE_CONFIG.default;

        const qrBuffer = await QRCode.toBuffer(id, {
            type: "png",
            width: config.width,
            margin: config.margin,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });

        return new NextResponse(new Uint8Array(qrBuffer), {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Customer not found" },
            { status: 404 },
        );
    }
}
