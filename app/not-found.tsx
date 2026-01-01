import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
                    <Logo size="lg" className="mx-auto mb-6" />
                    <h1 className="text-6xl font-bold tracking-tight text-muted-foreground">
                        404
                    </h1>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="mt-8 flex flex-col gap-3">
                        <Button render={<Link href="/register" />} nativeButton={false} className="w-full gap-2">
                            <UserPlus className="h-4 w-4" />
                            Register for Rewards
                        </Button>
                        <Button render={<Link href="/admin" />} nativeButton={false} variant="outline" className="w-full gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Staff Login
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
