import Stripe from "stripe";
import { IS_STRIPE_ENABLED, STRIPE_SECRET_KEY } from "@/lib/env";

export const isStripeEnabled = IS_STRIPE_ENABLED;

export const stripe = isStripeEnabled
  ? new Stripe(STRIPE_SECRET_KEY, {
      typescript: true,
    })
  : (null as unknown as Stripe);
