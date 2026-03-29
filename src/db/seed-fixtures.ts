type TaskPriority = "high" | "medium" | "low";
type TaskStatus = "todo" | "in-progress" | "done";
type TaskCategory = "follow-up" | "billing" | "operations" | "coaching";
type MessageChannel = "sms" | "email";
type ContactType = "member" | "lead";
type ActivityEventType =
  | "lead-new"
  | "member-checkin"
  | "payment-failed"
  | "risk-flag"
  | "outreach-sent"
  | "lead-converted"
  | "task-completed";

interface SeedTask {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
}

interface SeedMessage {
  id: string;
  contactName: string;
  contactType: ContactType;
  channel: MessageChannel;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface SeedActivityEvent {
  id: string;
  type: ActivityEventType;
  description: string;
  timestamp: string;
  relatedId: string;
  relatedName: string;
}

export const tasks: SeedTask[] = [
  {
    id: "task-001",
    title: "Follow up with David Martinez - low attendance",
    assignedTo: "Sales Team",
    dueDate: "2026-03-14",
    priority: "high",
    status: "todo",
    category: "follow-up",
  },
  {
    id: "task-002",
    title: "Resolve payment issue for Robert Thompson",
    assignedTo: "Billing",
    dueDate: "2026-03-14",
    priority: "high",
    status: "in-progress",
    category: "billing",
  },
  {
    id: "task-003",
    title: "Onboard new trial member Olivia Garcia",
    assignedTo: "Marcus Johnson",
    dueDate: "2026-03-15",
    priority: "medium",
    status: "todo",
    category: "operations",
  },
  {
    id: "task-004",
    title: "Schedule coaching session with Alex Williams",
    assignedTo: "Marcus Johnson",
    dueDate: "2026-03-20",
    priority: "medium",
    status: "todo",
    category: "coaching",
  },
  {
    id: "task-005",
    title: "Jennifer Lee check-in - injury recovery status",
    assignedTo: "Michael Anderson",
    dueDate: "2026-03-16",
    priority: "low",
    status: "todo",
    category: "follow-up",
  },
  {
    id: "task-006",
    title: "Process payment for James Wilson overdue amount",
    assignedTo: "Billing",
    dueDate: "2026-03-13",
    priority: "high",
    status: "todo",
    category: "billing",
  },
  {
    id: "task-007",
    title: "Book trial class for Lisa Park",
    assignedTo: "Sales Team",
    dueDate: "2026-03-14",
    priority: "medium",
    status: "done",
    category: "follow-up",
  },
  {
    id: "task-008",
    title: "Update class schedule for March",
    assignedTo: "Operations",
    dueDate: "2026-03-15",
    priority: "low",
    status: "done",
    category: "operations",
  },
];

export const messages: SeedMessage[] = [
  {
    id: "msg-001",
    contactName: "Sarah Chen",
    contactType: "member",
    channel: "sms",
    lastMessage: "Can I bring a friend to class this Thursday?",
    timestamp: "2026-03-13T14:32:00",
    unread: true,
  },
  {
    id: "msg-002",
    contactName: "David Martinez",
    contactType: "member",
    channel: "email",
    lastMessage: "Why isn't my card working?",
    timestamp: "2026-03-13T10:15:00",
    unread: true,
  },
  {
    id: "msg-003",
    contactName: "Lisa Park",
    contactType: "lead",
    channel: "sms",
    lastMessage: "I'd like to book that trial class for Saturday",
    timestamp: "2026-03-13T09:45:00",
    unread: true,
  },
  {
    id: "msg-004",
    contactName: "Marcus Johnson",
    contactType: "member",
    channel: "sms",
    lastMessage: "Great work in class last night! See you tomorrow.",
    timestamp: "2026-03-12T20:22:00",
    unread: false,
  },
  {
    id: "msg-005",
    contactName: "Tom Anderson",
    contactType: "lead",
    channel: "email",
    lastMessage: "What are the pricing options for serious boxers?",
    timestamp: "2026-03-12T16:50:00",
    unread: false,
  },
  {
    id: "msg-006",
    contactName: "Jennifer Lee",
    contactType: "member",
    channel: "email",
    lastMessage: "Excited to get back to training when my injury heals",
    timestamp: "2026-03-11T11:33:00",
    unread: false,
  },
  {
    id: "msg-007",
    contactName: "Brandon Lee",
    contactType: "lead",
    channel: "sms",
    lastMessage: "Marcus mentioned you guys, how do I start?",
    timestamp: "2026-03-10T15:20:00",
    unread: false,
  },
  {
    id: "msg-008",
    contactName: "Alex Williams",
    contactType: "member",
    channel: "email",
    lastMessage: "When can we schedule my coaching certification?",
    timestamp: "2026-03-08T09:10:00",
    unread: false,
  },
];

export const activityEvents: SeedActivityEvent[] = [
  {
    id: "event-001",
    type: "member-checkin",
    description: "Marcus Johnson checked in to Advanced Boxing class",
    timestamp: "2026-03-13T19:32:00",
    relatedId: "mem-001",
    relatedName: "Marcus Johnson",
  },
  {
    id: "event-002",
    type: "lead-new",
    description: "New lead Nicole Santos added from Instagram",
    timestamp: "2026-03-12T14:15:00",
    relatedId: "lead-001",
    relatedName: "Nicole Santos",
  },
  {
    id: "event-003",
    type: "payment-failed",
    description: "Payment failed for David Martinez",
    timestamp: "2026-03-11T08:45:00",
    relatedId: "mem-003",
    relatedName: "David Martinez",
  },
  {
    id: "event-004",
    type: "risk-flag",
    description: "James Wilson flagged as at-risk (overdue payment)",
    timestamp: "2026-03-10T10:22:00",
    relatedId: "mem-012",
    relatedName: "James Wilson",
  },
  {
    id: "event-005",
    type: "outreach-sent",
    description: "Retention email sent to David Martinez",
    timestamp: "2026-03-09T16:30:00",
    relatedId: "mem-003",
    relatedName: "David Martinez",
  },
  {
    id: "event-006",
    type: "lead-converted",
    description: "Rachel Green converted from lead to member",
    timestamp: "2026-03-08T12:00:00",
    relatedId: "mem-999",
    relatedName: "Rachel Green",
  },
  {
    id: "event-007",
    type: "member-checkin",
    description: "Sarah Chen checked in to Kickboxing Flow class",
    timestamp: "2026-03-12T17:45:00",
    relatedId: "mem-002",
    relatedName: "Sarah Chen",
  },
  {
    id: "event-008",
    type: "task-completed",
    description: "Task completed: Book trial class for Lisa Park",
    timestamp: "2026-03-12T11:20:00",
    relatedId: "task-007",
    relatedName: "Lisa Park Trial",
  },
  {
    id: "event-009",
    type: "member-checkin",
    description: "Alex Williams checked in to Saturday Sparring",
    timestamp: "2026-03-11T10:15:00",
    relatedId: "mem-004",
    relatedName: "Alex Williams",
  },
  {
    id: "event-010",
    type: "payment-failed",
    description: "Payment failed for Robert Thompson",
    timestamp: "2026-03-10T09:00:00",
    relatedId: "mem-006",
    relatedName: "Robert Thompson",
  },
  {
    id: "event-011",
    type: "lead-new",
    description: "New lead Brandon Lee added via referral (Marcus Johnson)",
    timestamp: "2026-03-11T13:30:00",
    relatedId: "lead-008",
    relatedName: "Brandon Lee",
  },
  {
    id: "event-012",
    type: "member-checkin",
    description: "Michael Anderson checked in to Conditioning & Cardio",
    timestamp: "2026-03-13T18:05:00",
    relatedId: "mem-008",
    relatedName: "Michael Anderson",
  },
  {
    id: "event-013",
    type: "outreach-sent",
    description: "Follow-up call scheduled with Tom Anderson (lead)",
    timestamp: "2026-03-11T14:45:00",
    relatedId: "lead-002",
    relatedName: "Tom Anderson",
  },
  {
    id: "event-014",
    type: "risk-flag",
    description: "David Martinez flagged as at-risk (low attendance)",
    timestamp: "2026-03-09T11:00:00",
    relatedId: "mem-003",
    relatedName: "David Martinez",
  },
  {
    id: "event-015",
    type: "member-checkin",
    description: "Priya Patel checked in to Kickboxing Flow class",
    timestamp: "2026-03-13T17:30:00",
    relatedId: "mem-011",
    relatedName: "Priya Patel",
  },
];
