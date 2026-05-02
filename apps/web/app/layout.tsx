import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VA Drift Insight",
  description: "Et praktisk beslutningsstøtteverktøy for lekkasjekontroll, fremmedvann og driftsdata"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
