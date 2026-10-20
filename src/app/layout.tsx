import type { Metadata, Viewport } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getContent } from "@/content";
import { seedContent } from "@/content/seed";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  // If storage can't be reached, still render the page (the admin must stay usable to show what's wrong).
  // Failures aren't cached, so the real content comes back as soon as storage does.
  const { site, home, institutions } = await getContent().catch((error) => {
    console.error("[metadata] could not load content; using the built-in defaults", error);
    return seedContent;
  });
  const first = institutions[0];
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} (${site.shortName})`,
      template: `%s – ${site.shortName}`,
    },
    description: `${site.name} (${site.shortName}) — ${site.motto}. ${institutions.length} institutions across Kerala${
      first ? `, including ${first.name}${first.location ? `, ${first.location}` : ""}` : ""
    }.`,
    openGraph: {
      type: "website",
      siteName: site.name,
      images: [home.hero.image],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a2147",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${jakarta.variable} ${lora.variable}`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
