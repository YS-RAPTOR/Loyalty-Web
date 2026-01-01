"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    sendOtpAction,
    verifyOtpAction,
    createCustomerAction,
} from "@/lib/actions/registration";
import { registrationSchema } from "@/lib/validations/customer";

type Step = "info" | "otp" | "already-registered";

interface FormErrors {
    phone?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    acceptedTerms?: string;
}

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
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const result = registrationSchema.safeParse({
            phone,
            firstName,
            lastName: lastName || undefined,
            email: email || undefined,
            acceptedTerms,
        });

        if (!result.success) {
            const errors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof FormErrors;
                if (!errors[field]) {
                    errors[field] = issue.message;
                }
            }
            setFieldErrors(errors);
            return false;
        }

        setFieldErrors({});
        return true;
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

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
                firstName: firstName.trim(),
                lastName: lastName.trim() || undefined,
                email: email.trim() || undefined,
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
                            setFieldErrors({});
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
                    <form id="otp-form" onSubmit={handleVerifyOtp}>
                        <FieldGroup>
                            <FieldDescription>
                                We sent a verification code to {phone}
                            </FieldDescription>

                            <Field>
                                <FieldLabel>Verification Code</FieldLabel>
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
                            </Field>

                            {error && <FieldError>{error}</FieldError>}
                        </FieldGroup>
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
                <form id="registration-form" onSubmit={handleSendOtp}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="0412 345 678"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (fieldErrors.phone) {
                                        setFieldErrors({ ...fieldErrors, phone: undefined });
                                    }
                                }}
                                aria-invalid={!!fieldErrors.phone}
                            />
                            {fieldErrors.phone && <FieldError>{fieldErrors.phone}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    if (fieldErrors.firstName) {
                                        setFieldErrors({ ...fieldErrors, firstName: undefined });
                                    }
                                }}
                                maxLength={100}
                                aria-invalid={!!fieldErrors.firstName}
                            />
                            {fieldErrors.firstName && <FieldError>{fieldErrors.firstName}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Smith"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    if (fieldErrors.lastName) {
                                        setFieldErrors({ ...fieldErrors, lastName: undefined });
                                    }
                                }}
                                maxLength={100}
                                aria-invalid={!!fieldErrors.lastName}
                            />
                            {fieldErrors.lastName && <FieldError>{fieldErrors.lastName}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (fieldErrors.email) {
                                        setFieldErrors({ ...fieldErrors, email: undefined });
                                    }
                                }}
                                maxLength={254}
                                aria-invalid={!!fieldErrors.email}
                            />
                            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
                        </Field>

                        <Field orientation="horizontal">
                            <Checkbox
                                id="terms"
                                checked={acceptedTerms}
                                onCheckedChange={(checked) => {
                                    setAcceptedTerms(checked === true);
                                    if (fieldErrors.acceptedTerms) {
                                        setFieldErrors({ ...fieldErrors, acceptedTerms: undefined });
                                    }
                                }}
                            />
                            <FieldLabel htmlFor="terms" className="font-normal">
                                I accept the{" "}
                                <Link
                                    href="/terms"
                                    className="text-primary underline"
                                >
                                    Terms and Conditions
                                </Link>
                            </FieldLabel>
                        </Field>
                        {fieldErrors.acceptedTerms && <FieldError>{fieldErrors.acceptedTerms}</FieldError>}

                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button
                    type="submit"
                    form="registration-form"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending Code..." : "Continue"}
                </Button>
            </CardFooter>
        </Card>
    );
}
