import { ConvexHttpClient } from "convex/browser";
import { clientConfig } from "./config";

export function convex() {
    return new ConvexHttpClient(clientConfig.convex.url);
}

