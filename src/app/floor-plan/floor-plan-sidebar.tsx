"use client";

import {
  X,
  Check,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  CircleDot,
  ArrowRight,
} from "lucide-react";
import { floorStations } from "./stations";
import type {
  FloorBookingRow,
  FloorBookableMemberRow,
  FloorClassRow,
} from "./floor-plan-client";

function getStatusLabel(booking?: FloorBookingRow) {
  if (!booking) return "Available";

  switch (booking.status) {
    case "checked_in":
      return "Checked In";
    case "confirmed":
      return "Confirmed";
    case "no_show":
      return "No Show";
    case "waitlisted":
      return "Waitlisted";
    case "cancelled":
      return "Cancelled";
    default:
      return booking.status;
  }
}

function getSourceLabel(source: string) {
  switch (source) {
    case "self":
      return "Member App";
    case "staff":
      return "Staff Booked";
    case "classpass":
      return "ClassPass";
    case "ai_chat":
      return "AI Chat";
    case "ai_voice":
      return "AI Voice";
    default:
      return source;
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface FloorPlanSidebarProps {
  selectedStationId: string | null;
  selectedBooking: FloorBookingRow | undefined;
  activeBookings: FloorBookingRow[];
  availableMembers: FloorBookableMemberRow[];
  selectedClass: FloorClassRow | undefined;
  openStations: { id: string; number: number }[];
  isPending: boolean;
  actionError: string | null;
  memberSearch: string;
  selectedMemberId: string;
  moveTargetStationId: string;
  onStationSelect: (stationId: string | null) => void;
  onCheckIn: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onBook: () => void;
  onMove: (bookingId: string) => void;
  onMemberSearchChange: (value: string) => void;
  onMemberSelect: (memberId: string) => void;
  onMoveTargetChange: (stationId: string) => void;
}

export default function FloorPlanSidebar({
  selectedStationId,
  selectedBooking,
  activeBookings,
  availableMembers,
  selectedClass,
  openStations,
  isPending,
  actionError,
  memberSearch,
  selectedMemberId,
  moveTargetStationId,
  onStationSelect,
  onCheckIn,
  onCancel,
  onBook,
  onMove,
  onMemberSearchChange,
  onMemberSelect,
  onMoveTargetChange,
}: FloorPlanSidebarProps) {
  const selectedStation = selectedStationId
    ? floorStations.find((station) => station.id === selectedStationId)
    : null;

  const filteredAvailableMembers = availableMembers.filter((member) =>
    member.name.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  return (
    <div className="w-full lg:w-[360px] flex-shrink-0 space-y-4">
      {selectedStation ? (
        <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gym-text">
              Bag {selectedStation.number}
            </h3>
            <button
              onClick={() => onStationSelect(null)}
              className="p-1 hover:bg-gym-bg rounded-lg"
            >
              <X className="w-4 h-4 text-gym-text-muted" />
            </button>
          </div>

          {actionError ? (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {actionError}
            </div>
          ) : null}

          {selectedBooking ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedBooking.isFirstTimer
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gym-primary/20 text-gym-primary"
                  }`}
                >
                  {selectedBooking.memberAvatar ??
                    initials(selectedBooking.memberName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gym-text">
                    {selectedBooking.memberName}
                  </p>
                  <div className="flex items-center gap-2">
                    {selectedBooking.isFirstTimer ? (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full">
                        First Timer
                      </span>
                    ) : null}
                    <span className="text-xs text-gym-text-muted">
                      {getSourceLabel(selectedBooking.source)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gym-bg/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gym-text-secondary">
                    Status
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      selectedBooking.status === "checked_in"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : selectedBooking.status === "confirmed"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : selectedBooking.status === "no_show"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    }`}
                  >
                    {getStatusLabel(selectedBooking)}
                  </span>
                </div>
                {selectedBooking.checkedInAt ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gym-text-secondary">
                      Checked in
                    </span>
                    <span className="text-xs text-gym-text">
                      {new Date(selectedBooking.checkedInAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gym-text-secondary">
                    Booking source
                  </span>
                  <span className="text-xs text-gym-text">
                    {getSourceLabel(selectedBooking.source)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedBooking.status === "confirmed" ? (
                  <button
                    onClick={() => onCheckIn(selectedBooking.id)}
                    disabled={isPending}
                    className="w-full text-sm bg-gym-accent hover:bg-gym-accent/80 text-white rounded-lg px-4 py-2.5 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Check In
                  </button>
                ) : null}

                <div className="rounded-xl border border-gym-border bg-gym-bg/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-gym-text-muted">
                      Reassign Station
                    </p>
                    <span className="text-xs text-gym-text-secondary">
                      {openStations.length} open
                    </span>
                  </div>
                  <select
                    value={moveTargetStationId}
                    onChange={(event) => onMoveTargetChange(event.target.value)}
                    className="w-full rounded-lg border border-gym-border bg-gym-card px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  >
                    <option value="">Choose an open bag</option>
                    {openStations.map((station) => (
                      <option key={station.id} value={station.id}>
                        Bag {station.number}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onMove(selectedBooking.id)}
                    disabled={isPending || !moveTargetStationId}
                    className="w-full text-sm bg-gym-bg hover:bg-gym-border text-gym-text-secondary rounded-lg px-4 py-2.5 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" /> Move to Another Bag
                  </button>
                </div>

                {selectedBooking.status !== "cancelled" ? (
                  <button
                    onClick={() => onCancel(selectedBooking.id)}
                    disabled={isPending}
                    className="w-full text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-4 py-2.5 font-medium transition disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gym-bg/50 rounded-lg p-4 text-center">
                <CircleDot className="w-8 h-8 text-gym-text-muted mx-auto mb-2" />
                <p className="text-sm text-gym-text-secondary">
                  This bag is available
                </p>
              </div>

              <div className="rounded-xl border border-gym-border bg-gym-bg/50 p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gym-text-muted">
                    Assign Member
                  </p>
                  <span className="text-xs text-gym-text-secondary">
                    {availableMembers.length} available
                  </span>
                </div>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(event) => onMemberSearchChange(event.target.value)}
                  placeholder="Search members..."
                  className="w-full rounded-lg border border-gym-border bg-gym-card px-3 py-2 text-sm text-gym-text placeholder:text-gym-text-muted focus:outline-none focus:border-gym-primary"
                />
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {filteredAvailableMembers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gym-border px-3 py-6 text-center text-xs text-gym-text-muted">
                      No bookable members matched this search.
                    </div>
                  ) : (
                    filteredAvailableMembers.map((member) => {
                      const isSelected = selectedMemberId === member.id;

                      return (
                        <button
                          key={member.id}
                          onClick={() => onMemberSelect(member.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                            isSelected
                              ? "border-gym-primary bg-gym-primary/10"
                              : "border-gym-border bg-gym-card hover:border-gym-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gym-primary/20 text-gym-primary flex items-center justify-center text-xs font-bold">
                              {member.avatar ?? initials(member.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gym-text">
                                {member.name}
                              </p>
                              <p className="text-xs capitalize text-gym-text-muted">
                                {member.status}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={onBook}
                disabled={isPending || !selectedMemberId}
                className="w-full text-sm bg-gym-primary hover:bg-gym-primary/80 text-white rounded-lg px-4 py-2.5 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" /> Book This Spot
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gym-text">
            Class Roster
          </h3>
          <span className="text-xs bg-gym-primary/20 text-gym-primary px-2 py-1 rounded-full font-medium">
            {activeBookings.length} / {selectedClass?.capacity ?? 24}
          </span>
        </div>

        {activeBookings.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-gym-text-muted mx-auto mb-2" />
            <p className="text-sm text-gym-text-secondary">
              No bookings for this class yet
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {activeBookings
              .sort((left, right) => {
                const leftStation = floorStations.find(
                  (station) => station.id === left.stationId,
                );
                const rightStation = floorStations.find(
                  (station) => station.id === right.stationId,
                );

                return (leftStation?.number || 0) - (rightStation?.number || 0);
              })
              .map((booking) => {
                const station = floorStations.find(
                  (item) => item.id === booking.stationId,
                );
                const avatar =
                  booking.memberAvatar ?? initials(booking.memberName);

                return (
                  <button
                    key={booking.id}
                    onClick={() => onStationSelect(booking.stationId)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      selectedStationId === booking.stationId
                        ? "bg-gym-primary/10 border border-gym-primary/30"
                        : "hover:bg-gym-bg/50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        booking.isFirstTimer
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "checked_in"
                            ? "bg-cyan-500/20 text-cyan-400"
                            : booking.status === "no_show"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gym-bg text-gym-text-secondary"
                      }`}
                    >
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gym-text truncate">
                        {booking.memberName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gym-text-muted">
                        Bag {station?.number}
                      </span>
                      {booking.status === "checked_in" ? (
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      ) : null}
                      {booking.status === "no_show" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      ) : null}
                      {booking.isFirstTimer ? (
                        <span className="text-[10px]">{"⭐"}</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {selectedClass && selectedClass.waitlist > 0 ? (
          <div className="mt-4 pt-3 border-t border-gym-border">
            <p className="text-xs text-gym-text-muted mb-2">
              Waitlist ({selectedClass.waitlist})
            </p>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gym-warning" />
              <span className="text-xs text-gym-text-secondary">
                {selectedClass.waitlist} member
                {selectedClass.waitlist > 1 ? "s" : ""} waiting
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
