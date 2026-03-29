import {
  getBookableMembersForClass,
  getBookingsForClass,
  getFloorClasses,
} from "./actions";
import FloorPlanClient from "./floor-plan-client";
import type {
  FloorBookableMemberRow,
  FloorBookingRow,
  FloorClassRow,
} from "./floor-plan-client";

export const dynamic = "force-dynamic";

export default async function FloorPlanPage() {
  const allClasses = await getFloorClasses();

  // Map DB class rows to the shape the client expects
  const classes: FloorClassRow[] = allClasses.map((c) => ({
    id: c.id,
    name: c.name,
    instructor: c.instructor,
    time: c.time,
    capacity: c.capacity,
    enrolled: c.enrolled,
    waitlist: c.waitlist,
  }));

  const firstClassId = classes[0]?.id ?? null;

  // Pre-fetch bookings for the initially selected class
  const initialBookings: FloorBookingRow[] = firstClassId
    ? ((await getBookingsForClass(firstClassId)) as FloorBookingRow[])
    : [];
  const initialAvailableMembers: FloorBookableMemberRow[] = firstClassId
    ? ((await getBookableMembersForClass(
        firstClassId,
      )) as FloorBookableMemberRow[])
    : [];

  return (
    <FloorPlanClient
      initialClasses={classes}
      initialBookings={initialBookings}
      initialAvailableMembers={initialAvailableMembers}
      initialClassId={firstClassId}
    />
  );
}
