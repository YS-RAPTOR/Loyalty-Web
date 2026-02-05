"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type AdminNavProps = {
    isAdmin: boolean;
};

const navItems = [
    { href: "/admin", label: "Dashboard", adminOnly: true },
    { href: "/admin/search", label: "Search", adminOnly: false },
    { href: "/admin/scan", label: "Scan QR", adminOnly: false },
    { href: "/admin/events", label: "Events", adminOnly: true },
    { href: "/admin/insights", label: "Insights", adminOnly: true },
] as const;

function useFilteredNavItems(isAdmin: boolean) {
    const pathname = usePathname();
    const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);
    
    return filteredItems.map((item) => {
        const isActive = item.href === "/admin" 
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return { ...item, isActive };
    });
}

export function AdminNav({ isAdmin }: AdminNavProps) {
    const items = useFilteredNavItems(isAdmin);

    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                {items.map((item) => (
                    <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                            render={<Link href={item.href} />}
                            active={item.isActive}
                        >
                            {item.label}
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

export function AdminNavMobile({ isAdmin }: AdminNavProps) {
    const items = useFilteredNavItems(isAdmin);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" size="icon-sm">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                }
            />
            <DropdownMenuContent align="start">
                {items.map((item) => (
                    <DropdownMenuItem
                        key={item.href}
                        render={<Link href={item.href} />}
                        className={item.isActive ? "bg-muted" : ""}
                    >
                        {item.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
