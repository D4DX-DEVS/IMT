import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { ScrollProgress } from "@/components/scroll-progress";
import { site } from "@/data/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} (${site.shortName})`,
    template: `%s – ${site.shortName}`,
  },
  description:
    "Islamic Mission Trust (IMT) — Excellence in Education with Societal Commitment. 13 institutions, 400+ faculty and 7000 students across Kerala, including Al Jamia Al Islamia, Santapuram.",
  openGraph: {
    type: "website",
    siteName: site.name,
    images: ["/images/hero-campus.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a4c68",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <a
          href="#main"
          className="sr-only z-[100] rounded-md bg-gold-400 px-4 py-2 font-medium text-brand-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Providers>
          <ScrollProgress />
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
