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

interface WelcomeEmailProps {
  gymName: string;
  ownerName: string;
  dashboardUrl: string;
}

const bg = "#0A0F1C";
const text = "#F1F5F9";
const muted = "#94A3B8";
const accent = "#0350FF";

export default function WelcomeEmail({
  gymName = "My Gym",
  ownerName = "Owner",
  dashboardUrl = "https://app.gymos.ai/dashboard",
}: WelcomeEmailProps) {
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
            Welcome to GYM OS
          </Heading>
          <Text style={{ color: muted, fontSize: 16, marginBottom: 24 }}>
            {ownerName}, your workspace for{" "}
            <strong style={{ color: text }}>{gymName}</strong> is ready.
          </Text>

          <Hr style={{ borderColor: "#1E293B", margin: "24px 0" }} />

          <Section>
            <Heading
              as="h3"
              style={{
                color: text,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Here is what you can do next:
            </Heading>
            <Text
              style={{
                color: muted,
                fontSize: 14,
                lineHeight: "24px",
                margin: 0,
              }}
            >
              1. Add your members and import existing data{"\n"}
              2. Set up your class schedule{"\n"}
              3. Configure your floor plan layout{"\n"}
              4. Invite coaches and staff
            </Text>
          </Section>

          <Section style={{ marginTop: 32, textAlign: "center" as const }}>
            <Button
              href={dashboardUrl}
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
              Go to Dashboard
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
