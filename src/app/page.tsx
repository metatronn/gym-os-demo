import { getAuthContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "./landing-page";

export const metadata = {
  title: "GYM OS | AI Operating System for Gyms",
  description:
    "The AI-native operating system for gyms and wellness businesses. Manage members, leads, billing, schedule, and communication — powered by AI.",
  openGraph: {
    title: "GYM OS | AI Operating System for Gyms",
    description:
      "The AI-native operating system for gyms and wellness businesses.",
    type: "website",
  },
};

export default async function Home() {
  const { userId } = await getAuthContext();
  if (userId) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
