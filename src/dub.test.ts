import { Dub } from "dub";
import { describe, expect, it, vi } from "vitest";
import { betterAuth } from "better-auth";
import { dubAnalytics } from ".";

const mockTrackLead = vi.fn(async (props?: Record<string, string>) => {});
vi.mock("dub", () => ({
  Dub: vi.fn().mockImplementation(() => ({
    track: {
      lead: mockTrackLead,
    },
  })),
}));

describe("dub", async () => {
  const auth = betterAuth({
    plugins: [
      dubAnalytics({
        dubClient: new Dub({
          token: "test",
        }),
      }),
    ],
    emailAndPassword: {
      enabled: true,
    },
  });
  it("should track lead on sign up", async () => {
    const response = await auth.api.signUpEmail({
      body: {
        email: "test@example.com",
        name: "test",
        password: "password",
      },
      headers: {
        cookie: "dub_id=123",
      },
    });
    expect(mockTrackLead).toHaveBeenCalledWith({
      clickId: "123",
      eventName: "Sign Up",
      externalId: response.user.id,
      customerName: response.user.name,
      customerEmail: response.user.email,
      customerAvatar: response.user.image,
    });
  });
});
