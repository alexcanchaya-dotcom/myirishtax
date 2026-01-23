import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      subscriptionTier: string;
      subscriptionStatus: string;
      stripeCustomerId: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    stripeCustomerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    stripeCustomerId: string | null;
  }
}
