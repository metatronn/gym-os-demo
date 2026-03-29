import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";
import { getAuthContext } from "@/lib/auth";

export default async function SignUpPage() {
  const auth = await getAuthContext();

  if (auth.userId) {
    redirect(auth.orgId ? "/dashboard" : "/onboarding");
  }

  return <SignUpForm />;
}
