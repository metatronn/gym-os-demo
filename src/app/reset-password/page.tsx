import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthShell from "@/components/auth/AuthShell";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim() ?? "";

  if (!token) {
    return (
      <AuthShell
        eyebrow="Password Reset"
        title="Reset link missing"
        description="Open the full reset link from your email, or request a new one."
        footer={
          <p>
            Need a fresh link?{" "}
            <Link
              href="/forgot-password"
              className="text-gym-accent hover:underline"
            >
              Request another reset email
            </Link>
          </p>
        }
      >
        <div className="rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
          The password reset token is missing.
        </div>
      </AuthShell>
    );
  }

  return <ResetPasswordForm token={token} />;
}
