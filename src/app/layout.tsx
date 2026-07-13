import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/app/globals.css";
import { MuiThemeProvider } from "@/components/mui-theme-provider";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mcpeakfamily.org",
  ),
  title: "McPeak Family",
  description: "Family member directory rebuilt on Next.js and React.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  );
}
