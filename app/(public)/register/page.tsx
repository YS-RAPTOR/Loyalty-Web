import type { Metadata } from "next";
import { branding } from "@/lib/branding";
import { RegistrationForm } from "./registration-form";

export const metadata: Metadata = {
    title: branding.meta.registerTitle,
    description: branding.meta.registerDescription,
};

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <RegistrationForm />
            </div>
        </main>
    );
}
