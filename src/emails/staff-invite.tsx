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

type StaffInviteEmailProps = {
  invitedByName: string;
  inviteUrl: string;
  role: string;
};

const bg = "#0A0F1C";
const text = "#F1F5F9";
const muted = "#94A3B8";
const accent = "#0350FF";

export default function StaffInviteEmail({
  invitedByName = "GYM OS",
  inviteUrl = "https://app.gymos.ai/accept-invite",
  role = "org:staff",
}: StaffInviteEmailProps) {
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
            You&apos;re invited to join GYM OS
          </Heading>
          <Text style={{ color: muted, fontSize: 16, lineHeight: "26px" }}>
            {invitedByName} invited you to join their workspace as{" "}
            <strong style={{ color: text }}>{role}</strong>.
          </Text>
          <Button
            href={inviteUrl}
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
            Accept invite
          </Button>
          <Text style={{ color: muted, fontSize: 13, marginTop: 24 }}>
            This invite expires in 7 days.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
