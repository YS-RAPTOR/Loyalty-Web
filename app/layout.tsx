import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { clientConfig } from "@/lib/config";
import { branding } from "@/lib/branding";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(clientConfig.appUrl),
    title: branding.appName,
    description: branding.meta.description,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" className={`${inter.variable} dark`}>
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                >
                    <ConvexClientProvider>{children}</ConvexClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
