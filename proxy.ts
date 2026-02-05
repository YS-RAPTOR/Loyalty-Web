import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasMinRoles, getRoleFromMetadata } from "@/lib/roles";

const isPublicRoute = createRouteMatcher([
    "/",
    "/register",
    "/qr(.*)",
    "/terms",
    "/promotion-terms",
    "/api/qr(.*)",
    "/api/og(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
]);
const isAdminRoute = createRouteMatcher([
    "/admin",
    "/admin/events(.*)",
    "/admin/insights(.*)",
    "/admin/offers/discontinued(.*)",
]);
const isTrustedStaffRoute = createRouteMatcher([
    // Example: "/admin/customers/:id/edit(.*)",
]);
const isStaffRoute = createRouteMatcher([
    // Currently all other admin routes fall through to require just authentication
]);

const UNAUTHORIZED_REDIRECT = "/admin/search";

export default clerkMiddleware(async (auth, req) => {
    // Allow public routes without authentication
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // All non-public routes require authentication
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
    }

    // Get user role from session claims
    const role = getRoleFromMetadata(sessionClaims?.metadata);

    // Check role-restricted routes (most restrictive first)
    if (isAdminRoute(req)) {
        if (!hasMinRoles(role, "admin")) {
            return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, req.url));
        }
    } else if (isTrustedStaffRoute(req)) {
        if (!hasMinRoles(role, "trusted")) {
            return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, req.url));
        }
    } else if (isStaffRoute(req)) {
        if (!hasMinRoles(role, "staff")) {
            return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
