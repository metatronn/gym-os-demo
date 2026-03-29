import { redirect } from "next/navigation";
import OnboardingForm from "@/components/auth/OnboardingForm";
import { requireAuth } from "@/lib/auth";

export default async function OnboardingPage() {
  const auth = await requireAuth({ requireOrg: false });

  if (auth.orgId) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
