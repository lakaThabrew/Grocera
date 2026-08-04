import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/components/Providers";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Grocera - Retail Intelligence",
  description: "Retail Intelligence Platform for Sri Lanka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased flex flex-col min-h-screen"
      >
        <Providers>
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
