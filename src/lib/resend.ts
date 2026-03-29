import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from "@/lib/env";

// Follow the same pattern as src/lib/stripe.ts — graceful when not configured
export const isResendEnabled = Boolean(RESEND_API_KEY);
export const resend = isResendEnabled ? new Resend(RESEND_API_KEY) : null;
export const FROM_EMAIL = RESEND_FROM_EMAIL;
