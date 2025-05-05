import { BetterAuthClientPlugin } from "better-auth"
import { dubAnalytics } from "."


export const dubAnalyticsClient = () => {
    return {
        id: "dub-analytics",
        $InferServerPlugin: {} as ReturnType<typeof dubAnalytics>
    } satisfies BetterAuthClientPlugin
}