import { SignUp } from "@clerk/nextjs";
import { branding } from "@/lib/branding";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-muted/50 to-background">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                    {branding.appName}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {branding.tagline}
                </p>
            </div>
            <SignUp />
        </div>
    );
}
