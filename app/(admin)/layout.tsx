import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getRoleFromPublicMetadata, hasMinRoles, roleDisplayNames } from "@/lib/roles";
import { branding } from "@/lib/branding";
import { Toaster } from "@/components/ui/sonner";
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
        <div className="min-h-screen bg-stone-50">
            {/* Skip link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-stone-900 focus:shadow-lg focus:ring-2 focus:ring-stone-400"
            >
                Skip to main content
            </a>
            
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="text-xl font-semibold">
                            {branding.adminName}
                        </Link>
                        <AdminNav isAdmin={userIsAdmin} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-stone-500">
                            {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                            {role && (
                                <span className="ml-2 rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                                    {roleDisplayNames[role]}
                                </span>
                            )}
                        </div>
                        <UserButton />
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="border-t px-4 py-2 md:hidden">
                    <AdminNavMobile isAdmin={userIsAdmin} />
                </div>
            </header>

            {/* Main content */}
            <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                        </div>
                    }
                >
                    {children}
                </Suspense>
            </main>

            <Toaster />
        </div>
    );
}
