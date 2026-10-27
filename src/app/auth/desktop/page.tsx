import type { Metadata } from "next";
import { Suspense } from "react";
import { DesktopHandoff } from "@/components/DesktopHandoff";

export const metadata: Metadata = { title: "Back to the Zaprex app", robots: { index: false, follow: false } };

/** Browser leg of the desktop app sign-in: the Ingot portal lands here, and we pass the one-time code on to the app. */
export default function AuthDesktopPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <Suspense fallback={null}><DesktopHandoff /></Suspense>
    </main>
  );
}
