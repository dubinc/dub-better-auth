
import { createEndpoint, z } from "better-auth";
import { BetterAuthPlugin, genericOAuth } from "better-auth/plugins"
import { GenericEndpointContext, User } from "better-auth/types";
import { Dub } from "dub";

export interface DubConfig {
    /**
     * Dub instance
     */
    dub: Dub
    /**
     * Events to track
     */
    events?: {
        /**
         * Track sign up events
         */
        signUp?: {
            /**
             * Enable sign up events
             * 
             * @default true
             */
            enabled: boolean,
            /**
             * Event name
             * 
             * @default "Sign Up"
             */
            eventName?: string,
            /**
             * Custom track function
             */
            customTrack?: (user: User, ctx: GenericEndpointContext) => Promise<void>
        },
    },
    oauth?: {
        /**
         * Client ID
         */
        clientId: string,
        /**
         * Client secret
         */
        clientSecret: string,
        /**
         * Enable PKCE
         * 
         * @default true
         */
        pkce?: boolean
    }
}

export const dubTracker = (opts: DubConfig) => {
    const dub = opts.dub
    const oauth = opts.oauth ? genericOAuth({
        config: [{
            providerId: "dub",
            authorizationUrl: "https://app.dub.co/oauth/authorize",
            tokenUrl: "https://api.dub.co/oauth/token",
            clientId: opts.oauth?.clientId,
            clientSecret: opts.oauth?.clientSecret,
            pkce: opts.oauth?.pkce === undefined ? true : opts.oauth.pkce
        }]
    }) : undefined
    return {
        id: "dub",
        endpoints: {
            linkDub: createEndpoint("/dub/link", {
                method: "POST",
                body: z.object({
                    callbackURL: z.string().url()
                })
            }, async (ctx) => {
                if (!oauth) {
                    throw ctx.error("NOT_FOUND", {
                        message: "Dub OAuth is not configured"
                    })
                }
                const response = await oauth.endpoints.oAuth2LinkAccount({
                    ...ctx,
                    body: {
                        providerId: "dub",
                        callbackURL: ctx.body.callbackURL
                    }
                })
                return response
            }),
        },
        init: () => {
            return {
                options: {
                    databaseHooks: {
                        user: {
                            create: {
                                after: async (user, ctx) => {
                                    const dubId = ctx?.getCookie("dub_id")
                                    if (!dubId) {
                                        return
                                    }
                                    if (opts.events?.signUp?.enabled && ctx) {
                                        if (opts.events.signUp.customTrack) {
                                            await opts.events.signUp.customTrack(user, ctx)
                                        } else {
                                            await dub.track.lead({
                                                clickId: dubId,
                                                eventName: opts.events?.signUp?.eventName || "Sign Up",
                                                externalId: user.id,
                                                customerName: user.name,
                                                customerEmail: user.email,
                                                customerAvatar: user.image,
                                            });
                                        }
                                        ctx?.setCookie("dub_id", "", {
                                            expires: new Date(0),
                                            maxAge: 0,
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } satisfies BetterAuthPlugin
}