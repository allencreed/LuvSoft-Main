import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign In — Love Soft Life",
  description:
    "Sign in or create your Love Soft Life account for your cart, orders, and early access.",
};

export default function AuthLoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-canvas px-6 py-20">
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
