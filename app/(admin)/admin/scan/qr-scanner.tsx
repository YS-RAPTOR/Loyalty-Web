"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, RotateCcw, AlertCircle, Check } from "lucide-react";

type ScannerStatus = "idle" | "starting" | "scanning" | "stopped" | "success" | "error";

export function QrScanner() {
    const router = useRouter();
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isTransitioningRef = useRef(false);
    const isMountedRef = useRef(true);
    
    const [status, setStatus] = useState<ScannerStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const stopScanner = useCallback(async () => {
        if (!scannerRef.current || isTransitioningRef.current) return;
        
        try {
            const state = scannerRef.current.getState();
            if (state === Html5QrcodeScannerState.SCANNING || 
                state === Html5QrcodeScannerState.PAUSED) {
                isTransitioningRef.current = true;
                await scannerRef.current.stop();
                isTransitioningRef.current = false;
                if (isMountedRef.current) {
                    setStatus("stopped");
                }
            }
        } catch (e) {
            isTransitioningRef.current = false;
            console.error("Error stopping scanner:", e);
        }
    }, []);

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        // Prevent multiple navigations
        if (!isMountedRef.current) return;
        
        setStatus("success");
        setScannedId(decodedText);
        
        // Stop scanner before navigating
        await stopScanner();
        
        // Navigate to customer page
        router.push(`/admin/customers/${decodedText}`);
    }, [router, stopScanner]);

    const startScanner = useCallback(async () => {
        // Prevent starting if already transitioning or not idle
        if (isTransitioningRef.current) return;
        
        // Check if scanner already exists and is running
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === Html5QrcodeScannerState.SCANNING) {
                    setStatus("scanning");
                    return;
                }
            } catch {
                // Ignore state check errors
            }
        }
        
        isTransitioningRef.current = true;
        setStatus("starting");
        setErrorMessage(null);
        
        try {
            // Create scanner instance if it doesn't exist
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("qr-reader");
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1,
            };

            await scannerRef.current.start(
                { facingMode: "environment" },
                config,
                handleScanSuccess,
                // Silence scan failures (they happen constantly when no QR is visible)
                () => {}
            );

            isTransitioningRef.current = false;
            
            if (isMountedRef.current) {
                setStatus("scanning");
                setHasPermission(true);
            }
        } catch (err) {
            isTransitioningRef.current = false;
            console.error("Failed to start scanner:", err);
            
            if (!isMountedRef.current) return;
            
            // Check if this is a transition error (can happen in strict mode)
            if (err instanceof Error && err.message.includes("transition")) {
                // Wait a bit and check state again
                setTimeout(() => {
                    if (scannerRef.current && isMountedRef.current) {
                        try {
                            const state = scannerRef.current.getState();
                            if (state === Html5QrcodeScannerState.SCANNING) {
                                setStatus("scanning");
                                setHasPermission(true);
                                return;
                            }
                        } catch {
                            // Ignore
                        }
                    }
                    setStatus("error");
                    setErrorMessage("Scanner initialization failed. Please try again.");
                }, 500);
                return;
            }
            
            setStatus("error");
            
            if (err instanceof Error) {
                if (err.message.includes("Permission denied") || 
                    err.message.includes("NotAllowedError")) {
                    setHasPermission(false);
                    setErrorMessage("Camera permission denied. Please allow camera access to scan QR codes.");
                } else if (err.message.includes("NotFoundError") || 
                           err.message.includes("No cameras found")) {
                    setErrorMessage("No camera found. Please ensure your device has a camera.");
                } else {
                    setErrorMessage(err.message || "Failed to start camera");
                }
            } else {
                setErrorMessage("An unexpected error occurred");
            }
        }
    }, [handleScanSuccess]);

    const handleRetry = useCallback(async () => {
        setErrorMessage(null);
        setScannedId(null);
        
        // Clear the scanner instance to get a fresh start
        if (scannerRef.current) {
            try {
                await stopScanner();
                scannerRef.current.clear();
            } catch {
                // Ignore cleanup errors
            }
            scannerRef.current = null;
        }
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            if (isMountedRef.current) {
                startScanner();
            }
        }, 100);
    }, [startScanner, stopScanner]);

    // Setup and cleanup
    useEffect(() => {
        isMountedRef.current = true;
        
        // Small delay to ensure DOM element exists
        const timer = setTimeout(() => {
            if (isMountedRef.current && status === "idle") {
                startScanner();
            }
        }, 100);
        
        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
            
            // Cleanup scanner on unmount
            if (scannerRef.current) {
                const scanner = scannerRef.current;
                try {
                    const state = scanner.getState();
                    if (state === Html5QrcodeScannerState.SCANNING || 
                        state === Html5QrcodeScannerState.PAUSED) {
                        scanner.stop().then(() => {
                            scanner.clear();
                        }).catch(() => {
                            // Ignore cleanup errors
                        });
                    } else {
                        scanner.clear();
                    }
                } catch {
                    // Ignore cleanup errors
                }
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    QR Scanner
                </CardTitle>
                <CardDescription>
                    Point your camera at a customer&apos;s QR code
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Scanner container */}
                    <div className="relative overflow-hidden rounded-lg bg-stone-100">
                        <div 
                            id="qr-reader" 
                            className="w-full"
                            style={{ minHeight: "300px" }}
                        />
                        
                        {/* Overlay for different states */}
                        {(status === "idle" || status === "starting") && (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                                <div className="text-center space-y-2">
                                    <div className="animate-pulse">
                                        <Camera className="mx-auto h-12 w-12 text-stone-400" />
                                    </div>
                                    <p className="text-sm text-stone-500">Starting camera...</p>
                                </div>
                            </div>
                        )}
                        
                        {status === "success" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-50/90">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check className="w-6 h-6 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-green-700">QR Code Scanned!</p>
                                    <p className="text-xs text-green-600">Redirecting to customer...</p>
                                </div>
                            </div>
                        )}
                        
                        {status === "stopped" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                                <div className="text-center space-y-2">
                                    <CameraOff className="mx-auto h-12 w-12 text-stone-400" />
                                    <p className="text-sm text-stone-500">Scanner stopped</p>
                                </div>
                            </div>
                        )}
                        
                        {status === "error" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                                <div className="text-center space-y-4 p-4 max-w-sm">
                                    {hasPermission === false ? (
                                        <>
                                            <CameraOff className="mx-auto h-12 w-12 text-stone-400" />
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-stone-700">
                                                    Camera Access Required
                                                </p>
                                                <p className="text-sm text-stone-600">
                                                    {errorMessage}
                                                </p>
                                                <div className="rounded-md bg-stone-50 p-3 text-left text-xs text-stone-500 space-y-1">
                                                    <p className="font-medium text-stone-600">To enable camera access:</p>
                                                    <ol className="list-decimal list-inside space-y-0.5">
                                                        <li>Click the lock or camera icon in the address bar</li>
                                                        <li>Find &quot;Camera&quot; in the permissions list</li>
                                                        <li>Select &quot;Allow&quot; to grant access</li>
                                                        <li>Refresh the page and try again</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                                            <p className="text-sm text-stone-600">
                                                {errorMessage}
                                            </p>
                                        </>
                                    )}
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={handleRetry}
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    {status === "scanning" && (
                        <div className="text-center space-y-2">
                            <p className="text-sm text-stone-500">
                                Position the QR code within the frame
                            </p>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={stopScanner}
                            >
                                <CameraOff className="mr-2 h-4 w-4" />
                                Stop Scanner
                            </Button>
                        </div>
                    )}

                    {status === "stopped" && (
                        <div className="text-center">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={startScanner}
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                Start Scanner
                            </Button>
                        </div>
                    )}

                    {/* Debug info in development */}
                    {scannedId && status === "success" && (
                        <p className="text-xs text-stone-400 text-center font-mono">
                            ID: {scannedId}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
