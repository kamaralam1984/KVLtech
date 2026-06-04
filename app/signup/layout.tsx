import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Join KVL TECH | Free Registration",
  description: "Create a free KVL TECH account — manage your digital project, track orders and get dedicated 24/7 support.",
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
