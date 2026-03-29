import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/SignInForm";
import { getAuthContext } from "@/lib/auth";

export default async function SignInPage() {
  const auth = await getAuthContext();

  if (auth.userId) {
    redirect(auth.orgId ? "/dashboard" : "/onboarding");
  }

  return <SignInForm />;
}
