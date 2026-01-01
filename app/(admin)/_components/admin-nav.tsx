"use client";

import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

type AdminNavProps = {
    isAdmin: boolean;
};

const navItems = [
    { href: "/admin", label: "Dashboard", adminOnly: true },
    { href: "/admin/search", label: "Search", adminOnly: false },
    { href: "/admin/scan", label: "Scan QR", adminOnly: false },
    { href: "/admin/events", label: "Events", adminOnly: true },
] as const;

function NavItems({ isAdmin }: AdminNavProps) {
    const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

    return (
        <>
            {filteredItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                        render={<Link href={item.href} />}
                    >
                        {item.label}
                    </NavigationMenuLink>
                </NavigationMenuItem>
            ))}
        </>
    );
}

export function AdminNav({ isAdmin }: AdminNavProps) {
    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                <NavItems isAdmin={isAdmin} />
            </NavigationMenuList>
        </NavigationMenu>
    );
}

export function AdminNavMobile({ isAdmin }: AdminNavProps) {
    return (
        <NavigationMenu className="md:hidden">
            <NavigationMenuList className="gap-1">
                <NavItems isAdmin={isAdmin} />
            </NavigationMenuList>
        </NavigationMenu>
    );
}
