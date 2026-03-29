import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface PaymentFailedEmailProps {
  gymName: string;
  amount: number;
  updatePaymentUrl: string;
}

const bg = "#0A0F1C";
const text = "#F1F5F9";
const muted = "#94A3B8";
const accent = "#0350FF";
const warning = "#F59E0B";

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PaymentFailedEmail({
  gymName = "My Gym",
  amount = 4900,
  updatePaymentUrl = "https://app.gymos.ai/billing",
}: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: bg,
          fontFamily: "sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}
        >
          <Heading
            style={{
              color: warning,
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Payment failed
          </Heading>
          <Text style={{ color: muted, fontSize: 16, marginBottom: 24 }}>
            We could not process the payment of{" "}
            <strong style={{ color: text }}>{formatDollars(amount)}</strong> for{" "}
            <strong style={{ color: text }}>{gymName}</strong>. Please update
            your payment method to keep your account active.
          </Text>

          <Hr style={{ borderColor: "#1E293B", margin: "24px 0" }} />

          <Section>
            <Text style={{ color: muted, fontSize: 14, lineHeight: "24px" }}>
              We will retry the charge automatically, but updating your card now
              ensures there is no interruption to your service.
            </Text>
          </Section>

          <Section style={{ marginTop: 32, textAlign: "center" as const }}>
            <Button
              href={updatePaymentUrl}
              style={{
                backgroundColor: accent,
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 600,
                padding: "12px 32px",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Update Payment Method
            </Button>
          </Section>

          <Text
            style={{
              color: muted,
              fontSize: 12,
              marginTop: 40,
              textAlign: "center" as const,
            }}
          >
            GYM OS - The AI-native operating system for gyms
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
