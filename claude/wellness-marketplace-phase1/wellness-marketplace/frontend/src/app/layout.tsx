import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sohum Wellness | Verified Wellness Professionals in Delhi NCR",
  description:
    "Find and book verified wellness professionals near you across Delhi, Noida, Gurugram, Faridabad and Ghaziabad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-sage-900 antialiased">{children}</body>
    </html>
  );
}
