import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      domain: "https://wise-malamute-82.clerk.accounts.dev", //TODO: remove it
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;