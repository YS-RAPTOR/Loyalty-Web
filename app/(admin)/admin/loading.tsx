import { Loader2 } from "lucide-react";
import { branding } from "@/lib/branding";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            <p className="text-sm text-stone-500">Loading {branding.adminName}...</p>
        </div>
    );
}
