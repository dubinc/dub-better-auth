import { BetterAuthClientPlugin } from "better-auth"
import { dubTracker } from "."


export const dubTrackerClient = () => {
    return {
        id: "dub-tracker",
        $InferServerPlugin: {} as ReturnType<typeof dubTracker>
    } satisfies BetterAuthClientPlugin
}