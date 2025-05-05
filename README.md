# Dub Better Auth

Dub Better Auth is a plugin for [Dub](https://dub.co) that allows you to [track conversion events](https://dub.co/docs/conversions/quickstart) in your BetterAuth application.

## Installation

```bash
npm install @dub/better-auth
```

## Usage

### Lead Tracking

```ts
import { dubAnalytics } from "@dub/better-auth";
import { betterAuth } from "better-auth";

const dub = new Dub({
  apiKey: "your-api-key",
});

const betterAuth = betterAuth({
  plugins: [
    dubAnalytics({
      dubClient: dub,
      leadEventName: "Sign Up",
      customLeadTrack: async (user, ctx) => {
        console.log("Custom lead track function");
      },
    }),s
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
