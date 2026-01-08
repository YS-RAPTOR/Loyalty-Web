"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsCheckboxProps {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    href: string;
    label: string;
}

export function TermsCheckbox({
    id,
    checked,
    onCheckedChange,
    href,
    label,
}: TermsCheckboxProps) {
    return (
        <div className="flex items-start gap-3">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(checked) => onCheckedChange(checked === true)}
                className="mt-0.5 shrink-0"
            />
            <label htmlFor={id} className="text-sm">
                I accept the{" "}
                <Link
                    href={href}
                    className="text-primary underline hover:text-primary/80"
                >
                    {label}
                </Link>
            </label>
        </div>
    );
}
