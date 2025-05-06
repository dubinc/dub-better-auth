# Dub Analytics - Better Auth Plugin

Dub Analytics Plugin is a plugin for [Dub](https://dub.co) that allows you to [track conversion events](https://dub.co/docs/conversions/quickstart) in your [Better Auth](https://better-auth.com) application.

## Installation

```bash
npm install @dub/better-auth
```

## Usage

### Lead Tracking

By default, the plugin will track sign up events as leads. You can disable this by setting `disableLeadTracking` to `true`.

```ts
import { dubAnalytics } from "@dub/better-auth";
import { betterAuth } from "better-auth";
import { Dub } from "dub";

const dub = new Dub({
  apiKey: "your-api-key",
});

const betterAuth = betterAuth({
  plugins: [
    dubAnalytics({
      dubClient: dub,
    }),
  ],
});
```

### OAuth

Dub Better Auth supports OAuth for authentication. You can configure the OAuth client ID and client secret in the `dubAnalytics` function.

```ts
dubAnalytics({
  dubClient: dub,
  oauth: {
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
  },
});
```

And in the client, you need to use the `dubAnalyticsClient` plugin.

```ts
import { createAuthClient } from "better-auth/client"
import { dubAnalyticsClient } from "@dub/better-auth/client"

const authClient = createAuthClient({
  plugins: [dubAnalyticsClient()],
});
```

To link account with Dub, you need to use the `dub.link`.

```ts
const response = await authClient.dub.link({
  callbackURL: "/dashboard", // URL to redirect to after linking
});
```

## Options

### `dubClient`

The Dub client instance.

### `disableLeadTracking`

Disable lead tracking for sign up events.

### `leadEventName`

Event name for sign up leads.

### `customLeadTrack`

Custom lead track function.

### `oauth`

Dub OAuth configuration.

### `oauth.clientId`

Client ID for Dub OAuth.

### `oauth.clientSecret`

Client secret for Dub OAuth.

### `oauth.pkce`

Enable PKCE for Dub OAuth.


## License

MIT
