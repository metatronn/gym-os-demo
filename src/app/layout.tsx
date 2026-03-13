import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CommandPanel from "@/components/CommandPanel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GYM OS | AI Operating System for Gyms",
  description: "The AI-native operating system for gyms and wellness businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gym-bg text-gym-text antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <CommandPanel />
        </div>
      </body>
    </html>
  );
}
