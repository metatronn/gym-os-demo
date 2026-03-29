import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  activityEvents,
  bookings,
  classes,
  leads,
  members,
  messages,
  payments,
  staffMemberships,
  tasks,
  tenants,
  users,
} from "./schema";
import {
  LOCAL_DEV_ORG_ROLE as DEMO_ORG_ROLE,
  LOCAL_DEV_TENANT_ID as DEMO_TENANT_ID,
  LOCAL_DEV_USER_ID as DEMO_USER_ID,
} from "../lib/env";
import {
  activityEvents as mockActivity,
  classes as mockClasses,
  leads as mockLeads,
  members as mockMembers,
  messages as mockMessages,
  payments as mockPayments,
  tasks as mockTasks,
} from "../lib/data";

const DEMO_MEMBERSHIP_ID = "mem_demo_owner_membership";
const DEMO_STATION_IDS = [
  "st-01",
  "st-02",
  "st-03",
  "st-04",
  "st-05",
  "st-06",
  "st-07",
  "st-08",
  "st-09",
  "st-10",
  "st-11",
  "st-12",
];

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

async function seed() {
  console.log("Seeding database...");

  await db
    .insert(tenants)
    .values({
      id: DEMO_TENANT_ID,
      name: "Iron Jaw Boxing",
      slug: "iron-jaw-boxing",
      subscriptionStatus: "active",
      trialEndsAt: null,
    })
    .onConflictDoUpdate({
      target: tenants.id,
      set: {
        name: "Iron Jaw Boxing",
        slug: "iron-jaw-boxing",
        subscriptionStatus: "active",
        trialEndsAt: null,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(users)
    .values({
      id: DEMO_USER_ID,
      email: "owner@ironjawboxing.com",
      firstName: "Javier",
      lastName: "Laval",
      fullName: "Javier Laval",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: "owner@ironjawboxing.com",
        firstName: "Javier",
        lastName: "Laval",
        fullName: "Javier Laval",
        updatedAt: new Date(),
      },
    });

  await db
    .insert(staffMemberships)
    .values({
      id: DEMO_MEMBERSHIP_ID,
      tenantId: DEMO_TENANT_ID,
      userId: DEMO_USER_ID,
      role: DEMO_ORG_ROLE,
      email: "owner@ironjawboxing.com",
      name: "Javier Laval",
      status: "active",
    })
    .onConflictDoUpdate({
      target: staffMemberships.id,
      set: {
        role: DEMO_ORG_ROLE,
        email: "owner@ironjawboxing.com",
        name: "Javier Laval",
        status: "active",
        updatedAt: new Date(),
      },
    });

  await db
    .delete(activityEvents)
    .where(eq(activityEvents.tenantId, DEMO_TENANT_ID));
  await db.delete(bookings).where(eq(bookings.tenantId, DEMO_TENANT_ID));
  await db.delete(messages).where(eq(messages.tenantId, DEMO_TENANT_ID));
  await db.delete(tasks).where(eq(tasks.tenantId, DEMO_TENANT_ID));
  await db.delete(payments).where(eq(payments.tenantId, DEMO_TENANT_ID));
  await db.delete(classes).where(eq(classes.tenantId, DEMO_TENANT_ID));
  await db.delete(leads).where(eq(leads.tenantId, DEMO_TENANT_ID));
  await db.delete(members).where(eq(members.tenantId, DEMO_TENANT_ID));

  await db.insert(members).values(
    mockMembers.map((member) => ({
      id: member.id,
      tenantId: DEMO_TENANT_ID,
      name: member.name,
      email: member.email,
      phone: member.phone,
      avatar: member.avatar,
      plan: member.plan,
      status: member.status,
      riskScore: member.riskScore,
      riskLevel: member.riskLevel,
      lastCheckIn: parseDate(member.lastCheckIn),
      monthlyVisits: member.monthlyVisits,
      billingStatus: member.billingStatus,
      joinDate: parseDate(member.joinDate) ?? new Date(),
      tags: member.tags,
      notes: member.notes,
    })),
  );

  await db.insert(leads).values(
    mockLeads.map((lead) => ({
      id: lead.id,
      tenantId: DEMO_TENANT_ID,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      score: lead.score,
      interest: lead.interest,
      assignedTo: lead.assignedTo,
      lastContact: parseDate(lead.lastContact),
      createdAt: parseDate(lead.createdAt) ?? new Date(),
      updatedAt: parseDate(lead.lastContact) ?? new Date(),
    })),
  );

  await db.insert(classes).values(
    mockClasses.map((session) => ({
      id: session.id,
      tenantId: DEMO_TENANT_ID,
      name: session.name,
      instructor: session.instructor,
      dayOfWeek: session.dayOfWeek,
      time: session.time,
      duration: session.duration,
      capacity: session.capacity,
      enrolled: session.enrolled,
      waitlist: session.waitlist,
      type: session.type,
    })),
  );

  await db.insert(bookings).values(
    mockMembers.slice(0, DEMO_STATION_IDS.length).map((member, index) => {
      const status: (typeof bookings.$inferInsert)["status"] =
        index === 0 || index === 2 || index === 6
          ? "checked_in"
          : index === 10
            ? "no_show"
            : "confirmed";
      const source: (typeof bookings.$inferInsert)["source"] =
        index === 5 ? "staff" : index === 7 ? "classpass" : "self";

      return {
        id: `booking-${index + 1}`,
        tenantId: DEMO_TENANT_ID,
        classId: index < 8 ? mockClasses[0].id : mockClasses[1].id,
        memberId: member.id,
        stationId: DEMO_STATION_IDS[index],
        status,
        source,
        isFirstTimer: member.status === "trial",
        checkedInAt:
          index === 0 || index === 2 || index === 6 ? new Date() : null,
      };
    }),
  );

  await db.insert(payments).values(
    mockPayments.map((payment) => ({
      id: payment.id,
      tenantId: DEMO_TENANT_ID,
      memberId: payment.memberId,
      memberName: payment.memberName,
      amount: Math.round(payment.amount * 100),
      status: payment.status,
      type: payment.type,
      method: payment.method,
      createdAt: parseDate(payment.date) ?? new Date(),
    })),
  );

  await db.insert(tasks).values(
    mockTasks.map((task) => ({
      id: task.id,
      tenantId: DEMO_TENANT_ID,
      title: task.title,
      assignedTo: task.assignedTo,
      dueDate: parseDate(task.dueDate),
      priority: task.priority,
      status: task.status,
      category: task.category,
    })),
  );

  await db.insert(messages).values(
    mockMessages.map((message) => ({
      id: message.id,
      tenantId: DEMO_TENANT_ID,
      contactName: message.contactName,
      contactType: message.contactType,
      channel: message.channel,
      lastMessage: message.lastMessage,
      unread: message.unread,
      timestamp: parseDate(message.timestamp) ?? new Date(),
      createdAt: parseDate(message.timestamp) ?? new Date(),
      updatedAt: parseDate(message.timestamp) ?? new Date(),
    })),
  );

  await db.insert(activityEvents).values(
    mockActivity.map((event) => ({
      id: event.id,
      tenantId: DEMO_TENANT_ID,
      type: event.type,
      description: event.description,
      relatedId: event.relatedId,
      relatedName: event.relatedName,
      createdAt: parseDate(event.timestamp) ?? new Date(),
    })),
  );

  console.log("Seeded demo tenant, staff, and dashboard data.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
