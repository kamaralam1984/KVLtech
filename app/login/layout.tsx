import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Client Portal | KVL TECH",
  description: "Sign in to your KVL TECH client portal — track your orders, submit branding details and raise support tickets.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
