import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
  title: {
    default: "SceneHawk",
    template: "%s · SceneHawk",
  },
  description:
    "Describe the film you want to feel. SceneHawk searches by atmosphere, pacing, and visual language — not genre, rating, or what you watched last.",
  openGraph: {
    title: "SceneHawk",
    description:
      "Multi-agent film discovery — search by atmosphere, pacing, and visual language.",
    images: ["/scenehawk.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090a",
  colorScheme: "dark",
};

// No accounts: SceneHawk only searches a public film corpus, so there is
// nothing user-specific to protect. Don't add a sign-in button back.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 pb-2 pt-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 md:px-8">
            <Link
              href="/"
              aria-label="SceneHawk home"
              className="h-10 shrink-0 self-start overflow-hidden sm:h-auto sm:self-auto"
            >
              <Image
                src="/scenehawk.png"
                alt="SceneHawk"
                width={270}
                height={180}
                className="-my-4 h-[4.5rem] w-auto sm:-my-3"
                priority
              />
            </Link>
            <SiteNav />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 md:px-8">
          {children}
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between md:px-8">
            <p>
              <span translate="no" className="font-display text-sm text-fg-muted">
                SceneHawk
              </span>{" "}
              · Film search research prototype, MATE-CS2148
            </p>
            <div className="flex gap-5">
              <Link href="/search" className="hover:text-fg-muted">
                Search
              </Link>
              <Link href="/catalog" className="hover:text-fg-muted">
                Analysis index
              </Link>
              <Link href="/#faq" className="hover:text-fg-muted">
                FAQ
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
