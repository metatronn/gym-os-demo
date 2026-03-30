"use client";

import { useMemo, useState, useTransition } from "react";
import { floorStations } from "./stations";
import { Users } from "lucide-react";
import {
  bookStation,
  cancelBooking,
  checkInBooking,
  getBookableMembersForClass,
  getBookingsForClass,
  moveBooking,
} from "./actions";
import FloorPlanGrid from "./floor-plan-grid";
import FloorPlanSidebar from "./floor-plan-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export type FloorBookingRow = {
  id: string;
  classId: string;
  memberId: string;
  stationId: string | null;
  status:
    | "available"
    | "confirmed"
    | "checked_in"
    | "waitlisted"
    | "no_show"
    | "cancelled";
  source: "self" | "staff" | "classpass" | "ai_chat" | "ai_voice";
  isFirstTimer: boolean;
  checkedInAt: Date | string | null;
  createdAt: Date | string;
  memberName: string;
  memberAvatar: string | null;
};

export type FloorBookableMemberRow = {
  id: string;
  name: string;
  avatar: string | null;
  status: "active" | "frozen" | "cancelled" | "trial";
};

export type FloorClassRow = {
  id: string;
  name: string;
  instructor: string | null;
  time: string | null;
  capacity: number | null;
  enrolled: number;
  waitlist: number;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

interface FloorPlanClientProps {
  initialClasses: FloorClassRow[];
  initialBookings: FloorBookingRow[];
  initialAvailableMembers: FloorBookableMemberRow[];
  initialClassId: string | null;
}

export default function FloorPlanClient({
  initialClasses,
  initialBookings,
  initialAvailableMembers,
  initialClassId,
}: FloorPlanClientProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId ?? initialClasses[0]?.id ?? "",
  );
  const [bookings, setBookings] = useState<FloorBookingRow[]>(initialBookings);
  const [availableMembers, setAvailableMembers] = useState<
    FloorBookableMemberRow[]
  >(initialAvailableMembers);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null,
  );
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [moveTargetStationId, setMoveTargetStationId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedClass = classes.find((item) => item.id === selectedClassId);

  const bookingMap = useMemo(() => {
    const map = new Map<string, FloorBookingRow>();

    for (const booking of bookings) {
      if (booking.stationId && booking.status !== "cancelled") {
        map.set(booking.stationId, booking);
      }
    }

    return map;
  }, [bookings]);

  const selectedBooking = selectedStationId
    ? bookingMap.get(selectedStationId)
    : undefined;

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "cancelled",
  );
  const checkedIn = activeBookings.filter(
    (booking) => booking.status === "checked_in",
  ).length;
  const confirmed = activeBookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;
  const noShows = activeBookings.filter(
    (booking) => booking.status === "no_show",
  ).length;
  const firstTimers = activeBookings.filter(
    (booking) => booking.isFirstTimer,
  ).length;
  const availableCount =
    (selectedClass?.capacity ?? 24) -
    bookings.filter(
      (booking) =>
        booking.status !== "cancelled" && booking.status !== "no_show",
    ).length;

  const openStations = floorStations.filter(
    (station) =>
      station.isBookable &&
      !bookingMap.has(station.id) &&
      station.id !== selectedBooking?.stationId,
  );

  async function refreshClassContext(classId: string) {
    const [nextBookings, nextMembers] = await Promise.all([
      getBookingsForClass(classId),
      getBookableMembersForClass(classId),
    ]);

    const bookingRows = nextBookings as FloorBookingRow[];
    const memberRows = nextMembers as FloorBookableMemberRow[];

    setBookings(bookingRows);
    setAvailableMembers(memberRows);
    setClasses((current) =>
      current.map((item) =>
        item.id === classId
          ? {
              ...item,
              enrolled: bookingRows.filter(
                (booking) =>
                  booking.status !== "cancelled" &&
                  booking.status !== "no_show",
              ).length,
            }
          : item,
      ),
    );
  }

  function resetSelectionState() {
    setSelectedMemberId("");
    setMoveTargetStationId("");
    setMemberSearch("");
    setActionError(null);
  }

  function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedStationId(null);
    resetSelectionState();

    startTransition(async () => {
      try {
        await refreshClassContext(classId);
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    });
  }

  function handleStationSelect(stationId: string | null) {
    setSelectedStationId(stationId);
    resetSelectionState();
  }

  function handleCheckIn(bookingId: string) {
    startTransition(async () => {
      try {
        setActionError(null);
        await checkInBooking(bookingId);
        await refreshClassContext(selectedClassId);
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    });
  }

  function handleCancel(bookingId: string) {
    startTransition(async () => {
      try {
        setActionError(null);
        await cancelBooking(bookingId);
        await refreshClassContext(selectedClassId);
        setSelectedStationId(null);
        resetSelectionState();
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    });
  }

  function handleBook() {
    if (!selectedStationId || !selectedMemberId) {
      return;
    }

    const stationId = selectedStationId;
    const memberId = selectedMemberId;

    startTransition(async () => {
      try {
        setActionError(null);
        await bookStation(selectedClassId, memberId, stationId);
        await refreshClassContext(selectedClassId);
        setSelectedStationId(stationId);
        setSelectedMemberId("");
        setMemberSearch("");
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    });
  }

  function handleMove(bookingId: string) {
    if (!moveTargetStationId) {
      return;
    }

    const nextStationId = moveTargetStationId;

    startTransition(async () => {
      try {
        setActionError(null);
        await moveBooking(bookingId, nextStationId);
        await refreshClassContext(selectedClassId);
        setSelectedStationId(nextStationId);
        setMoveTargetStationId("");
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    });
  }

  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Floor Plan
          </h1>
          <Card className="bg-card/70">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No classes scheduled yet. Add classes in the{" "}
                <a href="/schedule" className="text-primary underline">
                  Schedule
                </a>{" "}
                page first.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Floor Plan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Undisputed Boxing Gym - 24 Heavy Bags
            </p>
          </div>

          <Select value={selectedClassId} onValueChange={handleClassChange}>
            <SelectTrigger className="min-w-[280px] h-auto py-2">
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">
                  {selectedClass?.name ?? "Select class"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedClass?.time ?? ""} ·{" "}
                  {selectedClass?.instructor ?? ""} ·{" "}
                  {selectedClass?.enrolled ?? 0}/{selectedClass?.capacity ?? 24}{" "}
                  booked
                </p>
              </div>
            </SelectTrigger>
            <SelectContent>
              {classes.map((classRow) => (
                <SelectItem key={classRow.id} value={classRow.id}>
                  <div>
                    <p className="text-sm font-medium">{classRow.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {classRow.time} · {classRow.instructor} ·{" "}
                      {classRow.enrolled}/{classRow.capacity ?? 24}
                    </p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <Card className="bg-card/70">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-accent">{checkedIn}</p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </CardContent>
          </Card>
          <Card className="bg-card/70">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="bg-card/70">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">
                {availableCount}
              </p>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card className="bg-card/70">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-success">{firstTimers}</p>
              <p className="text-xs text-muted-foreground">First Timers</p>
            </CardContent>
          </Card>
          <Card className="bg-card/70 col-span-2 sm:col-span-1">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-destructive">{noShows}</p>
              <p className="text-xs text-muted-foreground">No Shows</p>
            </CardContent>
          </Card>
        </div>

        {isPending ? (
          <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center pointer-events-none">
            <Card className="px-6 py-3">
              <span className="text-sm text-foreground">Updating...</span>
            </Card>
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-6">
          <FloorPlanGrid
            bookingMap={bookingMap}
            selectedStationId={selectedStationId}
            onStationSelect={handleStationSelect}
          />

          <FloorPlanSidebar
            selectedStationId={selectedStationId}
            selectedBooking={selectedBooking}
            activeBookings={activeBookings}
            availableMembers={availableMembers}
            selectedClass={selectedClass}
            openStations={openStations}
            isPending={isPending}
            actionError={actionError}
            memberSearch={memberSearch}
            selectedMemberId={selectedMemberId}
            moveTargetStationId={moveTargetStationId}
            onStationSelect={handleStationSelect}
            onCheckIn={handleCheckIn}
            onCancel={handleCancel}
            onBook={handleBook}
            onMove={handleMove}
            onMemberSearchChange={setMemberSearch}
            onMemberSelect={setSelectedMemberId}
            onMoveTargetChange={setMoveTargetStationId}
          />
        </div>
      </div>
    </div>
  );
}
