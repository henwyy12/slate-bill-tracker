import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/use-auth";
import { ProfileProvider } from "@/lib/use-profile";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slate — Bill & Card Tracker",
  description: "Track credit card bills, expenses, and installment payments",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <AuthProvider>
          <ProfileProvider>
            {children}
            <Toaster />
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
