import type { Metadata } from "next";
import { RegistrationForm } from "./registration-form";

export const metadata: Metadata = {
    title: "Register - Loyalty Program",
    description: "Join our loyalty program and start earning rewards",
};

export default function RegisterPage() {
    return (
        <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
            <RegistrationForm />
        </main>
    );
}
