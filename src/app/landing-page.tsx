"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Sparkles,
  Check,
  Star,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard & KPIs",
    description: "Real-time metrics, risk detection, activity feed",
  },
  {
    icon: Users,
    title: "Members & Leads",
    description: "Full CRM with pipeline, conversion tracking, at-risk alerts",
  },
  {
    icon: CalendarDays,
    title: "Schedule & Floor Plan",
    description: "Class management, visual booking, capacity planning",
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Stripe-powered subscriptions, dunning, payment tracking",
  },
  {
    icon: MessageSquare,
    title: "Messages & Tasks",
    description: "Unified inbox, task management, team coordination",
  },
  {
    icon: Sparkles,
    title: "AI Command Center",
    description:
      "Talk to your gym. Natural language actions, intelligent routing.",
  },
];

const PRO_FEATURES = [
  "Unlimited members & leads",
  "AI Command Center",
  "Schedule & floor plan management",
  "Stripe billing & dunning",
  "Unified inbox & task management",
  "Real-time dashboard & KPIs",
  "Team roles & permissions",
  "Email notifications & digests",
  "Slack integration",
  "Priority support",
];

const TESTIMONIALS = [
  {
    quote:
      "GYM OS replaced three different tools we were paying for. Everything is in one place now and the AI actually helps us make decisions.",
    name: "Sarah Chen",
    role: "Owner, Ironworks Fitness",
  },
  {
    quote:
      "The floor plan view alone saved us hours every week. We can see capacity, bookings, and coach assignments at a glance.",
    name: "Marcus Thompson",
    role: "Manager, Peak Performance Gym",
  },
  {
    quote:
      "We went from losing 15% of members monthly to under 5% after implementing the at-risk detection and automated follow-ups.",
    name: "Jessica Rivera",
    role: "Owner, FitLife Studios",
  },
];

function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-200",
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-foreground">
          GYM <span className="text-primary">OS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <Button asChild>
            <Link href="/sign-up">Start Free Trial</Link>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-muted-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted-foreground"
            >
              Pricing
            </a>
            <Link href="/sign-in" className="text-sm text-muted-foreground">
              Sign In
            </Link>
            <Button asChild className="w-full">
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/90 to-background px-4 pt-20">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          The AI Operating System
          <br />
          <span className="text-primary">for Your Gym</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Stop duct-taping spreadsheets, WhatsApp, and Mindbody together. One
          platform to manage members, leads, billing, schedule, and
          communication — powered by AI.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full text-base font-semibold sm:w-auto"
          >
            <Link href="/sign-up">Start Free Trial</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full text-base font-semibold sm:w-auto"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to run your gym
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Replace your patchwork of tools with one intelligent platform that
            understands your business.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="transition-colors hover:border-muted-foreground"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon size={20} className="text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            One plan. Everything included. No hidden fees.
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <Card className="border-primary/50 p-8">
            <div className="mb-6 text-center">
              <Badge className="mb-2">MOST POPULAR</Badge>
              <h3 className="mb-1 text-2xl font-bold text-foreground">Pro</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-foreground">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                14-day free trial. No credit card required.
              </p>
            </div>

            <Separator className="mb-6" />

            <ul className="mb-8 space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button asChild className="w-full">
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
            Trusted by 50+ gyms
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Loved by gym owners
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardHeader>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-warning text-warning"
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-lg font-bold text-foreground">
            GYM <span className="text-primary">OS</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign Up
            </Link>
          </nav>
        </div>

        <Separator className="mt-8 mb-6" />

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} GYM OS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <SocialProofSection />
      <Footer />
    </div>
  );
}
