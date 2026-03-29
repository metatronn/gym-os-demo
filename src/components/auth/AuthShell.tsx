import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gym-bg px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gym-border bg-gym-card/90 p-8 shadow-2xl">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-gym-accent">
          {eyebrow}
        </p>
        <h1 className="mb-3 text-3xl font-bold text-gym-text">{title}</h1>
        <p className="mb-8 text-sm leading-6 text-gym-text-secondary">
          {description}
        </p>

        {children}

        {footer ? (
          <div className="mt-6 text-sm text-gym-text-secondary">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
