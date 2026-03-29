import crypto from "crypto";
import { and, count as drizzleCount, eq, ne } from "drizzle-orm";
import { bookings, classes, members } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

type BookInput = {
  classId: string;
  memberId: string;
  stationId?: string | null;
  source?: (typeof bookings.$inferInsert)["source"];
  isFirstTimer?: boolean;
};

export function bookingQueries({ db, tenantFilter, tenantId }: TenantDb) {
  async function syncClassEnrollment(classId: string) {
    const [result] = await db
      .select({ count: drizzleCount() })
      .from(bookings)
      .where(
        tenantFilter(
          bookings,
          eq(bookings.classId, classId),
          ne(bookings.status, "cancelled"),
          ne(bookings.status, "no_show"),
        ),
      );

    await db
      .update(classes)
      .set({
        enrolled: result?.count ?? 0,
        updatedAt: new Date(),
      })
      .where(tenantFilter(classes, eq(classes.id, classId)));
  }

  async function getBookingById(id: string) {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(tenantFilter(bookings, eq(bookings.id, id)));

    return booking ?? null;
  }

  return {
    async getById(id: string) {
      return getBookingById(id);
    },

    /** All bookings for a class, joined with member name/avatar */
    async listByClass(classId: string) {
      const rows = await db
        .select({
          id: bookings.id,
          classId: bookings.classId,
          memberId: bookings.memberId,
          stationId: bookings.stationId,
          status: bookings.status,
          source: bookings.source,
          isFirstTimer: bookings.isFirstTimer,
          checkedInAt: bookings.checkedInAt,
          createdAt: bookings.createdAt,
          memberName: members.name,
          memberAvatar: members.avatar,
        })
        .from(bookings)
        .innerJoin(
          members,
          and(
            eq(bookings.memberId, members.id),
            eq(members.tenantId, tenantId),
          ),
        )
        .where(tenantFilter(bookings, eq(bookings.classId, classId)))
        .orderBy(bookings.createdAt);

      return rows;
    },

    async listAvailableMembersForClass(classId: string) {
      const bookedMemberRows = await db
        .select({ memberId: bookings.memberId })
        .from(bookings)
        .where(
          tenantFilter(
            bookings,
            eq(bookings.classId, classId),
            ne(bookings.status, "cancelled"),
          ),
        );

      const bookedMemberIds = new Set(
        bookedMemberRows.map((row) => row.memberId),
      );

      const rows = await db
        .select({
          id: members.id,
          name: members.name,
          avatar: members.avatar,
          status: members.status,
        })
        .from(members)
        .where(
          tenantFilter(
            members,
            ne(members.status, "cancelled"),
            ne(members.status, "frozen"),
          ),
        );

      return rows.filter((member) => !bookedMemberIds.has(member.id));
    },

    /** Returns bookings keyed by stationId for floor plan rendering */
    async getStationMap(classId: string) {
      const rows = await db
        .select({
          id: bookings.id,
          classId: bookings.classId,
          memberId: bookings.memberId,
          stationId: bookings.stationId,
          status: bookings.status,
          source: bookings.source,
          isFirstTimer: bookings.isFirstTimer,
          checkedInAt: bookings.checkedInAt,
          createdAt: bookings.createdAt,
          memberName: members.name,
          memberAvatar: members.avatar,
        })
        .from(bookings)
        .innerJoin(
          members,
          and(
            eq(bookings.memberId, members.id),
            eq(members.tenantId, tenantId),
          ),
        )
        .where(tenantFilter(bookings, eq(bookings.classId, classId)));

      const map: Record<string, (typeof rows)[number]> = {};
      for (const row of rows) {
        if (row.stationId && row.status !== "cancelled") {
          map[row.stationId] = row;
        }
      }
      return map;
    },

    /** Create a booking */
    async book(data: BookInput) {
      const id = `bk-${crypto.randomUUID()}`;
      const [classRow, memberRow] = await Promise.all([
        db
          .select({ id: classes.id, capacity: classes.capacity })
          .from(classes)
          .where(tenantFilter(classes, eq(classes.id, data.classId)))
          .then((rows) => rows[0] ?? null),
        db
          .select({ id: members.id })
          .from(members)
          .where(tenantFilter(members, eq(members.id, data.memberId)))
          .then((rows) => rows[0] ?? null),
      ]);

      if (!classRow) {
        throw new Error("Class not found for this workspace.");
      }

      if (!memberRow) {
        throw new Error("Member not found for this workspace.");
      }

      if (data.stationId) {
        const [occupiedStation] = await db
          .select({ id: bookings.id })
          .from(bookings)
          .where(
            tenantFilter(
              bookings,
              eq(bookings.classId, data.classId),
              eq(bookings.stationId, data.stationId),
              ne(bookings.status, "cancelled"),
              ne(bookings.status, "no_show"),
            ),
          );

        if (occupiedStation) {
          throw new Error("That bag is already occupied.");
        }
      }

      const [existingBooking] = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          tenantFilter(
            bookings,
            eq(bookings.classId, data.classId),
            eq(bookings.memberId, data.memberId),
            ne(bookings.status, "cancelled"),
          ),
        );

      if (existingBooking) {
        throw new Error(
          "This member is already booked into the selected class.",
        );
      }

      const [booking] = await db
        .insert(bookings)
        .values({
          id,
          tenantId,
          classId: data.classId,
          memberId: data.memberId,
          stationId: data.stationId ?? null,
          source: data.source ?? "staff",
          isFirstTimer: data.isFirstTimer ?? false,
          status: "confirmed",
        })
        .returning();

      await syncClassEnrollment(data.classId);

      return booking;
    },

    async move(bookingId: string, stationId: string) {
      const booking = await getBookingById(bookingId);

      if (!booking) {
        throw new Error("Booking not found.");
      }

      const [occupiedStation] = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          tenantFilter(
            bookings,
            eq(bookings.classId, booking.classId),
            eq(bookings.stationId, stationId),
            ne(bookings.id, bookingId),
            ne(bookings.status, "cancelled"),
            ne(bookings.status, "no_show"),
          ),
        );

      if (occupiedStation) {
        throw new Error("That bag is already occupied.");
      }

      const [updatedBooking] = await db
        .update(bookings)
        .set({
          stationId,
        })
        .where(tenantFilter(bookings, eq(bookings.id, bookingId)))
        .returning();

      return updatedBooking ?? null;
    },

    /** Check in a booking */
    async checkIn(bookingId: string) {
      const [booking] = await db
        .update(bookings)
        .set({
          status: "checked_in",
          checkedInAt: new Date(),
        })
        .where(tenantFilter(bookings, eq(bookings.id, bookingId)))
        .returning();

      if (booking) {
        await syncClassEnrollment(booking.classId);
      }

      return booking ?? null;
    },

    /** Cancel a booking */
    async cancel(bookingId: string) {
      const [booking] = await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(tenantFilter(bookings, eq(bookings.id, bookingId)))
        .returning();

      if (booking) {
        await syncClassEnrollment(booking.classId);
      }

      return booking ?? null;
    },
  };
}
