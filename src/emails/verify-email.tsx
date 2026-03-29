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

type VerifyEmailProps = {
  name: string;
  verifyUrl: string;
};

const bg = "#0A0F1C";
const text = "#F1F5F9";
const muted = "#94A3B8";
const accent = "#0350FF";

export default function VerifyEmail({
  name = "there",
  verifyUrl = "https://app.gymos.ai/sign-in",
}: VerifyEmailProps) {
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
            Verify your email
          </Heading>
          <Text style={{ color: muted, fontSize: 16, lineHeight: "26px" }}>
            {name}, confirm your email address so your GYM OS account is fully
            activated.
          </Text>
          <Button
            href={verifyUrl}
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
            Verify email
          </Button>
          <Text style={{ color: muted, fontSize: 13, marginTop: 24 }}>
            If you didn&apos;t create this account, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
