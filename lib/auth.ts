import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [username()],
  user: {
    additionalFields: {
      displayName: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});

export type Auth = typeof auth;
