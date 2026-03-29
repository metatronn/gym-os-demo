import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { IS_CLERK_ENABLED } from "@/lib/env";

export default function SignUpPage() {
  if (!IS_CLERK_ENABLED) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gym-bg px-4">
      <SignUp />
    </div>
  );
}
