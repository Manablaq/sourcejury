import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "SourceJury — Evidence Court on GenLayer",
    template: "%s · SourceJury"
  },
  description:
    "SourceJury turns web evidence into explainable, challengeable GenLayer verdicts.",
  applicationName: "SourceJury",
  openGraph: {
    title: "SourceJury — Evidence Court on GenLayer",
    description:
      "Submit claims, inspect evidence, follow consensus, and challenge verdicts.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#0b0d0f",
  colorScheme: "dark"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
