import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md rounded-3xl border-border bg-card/90 shadow-2xl">
        <CardHeader className="p-8 pb-0">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
          <CardTitle className="mb-3 text-3xl font-bold text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-8">{children}</CardContent>

        {footer ? (
          <CardFooter className="px-8 pb-8 pt-0 text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
