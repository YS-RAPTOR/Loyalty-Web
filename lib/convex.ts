import { ConvexHttpClient } from "convex/browser";
import { clientConfig } from "./config";

export const convex = new ConvexHttpClient(clientConfig.convex.url);
