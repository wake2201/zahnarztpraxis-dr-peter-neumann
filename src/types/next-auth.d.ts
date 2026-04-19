import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "admin" | "staff";
  }

  interface Session {
    user: {
      id: string;
      email: string | null;
      name?: string | null;
      role: "admin" | "staff";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "staff";
  }
}
