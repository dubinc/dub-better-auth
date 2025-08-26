import type { BetterAuthClientPlugin } from "better-auth";
import type { dubAnalytics } from "./index";

export const dubAnalyticsClient = () => {
  return {
    id: "dub-analytics",
    $InferServerPlugin: {} as ReturnType<typeof dubAnalytics>,
  } satisfies BetterAuthClientPlugin;
};
