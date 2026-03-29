import Link from "next/link";
import AcceptInviteForm from "@/components/auth/AcceptInviteForm";
import AuthShell from "@/components/auth/AuthShell";

export default function AcceptInvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim() ?? "";

  if (!token) {
    return (
      <AuthShell
        eyebrow="Invite Required"
        title="Invite link missing"
        description="Use the full invite link from your email to join the workspace."
        footer={
          <p>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-gym-accent hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
          The invite token is missing.
        </div>
      </AuthShell>
    );
  }

  return <AcceptInviteForm token={token} />;
}
