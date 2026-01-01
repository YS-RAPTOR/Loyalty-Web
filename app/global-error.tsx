"use client";

import { useEffect } from "react";

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
        <html>
            <body>
                <div style={{
                    display: "flex",
                    minHeight: "100vh",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}>
                    <div style={{
                        maxWidth: "28rem",
                        textAlign: "center",
                    }}>
                        <div style={{
                            margin: "0 auto 1rem",
                            width: "3rem",
                            height: "3rem",
                            borderRadius: "50%",
                            backgroundColor: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#dc2626"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h1 style={{
                            marginBottom: "0.5rem",
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#111827",
                        }}>
                            Something went wrong
                        </h1>
                        <p style={{
                            marginBottom: "1.5rem",
                            color: "#6b7280",
                        }}>
                            A critical error occurred. Please try again.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "#ffffff",
                                backgroundColor: "#111827",
                                border: "none",
                                borderRadius: "0.375rem",
                                cursor: "pointer",
                            }}
                        >
                            Try again
                        </button>
                        {error.digest && (
                            <p style={{
                                marginTop: "1rem",
                                fontSize: "0.75rem",
                                color: "#9ca3af",
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
