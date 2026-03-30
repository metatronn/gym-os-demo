import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppFrame from "@/components/AppFrame";
import { PostHogProvider } from "@/components/PostHogProvider";
import SentryScopeLoader from "@/components/SentryScopeLoader";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <PostHogProvider>
          <SentryScopeLoader />
          <AppFrame>{children}</AppFrame>
        </PostHogProvider>
      </body>
    </html>
  );
}
