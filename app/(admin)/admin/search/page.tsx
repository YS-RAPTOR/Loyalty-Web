"use client";

import { useQuery } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingCard } from "@/components/ui/empty-state";
import { Search, User } from "lucide-react";
import Link from "next/link";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDate } from "@/lib/date";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q") || "";
    const debouncedQuery = useDebouncedValue(searchQuery);

    const handleSearchChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        router.replace(`/admin/search?${params.toString()}`);
    };

    // Use full-text search index
    const results = useQuery(
        api.customers.search,
        debouncedQuery.trim() ? { query: debouncedQuery.trim() } : "skip"
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Customer Search"
                description="Search by name, phone number, or email"
            />

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            {!debouncedQuery.trim() ? (
                <EmptyState
                    icon={User}
                    title="Enter a search term to find customers"
                    description="Search by first name, last name, phone number, or email"
                />
            ) : results === undefined ? (
                <LoadingCard message="Searching..." />
            ) : results.length === 0 ? (
                <LoadingCard message={`No customers found for "${debouncedQuery}"`} />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((customer) => (
                                <TableRow key={customer._id}>
                                    <TableCell>
                                        <Link
                                            href={`/admin/customers/${customer._id}`}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {customer.firstName}{" "}
                                            {customer.lastName || ""}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {customer.phoneE164}
                                    </TableCell>
                                    <TableCell className="text-stone-500">
                                        {customer.email || "-"}
                                    </TableCell>
                                    <TableCell className="text-stone-500">
                                        {formatDate(customer.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {results && results.length >= 50 && (
                <p className="text-center text-sm text-stone-500">
                    Showing first 50 results. Refine your search for more specific results.
                </p>
            )}
        </div>
    );
}
