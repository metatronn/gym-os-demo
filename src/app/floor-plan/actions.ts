"use server";

import { revalidatePath } from "next/cache";
import { activityQueries } from "@/db/queries/activity";
import { classQueries } from "@/db/queries/classes";
import { bookingQueries } from "@/db/queries/bookings";
import { tenantDb } from "@/db/tenant";

/** Fetch today's classes (or all classes for now) */
export async function getFloorClasses() {
  const tenant = await tenantDb();
  return classQueries(tenant).list();
}

export async function getBookableMembersForClass(classId: string) {
  const tenant = await tenantDb();
  return bookingQueries(tenant).listAvailableMembersForClass(classId);
}

/** Return bookings for a class with member info, keyed by stationId */
export async function getBookingsForClass(classId: string) {
  const tenant = await tenantDb();
  return bookingQueries(tenant).listByClass(classId);
}

/** Create a booking for a member at a specific station */
export async function bookStation(
  classId: string,
  memberId: string,
  stationId: string,
) {
  const tenant = await tenantDb();
  const result = await bookingQueries(tenant).book({
    classId,
    memberId,
    stationId,
    source: "staff",
  });

  revalidatePath("/floor-plan");
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return result;
}

export async function moveBooking(bookingId: string, stationId: string) {
  const tenant = await tenantDb();
  const result = await bookingQueries(tenant).move(bookingId, stationId);

  revalidatePath("/floor-plan");
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return result;
}

/** Check in a booking */
export async function checkInBooking(bookingId: string) {
  const tenant = await tenantDb();
  const queries = bookingQueries(tenant);
  const result = await queries.checkIn(bookingId);

  if (result) {
    const bookingDetail = (await queries.listByClass(result.classId)).find(
      (booking) => booking.id === result.id,
    );

    await activityQueries(tenant).create({
      type: "member-checkin",
      description: bookingDetail
        ? `${bookingDetail.memberName} checked in at bag ${bookingDetail.stationId ?? "unassigned"}`
        : "Member checked in",
      relatedId: result.memberId,
      relatedName: bookingDetail?.memberName ?? null,
    });
  }

  revalidatePath("/floor-plan");
  revalidatePath("/dashboard");
  return result;
}

/** Cancel a booking */
export async function cancelBooking(bookingId: string) {
  const tenant = await tenantDb();
  const result = await bookingQueries(tenant).cancel(bookingId);

  revalidatePath("/floor-plan");
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return result;
}
