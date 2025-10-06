import { logger } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { type BetterAuthPlugin, genericOAuth } from "better-auth/plugins";
import type { GenericEndpointContext, User } from "better-auth/types";
import type { Dub } from "dub";
import { z } from "zod";

export interface DubConfig {
  /**
   * Dub instance
   */
  dubClient: Dub;
  /**
   * Disable dub tracking for sign up events
   *
   * @default false
   */
  disableLeadTracking?: boolean;
  /**
   * Event name for sign up leads
   *
   * @default "Sign Up"
   */
  leadEventName?: string;
  /**
   * Custom lead track function
   */
  customLeadTrack?: (user: User, ctx: GenericEndpointContext) => Promise<void>;
  /**
   * Dub OAuth configuration
   */
  oauth?: {
    /**
     * Client ID
     */
    clientId: string;
    /**
     * Client secret
     */
    clientSecret: string;
    /**
     * Enable PKCE
     *
     * @default true
     */
    pkce?: boolean;
  };
}

export const dubAnalytics = (opts: DubConfig): BetterAuthPlugin => {
  const dub = opts.dubClient;
  const oauth = opts.oauth
    ? genericOAuth({
        config: [
          {
            providerId: "dub",
            authorizationUrl: "https://app.dub.co/oauth/authorize",
            tokenUrl: "https://api.dub.co/oauth/token",
            clientId: opts.oauth?.clientId,
            clientSecret: opts.oauth?.clientSecret,
            pkce: opts.oauth?.pkce === undefined ? true : opts.oauth.pkce,
          },
        ],
      })
    : undefined;
  return {
    id: "dub",
    endpoints: {
      linkDub: createAuthEndpoint(
        "/dub/link",
        {
          method: "POST",
          body: z.object({
            callbackURL: z.string().url(),
          }),
        },
        async (ctx) => {
          if (!oauth) {
            throw ctx.error("NOT_FOUND", {
              message: "Dub OAuth is not configured",
            });
          }
          const response = await oauth.endpoints.oAuth2LinkAccount({
            ...ctx,
            body: {
              providerId: "dub",
              callbackURL: ctx.body.callbackURL,
            },
          });
          return response;
        }
      ),
    },
    init: () => {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                after: async (user, ctx) => {
                  const dubId = ctx?.getCookie("dub_id");
                  if (!dubId) {
                    return;
                  }
                  if (!opts.disableLeadTracking && ctx) {
                    if (opts.customLeadTrack) {
                      await opts.customLeadTrack(user, ctx);
                    } else {
                      await dub.track
                        .lead({
                          clickId: dubId,
                          eventName: opts.leadEventName || "Sign Up",
                          customerExternalId: user.id,
                          customerName: user.name,
                          customerEmail: user.email,
                          customerAvatar: user.image,
                        })
                        .catch((e) => {
                          logger.error(e);
                        });
                    }
                    ctx?.setCookie("dub_id", "", {
                      expires: new Date(0),
                      maxAge: 0,
                    });
                  }
                },
              },
            },
          },
        },
      };
    },
  };
};
