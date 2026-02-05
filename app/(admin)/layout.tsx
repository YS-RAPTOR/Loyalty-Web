import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getRoleFromPublicMetadata, hasMinRoles, roleDisplayNames } from "@/lib/roles";
import { branding } from "@/lib/branding";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/ui/logo";
import { AdminNav, AdminNavMobile } from "./_components/admin-nav";
import { Loader2 } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const user = await currentUser();
    const role = getRoleFromPublicMetadata(user?.publicMetadata);
    const userIsAdmin = hasMinRoles(role, "admin");

    return (
        <div className="min-h-screen bg-background">
            {/* Skip link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
            >
                Skip to main content
            </a>

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Left: Logo and Nav */}
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Mobile menu */}
                        <div className="md:hidden">
                            <AdminNavMobile isAdmin={userIsAdmin} />
                        </div>
                        <Link href="/admin" className="flex items-center gap-2.5 font-semibold text-foreground">
                            <Logo size="sm" />
                            <span className="hidden sm:inline text-lg">{branding.adminName}</span>
                        </Link>
                        <AdminNav isAdmin={userIsAdmin} />
                    </div>

                    {/* Right: User info and avatar */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {role && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {roleDisplayNames[role]}
                                </span>
                            )}
                            <span className="hidden text-sm font-medium text-foreground sm:inline">
                                {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                            </span>
                        </div>
                        <div className="flex items-center [&_.cl-avatarBox]:size-8! [&_.cl-userButtonTrigger]:p-0!">
                            <UserButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>

            <Toaster />
        </div>
    );
}
