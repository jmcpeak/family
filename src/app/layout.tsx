import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/app/globals.css";
import { MuiThemeProvider } from "@/components/mui-theme-provider";
import { QueryProvider } from "@/components/query-provider";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mcpeakfamily.org";
const siteTitle = "McPeak Family";
const siteDescription =
  "McPeak family directory — roots, stories, and family connections.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <MuiThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
