"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { branding } from "@/lib/branding";
import { Gift, Smartphone, UserCheck, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

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
            <div className="w-full max-w-md">
                <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <UserCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Already Registered
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            {branding.program.alreadyRegisteredMessage}
                        </p>
                    </div>
                    <div className="mt-8">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setPhone("");
                                setStep("info");
                                setError("");
                                setFieldErrors({});
                            }}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "otp") {
        return (
            <div className="w-full max-w-md">
                <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Smartphone className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Verify Your Phone
                        </h1>
                    </div>
                    <form id="otp-form" onSubmit={handleVerifyOtp} className="mt-6">
                        <FieldGroup className="items-center">
                            <FieldDescription className="text-center">
                                We sent a verification code to {phone}
                            </FieldDescription>

                            <div className="flex justify-center">
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

                            {error && <FieldError className="text-center">{error}</FieldError>}
                        </FieldGroup>
                    </form>
                    <div className="mt-8 space-y-3">
                        <Button
                            type="submit"
                            form="otp-form"
                            className="w-full"
                            size="lg"
                            disabled={isLoading || otpCode.length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify & Register"
                            )}
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
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {branding.program.joinHeading}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {branding.program.joinSubtitle}
                    </p>
                </div>
                <form id="registration-form" onSubmit={handleSendOtp} className="mt-6">
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
                                    className="text-primary underline hover:text-primary/80"
                                >
                                    Terms and Conditions
                                </Link>
                            </FieldLabel>
                        </Field>
                        {fieldErrors.acceptedTerms && <FieldError>{fieldErrors.acceptedTerms}</FieldError>}

                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>
                </form>
                <div className="mt-8">
                    <Button
                        type="submit"
                        form="registration-form"
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending Code...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
