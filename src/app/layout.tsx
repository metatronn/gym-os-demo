import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppFrame from "@/components/AppFrame";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "GYM OS | AI Operating System for Gyms",
  description:
    "The AI-native operating system for gyms and wellness businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} bg-gym-bg text-gym-text antialiased`}
      >
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
