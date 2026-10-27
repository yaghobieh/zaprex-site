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
  // IDEA-191: edge to edge on phones (notch / home indicator handled with safe-area insets); the keyboard resizes the page.
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#070b1a" },
    { media: "(prefers-color-scheme: dark)", color: "#070b1a" },
  ],
};

/** Applies the saved theme (dark space by default; light or system when chosen) before first paint so there is no flash. */
const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem('zaprex-theme');var d=p==='light'?false:p==='system'?window.matchMedia('(prefers-color-scheme: dark)').matches:true;document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${display.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
