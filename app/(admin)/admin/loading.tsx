import { Loader2 } from "lucide-react";
import { branding } from "@/lib/branding";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading {branding.adminName}...</p>
        </div>
    );
}
