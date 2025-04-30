# Dub Better Auth

Dub Better Auth is a plugin for [Dub](https://dub.sh) that allows you to track events in your BetterAuth application.

## Installation

```bash
npm install @dub/better-auth
```

## Usage

### Server

```ts
import { dubTracker } from "@dub/better-auth";
import { betterAuth } from "better-auth";

const dub = new Dub({
  apiKey: "your-api-key",
});

const betterAuth = betterAuth({
  plugins: [
    dubTracker({
      dub,
      events: {
        signUp: {
          enabled: true, // Enable sign up events
        },
      },
    }),
  ],
});
```

### Client

```ts
import { dubTrackerClient } from "@dub/better-auth";
import { createAuthClient } from "better-auth/client"; //react, vue, svelte, solid, etc.

const authClient = createAuthClient({
  plugins: [dubTrackerClient()],
});
```
