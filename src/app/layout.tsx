import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import AppFrame from "@/components/AppFrame";
import { IS_CLERK_ENABLED } from "@/lib/env";

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
  const app = <AppFrame>{children}</AppFrame>;

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gym-bg text-gym-text antialiased`}
      >
        {IS_CLERK_ENABLED ? (
          <ClerkProvider appearance={{ baseTheme: dark }}>{app}</ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
