// Reports fallback types and data
export type MemberStatus = "active" | "frozen" | "cancelled" | "trial";
export type RiskLevel = "critical" | "high" | "medium" | "low";
export type PlanType = "Premium" | "Unlimited" | "Basic" | "Trial";
export type BillingStatus = "current" | "failed" | "past-due" | "pending";
export type LeadSource =
  | "Instagram"
  | "Website"
  | "Facebook"
  | "Walk-in"
  | "Referral"
  | "Google";
export type LeadStatus = "new" | "contacted" | "booked" | "converted" | "lost";
export type ClassType =
  | "boxing"
  | "kickboxing"
  | "conditioning"
  | "fundamentals";
export type PaymentStatus = "succeeded" | "failed" | "refunded" | "pending";
export type PaymentType = "subscription" | "one-time";
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  plan: PlanType;
  status: MemberStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  lastCheckIn: string;
  monthlyVisits: number;
  billingStatus: BillingStatus;
  joinDate: string;
  tags: string[];
  notes: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  interest: string;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  capacity: number;
  enrolled: number;
  waitlist: number;
  type: ClassType;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  type: PaymentType;
  method: string;
}

// Member Data
export const members: Member[] = [
  {
    id: "mem-001",
    name: "Marcus Johnson",
    email: "marcus@email.com",
    phone: "+1 (555) 123-4501",
    avatar: "MJ",
    plan: "Premium",
    status: "active",
    riskScore: 15,
    riskLevel: "low",
    lastCheckIn: "2026-03-13",
    monthlyVisits: 18,
    billingStatus: "current",
    joinDate: "2025-01-15",
    tags: ["boxer", "competitive", "high-engagement"],
    notes: "Training for amateur bout. Very dedicated.",
  },
  {
    id: "mem-002",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 234-5602",
    avatar: "SC",
    plan: "Unlimited",
    status: "active",
    riskScore: 22,
    riskLevel: "low",
    lastCheckIn: "2026-03-12",
    monthlyVisits: 16,
    billingStatus: "current",
    joinDate: "2024-11-20",
    tags: ["kickboxing", "fitness-focused", "social"],
    notes: "Brings friends to classes. Great for referrals.",
  },
  {
    id: "mem-003",
    name: "David Martinez",
    email: "dmartinez@email.com",
    phone: "+1 (555) 345-6703",
    avatar: "DM",
    plan: "Basic",
    status: "active",
    riskScore: 58,
    riskLevel: "high",
    lastCheckIn: "2026-02-28",
    monthlyVisits: 4,
    billingStatus: "current",
    joinDate: "2024-08-10",
    tags: ["casual", "beginner", "declining-attendance"],
    notes: "Attendance dropping. Not responding to outreach.",
  },
  {
    id: "mem-004",
    name: "Alex Williams",
    email: "alex.w@email.com",
    phone: "+1 (555) 456-7804",
    avatar: "AW",
    plan: "Premium",
    status: "active",
    riskScore: 8,
    riskLevel: "low",
    lastCheckIn: "2026-03-13",
    monthlyVisits: 22,
    billingStatus: "current",
    joinDate: "2025-02-01",
    tags: ["boxing", "elite", "consistent"],
    notes: "One of our top members. Considering coaching cert.",
  },
  {
    id: "mem-005",
    name: "Jennifer Lee",
    email: "jen.lee@email.com",
    phone: "+1 (555) 567-8905",
    avatar: "JL",
    plan: "Unlimited",
    status: "frozen",
    riskScore: 75,
    riskLevel: "critical",
    lastCheckIn: "2026-01-15",
    monthlyVisits: 0,
    billingStatus: "pending",
    joinDate: "2024-09-05",
    tags: ["frozen", "personal-issue", "future-return"],
    notes: "Frozen due to injury. Expected to return April.",
  },
  {
    id: "mem-006",
    name: "Robert Thompson",
    email: "rthompson@email.com",
    phone: "+1 (555) 678-9006",
    avatar: "RT",
    plan: "Basic",
    status: "active",
    riskScore: 45,
    riskLevel: "medium",
    lastCheckIn: "2026-03-05",
    monthlyVisits: 8,
    billingStatus: "failed",
    joinDate: "2024-12-12",
    tags: ["payment-issue", "beginner", "inconsistent"],
    notes: "Card declined last payment. Needs follow-up.",
  },
  {
    id: "mem-007",
    name: "Olivia Garcia",
    email: "olivia.g@email.com",
    phone: "+1 (555) 789-0107",
    avatar: "OG",
    plan: "Trial",
    status: "trial",
    riskScore: 35,
    riskLevel: "medium",
    lastCheckIn: "2026-03-10",
    monthlyVisits: 5,
    billingStatus: "pending",
    joinDate: "2026-02-28",
    tags: ["trial", "new-member", "prospects"],
    notes: "Trial ends March 28. Should convert or follow up soon.",
  },
  {
    id: "mem-008",
    name: "Michael Anderson",
    email: "manderson@email.com",
    phone: "+1 (555) 890-1208",
    avatar: "MA",
    plan: "Premium",
    status: "active",
    riskScore: 12,
    riskLevel: "low",
    lastCheckIn: "2026-03-13",
    monthlyVisits: 20,
    billingStatus: "current",
    joinDate: "2025-03-01",
    tags: ["boxing", "regular", "community-builder"],
    notes: "Active in member community. Good retention signal.",
  },
  {
    id: "mem-009",
    name: "Emma Rodriguez",
    email: "emma.r@email.com",
    phone: "+1 (555) 901-3309",
    avatar: "ER",
    plan: "Unlimited",
    status: "cancelled",
    riskScore: 100,
    riskLevel: "critical",
    lastCheckIn: "2025-12-20",
    monthlyVisits: 0,
    billingStatus: "current",
    joinDate: "2024-06-15",
    tags: ["cancelled", "churn", "lost-member"],
    notes: "Cancelled due to relocation. Keep in loop for future.",
  },
  {
    id: "mem-010",
    name: "Chris Brown",
    email: "cbrown@email.com",
    phone: "+1 (555) 012-4410",
    avatar: "CB",
    plan: "Unlimited",
    status: "active",
    riskScore: 28,
    riskLevel: "low",
    lastCheckIn: "2026-03-11",
    monthlyVisits: 14,
    billingStatus: "current",
    joinDate: "2024-10-22",
    tags: ["conditioning", "fitness", "stable"],
    notes: "Steady member. Interested in nutrition coaching.",
  },
  {
    id: "mem-011",
    name: "Priya Patel",
    email: "priya.p@email.com",
    phone: "+1 (555) 123-5511",
    avatar: "PP",
    plan: "Premium",
    status: "active",
    riskScore: 18,
    riskLevel: "low",
    lastCheckIn: "2026-03-12",
    monthlyVisits: 17,
    billingStatus: "current",
    joinDate: "2025-01-08",
    tags: ["kickboxing", "class-oriented", "engaged"],
    notes: "Perfect attendance for kickboxing classes.",
  },
  {
    id: "mem-012",
    name: "James Wilson",
    email: "james.w@email.com",
    phone: "+1 (555) 234-6612",
    avatar: "JW",
    plan: "Basic",
    status: "active",
    riskScore: 62,
    riskLevel: "high",
    lastCheckIn: "2026-02-22",
    monthlyVisits: 2,
    billingStatus: "past-due",
    joinDate: "2024-07-30",
    tags: ["payment-overdue", "low-usage", "at-risk"],
    notes: "Payment 15 days overdue. Not attending classes.",
  },
];

// Lead Data
export const leads: Lead[] = [
  {
    id: "lead-001",
    name: "Nicole Santos",
    email: "nicole.santos@email.com",
    phone: "+1 (555) 345-6601",
    source: "Instagram",
    status: "new",
    score: 85,
    interest: "Boxing fitness class, looking to get in shape",
    assignedTo: "Sales Team",
    createdAt: "2026-03-12",
    lastContact: "2026-03-12",
  },
  {
    id: "lead-002",
    name: "Tom Anderson",
    email: "toman@email.com",
    phone: "+1 (555) 456-7702",
    source: "Google",
    status: "contacted",
    score: 72,
    interest: "Membership inquiry, competitive boxing",
    assignedTo: "Marcus Johnson",
    createdAt: "2026-03-10",
    lastContact: "2026-03-11",
  },
  {
    id: "lead-003",
    name: "Lisa Park",
    email: "lpark@email.com",
    phone: "+1 (555) 567-8803",
    source: "Referral",
    status: "booked",
    score: 90,
    interest: "Referred by Sarah Chen, wants trial class",
    assignedTo: "Sales Team",
    createdAt: "2026-03-05",
    lastContact: "2026-03-13",
  },
  {
    id: "lead-004",
    name: "Kevin Jones",
    email: "kjones@email.com",
    phone: "+1 (555) 678-9904",
    source: "Facebook",
    status: "contacted",
    score: 58,
    interest: "General fitness, unsure about boxing",
    assignedTo: "Sales Team",
    createdAt: "2026-02-28",
    lastContact: "2026-03-08",
  },
  {
    id: "lead-005",
    name: "Rachel Green",
    email: "rgreen@email.com",
    phone: "+1 (555) 789-0105",
    source: "Walk-in",
    status: "converted",
    score: 95,
    interest: "Joined as Unlimited member after trial",
    assignedTo: "Alex Williams",
    createdAt: "2026-01-20",
    lastContact: "2026-03-13",
  },
  {
    id: "lead-006",
    name: "David Kim",
    email: "dkim@email.com",
    phone: "+1 (555) 890-1206",
    source: "Instagram",
    status: "lost",
    score: 42,
    interest: "Interested but chose competitor gym",
    assignedTo: "Sales Team",
    createdAt: "2026-02-15",
    lastContact: "2026-03-01",
  },
  {
    id: "lead-007",
    name: "Amy Zhang",
    email: "azhang@email.com",
    phone: "+1 (555) 901-3307",
    source: "Website",
    status: "booked",
    score: 78,
    interest: "Online lead, wants beginner fundamentals class",
    assignedTo: "Sales Team",
    createdAt: "2026-03-07",
    lastContact: "2026-03-11",
  },
  {
    id: "lead-008",
    name: "Brandon Lee",
    email: "blee@email.com",
    phone: "+1 (555) 012-4408",
    source: "Referral",
    status: "new",
    score: 88,
    interest: "Referred by Marcus, wants premium boxing training",
    assignedTo: "Alex Williams",
    createdAt: "2026-03-11",
    lastContact: "2026-03-13",
  },
  {
    id: "lead-009",
    name: "Jessica Davis",
    email: "jdavis@email.com",
    phone: "+1 (555) 123-5509",
    source: "Facebook",
    status: "contacted",
    score: 65,
    interest: "Corporate wellness program inquiry",
    assignedTo: "Sales Team",
    createdAt: "2026-02-25",
    lastContact: "2026-03-10",
  },
  {
    id: "lead-010",
    name: "Marco Rossi",
    email: "mrossi@email.com",
    phone: "+1 (555) 234-6610",
    source: "Google",
    status: "booked",
    score: 82,
    interest: "Intermediate boxer, looking for serious training",
    assignedTo: "Michael Anderson",
    createdAt: "2026-03-02",
    lastContact: "2026-03-12",
  },
  {
    id: "lead-011",
    name: "Sophia Turner",
    email: "sturner@email.com",
    phone: "+1 (555) 345-7711",
    source: "Instagram",
    status: "new",
    score: 79,
    interest: "Women-only kickboxing interest",
    assignedTo: "Sales Team",
    createdAt: "2026-03-13",
    lastContact: "2026-03-13",
  },
  {
    id: "lead-012",
    name: "Victor Newman",
    email: "vnewman@email.com",
    phone: "+1 (555) 456-8812",
    source: "Walk-in",
    status: "contacted",
    score: 71,
    interest: "Conditioning and fitness classes",
    assignedTo: "Sales Team",
    createdAt: "2026-03-06",
    lastContact: "2026-03-10",
  },
];

// Class Sessions
export const classes: ClassSession[] = [
  {
    id: "class-001",
    name: "Fundamentals Boxing",
    instructor: "Marcus Johnson",
    dayOfWeek: "Monday",
    time: "6:00 PM",
    duration: 60,
    capacity: 12,
    enrolled: 10,
    waitlist: 2,
    type: "fundamentals",
  },
  {
    id: "class-002",
    name: "Advanced Boxing",
    instructor: "Alex Williams",
    dayOfWeek: "Monday",
    time: "7:15 PM",
    duration: 60,
    capacity: 10,
    enrolled: 10,
    waitlist: 0,
    type: "boxing",
  },
  {
    id: "class-003",
    name: "Kickboxing Flow",
    instructor: "Sarah Chen",
    dayOfWeek: "Tuesday",
    time: "5:30 PM",
    duration: 45,
    capacity: 15,
    enrolled: 13,
    waitlist: 0,
    type: "kickboxing",
  },
  {
    id: "class-004",
    name: "Conditioning & Cardio",
    instructor: "Michael Anderson",
    dayOfWeek: "Wednesday",
    time: "6:00 PM",
    duration: 45,
    capacity: 20,
    enrolled: 18,
    waitlist: 0,
    type: "conditioning",
  },
  {
    id: "class-005",
    name: "Muay Thai Striking",
    instructor: "James Wilson",
    dayOfWeek: "Thursday",
    time: "7:00 PM",
    duration: 60,
    capacity: 12,
    enrolled: 9,
    waitlist: 1,
    type: "kickboxing",
  },
  {
    id: "class-006",
    name: "Boxing Technique",
    instructor: "Marcus Johnson",
    dayOfWeek: "Friday",
    time: "5:30 PM",
    duration: 60,
    capacity: 12,
    enrolled: 11,
    waitlist: 0,
    type: "boxing",
  },
  {
    id: "class-007",
    name: "Saturday Sparring",
    instructor: "Alex Williams",
    dayOfWeek: "Saturday",
    time: "10:00 AM",
    duration: 90,
    capacity: 8,
    enrolled: 8,
    waitlist: 0,
    type: "boxing",
  },
  {
    id: "class-008",
    name: "Sunday Recovery",
    instructor: "Sarah Chen",
    dayOfWeek: "Sunday",
    time: "4:00 PM",
    duration: 45,
    capacity: 20,
    enrolled: 14,
    waitlist: 0,
    type: "conditioning",
  },
];

// Payments
export const payments: Payment[] = [
  {
    id: "pay-001",
    memberId: "mem-001",
    memberName: "Marcus Johnson",
    amount: 199.0,
    status: "succeeded",
    date: "2026-03-13",
    type: "subscription",
    method: "Visa ending in 4242",
  },
  {
    id: "pay-002",
    memberId: "mem-002",
    memberName: "Sarah Chen",
    amount: 249.0,
    status: "succeeded",
    date: "2026-03-12",
    type: "subscription",
    method: "Mastercard ending in 5555",
  },
  {
    id: "pay-003",
    memberId: "mem-003",
    memberName: "David Martinez",
    amount: 99.0,
    status: "failed",
    date: "2026-03-11",
    type: "subscription",
    method: "Visa ending in 1111",
  },
  {
    id: "pay-004",
    memberId: "mem-006",
    memberName: "Robert Thompson",
    amount: 99.0,
    status: "failed",
    date: "2026-03-10",
    type: "subscription",
    method: "Amex ending in 7777",
  },
  {
    id: "pay-005",
    memberId: "mem-004",
    memberName: "Alex Williams",
    amount: 199.0,
    status: "succeeded",
    date: "2026-03-09",
    type: "subscription",
    method: "Visa ending in 9999",
  },
  {
    id: "pay-006",
    memberId: "mem-008",
    memberName: "Michael Anderson",
    amount: 199.0,
    status: "succeeded",
    date: "2026-03-08",
    type: "subscription",
    method: "Mastercard ending in 2222",
  },
  {
    id: "pay-007",
    memberId: "mem-012",
    memberName: "James Wilson",
    amount: 99.0,
    status: "refunded",
    date: "2026-02-28",
    type: "subscription",
    method: "Visa ending in 3333",
  },
  {
    id: "pay-008",
    memberId: "mem-010",
    memberName: "Chris Brown",
    amount: 249.0,
    status: "succeeded",
    date: "2026-02-25",
    type: "subscription",
    method: "Mastercard ending in 6666",
  },
  {
    id: "pay-009",
    memberId: "mem-011",
    memberName: "Priya Patel",
    amount: 199.0,
    status: "pending",
    date: "2026-03-13",
    type: "subscription",
    method: "Visa ending in 8888",
  },
  {
    id: "pay-010",
    memberId: "mem-007",
    memberName: "Olivia Garcia",
    amount: 29.0,
    status: "succeeded",
    date: "2026-02-28",
    type: "one-time",
    method: "Visa ending in 4444",
  },
];
