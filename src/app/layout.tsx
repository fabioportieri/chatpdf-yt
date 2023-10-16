import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatPDF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ClerkProvider>
    <Providers>
      <html lang="en">
        {/* <head>
            <meta
              http-equiv="Content-Security-Policy"
              content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://docs.google.com"
            />
          </head> */}
        <body className={inter.className}>
          {children}
          {/* <Toaster /> */}
        </body>
      </html>
    </Providers>
    // </ClerkProvider>
  );
}
