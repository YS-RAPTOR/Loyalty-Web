"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { branding } from "@/lib/branding";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global error:", error);
    }, [error]);

    return (
        <html className="dark">
            <body>
                <div style={{
                    display: "flex",
                    minHeight: "100vh",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    backgroundColor: "oklch(0.187 0 0)",
                    color: "oklch(1 0 0)",
                }}>
                    <div style={{
                        maxWidth: "28rem",
                        textAlign: "center",
                    }}>
                        <p style={{
                            marginBottom: "1rem",
                            fontSize: "1.25rem",
                            fontWeight: "600",
                        }}>
                            {branding.appName}
                        </p>
                        <div style={{
                            margin: "0 auto 1rem",
                            width: "3rem",
                            height: "3rem",
                            borderRadius: "50%",
                            backgroundColor: "oklch(0.704 0.191 22.216 / 20%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <AlertCircle
                                width={24}
                                height={24}
                                color="oklch(0.704 0.191 22.216)"
                            />
                        </div>
                        <h1 style={{
                            marginBottom: "0.5rem",
                            fontSize: "1.5rem",
                            fontWeight: "600",
                        }}>
                            {branding.errors.genericTitle}
                        </h1>
                        <p style={{
                            marginBottom: "1.5rem",
                            color: "oklch(0.715 0 0)",
                        }}>
                            {branding.errors.genericMessage}
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "oklch(0.262 0.009 248.19)",
                                backgroundColor: "oklch(0.836 0.157 82.52)",
                                border: "none",
                                borderRadius: "0.375rem",
                                cursor: "pointer",
                            }}
                        >
                            {branding.errors.tryAgain}
                        </button>
                        {error.digest && (
                            <p style={{
                                marginTop: "1rem",
                                fontSize: "0.75rem",
                                color: "oklch(0.51 0 0)",
                            }}>
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
