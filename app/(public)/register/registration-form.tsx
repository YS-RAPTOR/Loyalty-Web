"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {
    sendOtpAction,
    verifyOtpAction,
    createCustomerAction,
} from "./actions";

type Step = "info" | "otp" | "already-registered";

export function RegistrationForm() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("info");
    const [phone, setPhone] = useState("");
    const [phoneE164, setPhoneE164] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await sendOtpAction(phone);

            if (!result.success) {
                if (result.alreadyRegistered) {
                    setStep("already-registered");
                    return;
                }
                setError(result.error || "Failed to send OTP");
                return;
            }

            setPhoneE164(result.phoneE164!);
            setStep("otp");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const verifyResult = await verifyOtpAction(phoneE164, otpCode);

            if (!verifyResult.success) {
                setError(verifyResult.error || "Invalid OTP");
                return;
            }

            // Create customer and send welcome SMS
            const createResult = await createCustomerAction({
                phoneE164,
                firstName,
                lastName: lastName || undefined,
                email: email || undefined,
            });

            if (!createResult.success) {
                if (createResult.alreadyRegistered) {
                    setStep("already-registered");
                    return;
                }
                setError(createResult.error || "Failed to create account");
                return;
            }

            // Redirect to QR page
            router.push(`/qr?id=${createResult.customerId}`);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (step === "already-registered") {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Already Registered</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This phone number is already registered in our loyalty
                        program.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                            setPhone("");
                            setStep("info");
                            setError("");
                        }}
                    >
                        Back
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (step === "otp") {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Verify Your Phone</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        id="otp-form"
                        onSubmit={handleVerifyOtp}
                        className="space-y-6"
                    >
                        <p className="text-sm text-muted-foreground">
                            We sent a verification code to {phone}
                        </p>

                        <div className="space-y-2">
                            <Label>Verification Code</Label>
                            <InputOTP
                                maxLength={6}
                                value={otpCode}
                                onChange={(value) => setOtpCode(value)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        form="otp-form"
                        className="w-full"
                        disabled={isLoading || otpCode.length !== 6}
                    >
                        {isLoading
                            ? "Verifying and Registering..."
                            : "Verify & Register"}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                            setStep("info");
                            setOtpCode("");
                            setError("");
                        }}
                    >
                        Back
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Join Our Loyalty Program</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    id="registration-form"
                    onSubmit={handleSendOtp}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="0412 345 678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            type="text"
                            placeholder="Smith"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="terms"
                            checked={acceptedTerms}
                            onCheckedChange={(checked) =>
                                setAcceptedTerms(checked === true)
                            }
                            required
                        />
                        <Label
                            htmlFor="terms"
                            className="text-sm font-normal leading-tight"
                        >
                            I accept the{" "}
                            <Link
                                href="/terms"
                                className="text-primary underline"
                            >
                                Terms and Conditions
                            </Link>
                        </Label>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </form>
            </CardContent>
            <CardFooter>
                <Button
                    type="submit"
                    form="registration-form"
                    className="w-full"
                    disabled={isLoading || !acceptedTerms}
                >
                    {isLoading ? "Sending Code..." : "Continue"}
                </Button>
            </CardFooter>
        </Card>
    );
}
