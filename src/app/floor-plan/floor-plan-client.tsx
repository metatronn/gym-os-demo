"use client";

import { useMemo, useState, useTransition } from "react";
import { floorStations } from "./stations";
import { ChevronDown, Users } from "lucide-react";
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
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
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
    setClassDropdownOpen(false);
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
      <div className="min-h-screen bg-gym-bg p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gym-text mb-4">
            Floor Plan
          </h1>
          <div className="bg-gym-card/70 border border-gym-border rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-gym-text-muted mx-auto mb-3" />
            <p className="text-gym-text-secondary">
              No classes scheduled yet. Add classes in the{" "}
              <a href="/schedule" className="text-gym-primary underline">
                Schedule
              </a>{" "}
              page first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-bg p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gym-text">
              Floor Plan
            </h1>
            <p className="text-sm text-gym-text-secondary mt-1">
              Undisputed Boxing Gym - 24 Heavy Bags
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setClassDropdownOpen((open) => !open)}
              className="flex items-center gap-3 bg-gym-card border border-gym-border rounded-xl px-4 py-3 min-w-[280px] hover:border-gym-primary/50 transition-colors"
            >
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gym-text">
                  {selectedClass?.name ?? "Select class"}
                </p>
                <p className="text-xs text-gym-text-secondary">
                  {selectedClass?.time ?? ""} ·{" "}
                  {selectedClass?.instructor ?? ""} ·{" "}
                  {selectedClass?.enrolled ?? 0}/{selectedClass?.capacity ?? 24}{" "}
                  booked
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gym-text-muted transition-transform ${
                  classDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {classDropdownOpen ? (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gym-card border border-gym-border rounded-xl shadow-2xl z-50 overflow-hidden">
                {classes.map((classRow) => (
                  <button
                    key={classRow.id}
                    onClick={() => handleClassChange(classRow.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gym-bg/50 transition-colors border-b border-gym-border last:border-b-0 ${
                      classRow.id === selectedClassId ? "bg-gym-primary/10" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-gym-text">
                      {classRow.name}
                    </p>
                    <p className="text-xs text-gym-text-secondary">
                      {classRow.time} · {classRow.instructor} ·{" "}
                      {classRow.enrolled}/{classRow.capacity ?? 24}
                    </p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-gym-card/70 border border-gym-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gym-accent">{checkedIn}</p>
            <p className="text-xs text-gym-text-secondary">Checked In</p>
          </div>
          <div className="bg-gym-card/70 border border-gym-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gym-text">{confirmed}</p>
            <p className="text-xs text-gym-text-secondary">Confirmed</p>
          </div>
          <div className="bg-gym-card/70 border border-gym-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{availableCount}</p>
            <p className="text-xs text-gym-text-secondary">Available</p>
          </div>
          <div className="bg-gym-card/70 border border-gym-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gym-success">{firstTimers}</p>
            <p className="text-xs text-gym-text-secondary">First Timers</p>
          </div>
          <div className="bg-gym-card/70 border border-gym-border rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-xl font-bold text-gym-danger">{noShows}</p>
            <p className="text-xs text-gym-text-secondary">No Shows</p>
          </div>
        </div>

        {isPending ? (
          <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-gym-card border border-gym-border rounded-xl px-6 py-3 text-sm text-gym-text">
              Updating...
            </div>
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
