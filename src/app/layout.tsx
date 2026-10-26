import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { DESCRIPTION, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display-face", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: ${TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["Zaprex", "Ingot", "AI coding bot", "background agent", "draft pull request", "nightly test-and-fix", "AI IDE", "open source"],
  authors: [{ name: "Ingot" }],
  creator: "Ingot",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE_URL, siteName: SITE_NAME, title: `${SITE_NAME}: ${TAGLINE}`, description: DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${SITE_NAME}: ${TAGLINE}`, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

/** Applies the saved theme (or the system one) before first paint so there is no flash. */
const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem('zaprex-theme');var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${inter.variable} ${display.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
