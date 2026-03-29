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

interface TrialExpiringEmailProps {
  gymName: string;
  daysLeft: number;
  upgradeUrl: string;
}

const bg = "#0A0F1C";
const text = "#F1F5F9";
const muted = "#94A3B8";
const accent = "#0350FF";

export default function TrialExpiringEmail({
  gymName = "My Gym",
  daysLeft = 3,
  upgradeUrl = "https://app.gymos.ai/billing",
}: TrialExpiringEmailProps) {
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
              color: text,
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Your trial expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}
          </Heading>
          <Text style={{ color: muted, fontSize: 16, marginBottom: 24 }}>
            The free trial for{" "}
            <strong style={{ color: text }}>{gymName}</strong> is ending soon.
            Upgrade now to keep full access to your dashboard, members, and
            schedule.
          </Text>

          <Hr style={{ borderColor: "#1E293B", margin: "24px 0" }} />

          <Section>
            <Text style={{ color: muted, fontSize: 14, lineHeight: "24px" }}>
              When your trial ends, your data stays safe — but you will lose
              access to the platform until you upgrade. No pressure, just a
              heads-up.
            </Text>
          </Section>

          <Section style={{ marginTop: 32, textAlign: "center" as const }}>
            <Button
              href={upgradeUrl}
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
              Upgrade Now
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
