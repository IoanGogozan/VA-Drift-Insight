import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "VA Drift Insight",
  description: "Demo for datadrevet lekkasjekontroll, vanntap og feltoppfølging"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
