import type { Metadata } from "next";
import { Suspense } from "react";
import { CallbackHandler } from "@/components/CallbackHandler";

export const metadata: Metadata = { title: "Signing in", robots: { index: false, follow: false } };

export default function AuthCallbackPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <Suspense fallback={null}><CallbackHandler /></Suspense>
    </main>
  );
}
