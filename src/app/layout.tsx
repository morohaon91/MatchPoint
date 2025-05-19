import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/lib/context/ClientProviders";
import Navbar from "@/components/nav/Navbar";
import Footer from "@/components/nav/Footer";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "MatchPoint - Sports Team Organizer",
  description:
    "MatchPoint helps you organize recreational sports activities, manage teams, and coordinate pickup games with ease.",
  // Assuming a placeholder URL for now, this should be updated when deployed
  metadataBase: new URL("https://matchpoint.app"),
  openGraph: {
    title: "MatchPoint - Sports Team Organizer",
    description:
      "MatchPoint helps you organize recreational sports activities, manage teams, and coordinate pickup games with ease.",
    url: "https://matchpoint.app", // Placeholder
    siteName: "MatchPoint",
  },
  twitter: {
    card: "summary_large_image",
    title: "MatchPoint - Sports Team Organizer",
    description:
      "MatchPoint helps you organize recreational sports activities, manage teams, and coordinate pickup games with ease.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fonts/inter.css" />
      </head>
      {/* Theme is now managed by custom Tailwind config */}
      <body className="font-inter">
        <ClientProviders>
          <Navbar />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
