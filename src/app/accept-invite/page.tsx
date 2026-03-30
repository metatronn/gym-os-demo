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
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          The invite token is missing.
        </div>
      </AuthShell>
    );
  }

  return <AcceptInviteForm token={token} />;
}
