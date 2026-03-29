import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { getAuthContext } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const auth = await getAuthContext();

  if (auth.userId) {
    redirect(auth.orgId ? "/dashboard" : "/onboarding");
  }

  return <ForgotPasswordForm />;
}
