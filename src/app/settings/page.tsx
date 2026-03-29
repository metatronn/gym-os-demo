import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { getSettingsData } from "./actions";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { orgRole } = await getAuthContext();

  if (orgRole !== "org:admin") {
    redirect("/dashboard");
  }

  const data = await getSettingsData();

  return <SettingsClient data={data} />;
}
