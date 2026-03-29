import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Text,
} from "@react-email/components";
import * as React from "react";

type PasswordResetEmailProps = {
  name: string;
  resetUrl: string;
};

const bg = "#0A0F1C";
const text = "#F1F5F9";
const muted = "#94A3B8";
const accent = "#0350FF";

export default function PasswordResetEmail({
  name = "there",
  resetUrl = "https://app.gymos.ai/reset-password",
}: PasswordResetEmailProps) {
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
              marginBottom: 12,
            }}
          >
            Reset your password
          </Heading>
          <Text style={{ color: muted, fontSize: 16, lineHeight: "26px" }}>
            {name}, use the button below to choose a new password for your GYM
            OS account.
          </Text>
          <Button
            href={resetUrl}
            style={{
              backgroundColor: accent,
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 6,
              textDecoration: "none",
              marginTop: 20,
              display: "inline-block",
            }}
          >
            Reset password
          </Button>
          <Text style={{ color: muted, fontSize: 13, marginTop: 24 }}>
            This link expires in 1 hour. If you didn&apos;t request it, you can
            ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
