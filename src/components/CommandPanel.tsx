"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Mic,
  SendHorizontal,
  CheckCircle2,
  Loader2,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  number: number;
  title: string;
  status: "pending" | "scheduled" | "decision" | "active";
  details?: string;
}

interface Message {
  type: "user" | "ai" | "typing";
  content: string;
  workflow?: {
    title: string;
    steps: WorkflowStep[];
    confirmed?: boolean;
  };
}

const quickActions = [
  "Cancel Jane Doe's membership starting March 1st",
  "Follow up with all new leads",
  "Check in on at-risk members",
  "Show today's billing issues",
  "Send class reminder to all enrolled",
  "Generate daily summary report",
];

// Smart response map keyed on lowercase keyword matches
const aiResponses: { keywords: string[]; response: () => Message }[] = [
  {
    keywords: ["cancel", "membership", "jane"],
    response: () => ({
      type: "ai",
      content:
        "Got it. I'll handle Jane Doe's cancellation with the retention workflow first. Here's the plan:",
      workflow: {
        title: "Membership Cancellation — Jane Doe",
        steps: [
          {
            number: 1,
            title: 'Send "Last Chance" email offer',
            status: "scheduled",
            details: "Personalized 20% discount offer sending now",
          },
          {
            number: 2,
            title: "Wait 3 days for response",
            status: "pending",
            details: "Monitoring for replies and engagement",
          },
          {
            number: 3,
            title: "Decision gate",
            status: "decision",
            details:
              "If accepted → keep active & apply discount | If no response → proceed to step 4",
          },
          {
            number: 4,
            title: "Cancel membership + send goodbye email & SMS",
            status: "pending",
            details: "Exit sequence with thank you message and feedback survey",
          },
        ],
      },
    }),
  },
  {
    keywords: ["follow up", "leads", "new lead"],
    response: () => ({
      type: "ai",
      content:
        "I found 5 new leads from the last 48 hours without follow-up. Here's my outreach plan:",
      workflow: {
        title: "Lead Follow-Up Sequence",
        steps: [
          {
            number: 1,
            title: "Send personalized intro SMS to 5 leads",
            status: "scheduled",
            details:
              "Custom message based on lead source (Instagram, Google, etc.)",
          },
          {
            number: 2,
            title: "Schedule follow-up email in 24hrs",
            status: "pending",
            details: "Class schedule + trial offer attached",
          },
          {
            number: 3,
            title: "Flag non-responders after 48hrs",
            status: "pending",
            details: "Escalate to phone call task for Marcus",
          },
          {
            number: 4,
            title: "Book trial classes for responders",
            status: "pending",
            details: "Auto-assign to next available Fundamentals class",
          },
        ],
      },
    }),
  },
  {
    keywords: ["at-risk", "risk", "churn", "retention"],
    response: () => ({
      type: "ai",
      content:
        "There are 3 members with risk scores above 65%. Running the retention playbook:",
      workflow: {
        title: "At-Risk Member Retention",
        steps: [
          {
            number: 1,
            title: 'Send "We miss you" message to 3 members',
            status: "scheduled",
            details: "Derek (78%), Rachel (72%), James (68%)",
          },
          {
            number: 2,
            title: "Offer complimentary PT session",
            status: "pending",
            details: "One free session with Marcus to re-engage",
          },
          {
            number: 3,
            title: "Schedule check-in call with Javier",
            status: "pending",
            details: "Personal outreach for highest-risk member (Derek)",
          },
          {
            number: 4,
            title: "Monitor engagement for 7 days",
            status: "pending",
            details: "Track check-ins, class bookings, app activity",
          },
        ],
      },
    }),
  },
  {
    keywords: ["billing", "payment", "failed", "issue"],
    response: () => ({
      type: "ai",
      content:
        "2 failed payments found this week totaling $448. Here's the recovery plan:",
      workflow: {
        title: "Payment Recovery Workflow",
        steps: [
          {
            number: 1,
            title: "Send payment failure notification",
            status: "scheduled",
            details: "SMS + email to Derek Cole ($249) and Lisa Park ($199)",
          },
          {
            number: 2,
            title: "Retry charges in 48 hours",
            status: "pending",
            details: "Auto-retry through Stripe with updated payment window",
          },
          {
            number: 3,
            title: "Escalate if still failing",
            status: "decision",
            details: "If retry fails → assign follow-up task to front desk",
          },
          {
            number: 4,
            title: "Apply late fee or pause membership",
            status: "pending",
            details: "Per gym policy after 7 days overdue",
          },
        ],
      },
    }),
  },
  {
    keywords: ["class", "reminder", "enrolled", "notify"],
    response: () => ({
      type: "ai",
      content:
        "Sending reminders for today's 4 classes. 47 members enrolled total.",
      workflow: {
        title: "Class Reminder Blast",
        steps: [
          {
            number: 1,
            title: "Send SMS reminders — Morning Boxing (12 members)",
            status: "active",
            details: "Sent ✓",
          },
          {
            number: 2,
            title: "Send SMS reminders — Fundamentals (8 members)",
            status: "active",
            details: "Sent ✓",
          },
          {
            number: 3,
            title: "Send SMS reminders — Evening Kickboxing (15 members)",
            status: "scheduled",
            details: "Scheduled for 3:00 PM (2hrs before class)",
          },
          {
            number: 4,
            title: "Send SMS reminders — Open Sparring (12 members)",
            status: "scheduled",
            details: "Scheduled for 5:00 PM (2hrs before class)",
          },
        ],
      },
    }),
  },
  {
    keywords: ["summary", "report", "daily", "briefing", "overview"],
    response: () => ({
      type: "ai",
      content:
        "Here's your daily briefing for March 13, 2026:\n\n📊 Revenue: $24,850 MTD (+12.4%)\n👥 Active members: 98 (+3 this week)\n🎯 New leads: 5 (2 from Instagram)\n⚠️ At-risk: 3 members flagged\n💳 Failed payments: 2 ($448)\n📅 Classes today: 4 (72% avg capacity)\n\nTop priority: Follow up with 5 uncontacted leads and recover 2 failed payments.",
    }),
  },
  {
    keywords: ["schedule", "book", "class", "session"],
    response: () => ({
      type: "ai",
      content:
        "Today's class schedule:\n\n🥊 7:00 AM — Morning Boxing (12/15 enrolled)\n🥋 10:00 AM — Fundamentals (8/12 enrolled)\n🦵 5:00 PM — Evening Kickboxing (15/15 — FULL, 2 waitlisted)\n🥊 7:00 PM — Open Sparring (12/12 — FULL)\n\nWant me to add a member to a waitlist or open an extra session?",
    }),
  },
  {
    keywords: ["send", "email", "sms", "message", "text"],
    response: () => ({
      type: "ai",
      content:
        "Sure — who should I message and what should I say? I can send via SMS, email, or both. Just tell me the member name and the message, and I'll draft it for your approval before sending.",
    }),
  },
];

function getAIResponse(input: string): Message {
  const lower = input.toLowerCase();
  for (const entry of aiResponses) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response();
    }
  }
  return {
    type: "ai",
    content: `Understood. I'll analyze your gym data and execute that. In the full version, I'd:\n\n1. Parse your intent using natural language\n2. Query relevant data (members, billing, schedule)\n3. Build an action plan with confirmation steps\n4. Execute on your approval\n\nTry commands like "cancel a membership", "follow up with leads", or "show billing issues" to see workflows in action.`,
  };
}

export default function CommandPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      content:
        "Good morning, Javier. I'm your GYM OS command center. Tell me what you need — or tap a quick action below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const value = text || input;
    if (!value.trim()) return;

    const userMessage: Message = { type: "user", content: value };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "typing", content: "" }]);
    }, 200);

    setTimeout(
      () => {
        setMessages((prev) => {
          const withoutTyping = prev.filter((m) => m.type !== "typing");
          return [...withoutTyping, getAIResponse(value)];
        });
      },
      1200 + Math.random() * 800,
    );
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  const handleConfirmWorkflow = (msgIdx: number) => {
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i === msgIdx && m.workflow) {
          return {
            ...m,
            workflow: { ...m.workflow, confirmed: true },
          };
        }
        return m;
      }),
    );
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "Workflow confirmed and executing. I'll notify you when each step completes. You can check progress in the Tasks page.",
        },
      ]);
    }, 600);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInput("Check in on at-risk members");
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg shadow-primary/25 z-30",
          !isOpen && "animate-pulse",
        )}
        aria-label="Open Command Panel"
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </Button>

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[420px] bg-sidebar border-l border-border shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Command Center
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">
                    GYM OS AI — Online
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === "typing" ? (
                  <div className="flex justify-start">
                    <div className="bg-card rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex",
                      msg.type === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] px-4 py-3 text-sm leading-relaxed",
                        msg.type === "user"
                          ? "bg-primary text-primary-foreground rounded-xl rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-xl rounded-bl-sm",
                      )}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {msg.content}

                      {/* Workflow Card */}
                      {msg.workflow && (
                        <Card className="mt-3 bg-sidebar">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wide">
                                {msg.workflow.title}
                              </h3>
                              {msg.workflow.confirmed && (
                                <Badge
                                  variant="success"
                                  className="text-[10px]"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />{" "}
                                  Running
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2.5">
                              {msg.workflow.steps.map((step) => (
                                <div key={step.number} className="text-xs">
                                  <div className="flex items-start gap-2.5">
                                    <div
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                                        step.status === "active"
                                          ? "bg-success text-success-foreground"
                                          : step.status === "scheduled"
                                            ? "bg-warning text-warning-foreground"
                                            : step.status === "decision"
                                              ? "bg-accent text-accent-foreground"
                                              : "bg-border text-muted-foreground",
                                      )}
                                    >
                                      {step.status === "active" &&
                                      msg.workflow!.confirmed
                                        ? "✓"
                                        : step.number}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-foreground">
                                        {step.title}
                                      </p>
                                      {step.details && (
                                        <p className="text-muted-foreground mt-0.5">
                                          {step.details}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {!msg.workflow.confirmed && (
                              <>
                                <Separator />
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => handleConfirmWorkflow(idx)}
                                  >
                                    ✓ Confirm & Execute
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                  >
                                    Modify
                                  </Button>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-5 pb-3">
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="text-left px-3 py-2 bg-card hover:bg-secondary border border-border rounded-lg text-[11px] text-muted-foreground hover:text-foreground transition-colors leading-tight"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isListening
                  ? "Listening..."
                  : "Type a command or ask anything..."
              }
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={cn(
                "h-8 w-8",
                isListening && "bg-destructive/20 text-destructive",
              )}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="h-8 w-8"
            >
              <SendHorizontal size={16} />
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground text-center mt-2">
            Try: &quot;Cancel Jane Doe&apos;s membership&quot; &middot;
            &quot;Follow up with leads&quot; &middot; &quot;Daily summary&quot;
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
