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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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

function getStatusBadgeVariant(
  status: string,
): "default" | "accent" | "destructive" | "secondary" {
  switch (status) {
    case "checked_in":
      return "accent";
    case "confirmed":
      return "default";
    case "no_show":
      return "destructive";
    default:
      return "secondary";
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
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">
              Bag {selectedStation.number}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStationSelect(null)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="pt-0">
            {actionError ? (
              <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {actionError}
              </div>
            ) : null}

            {selectedBooking ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      selectedBooking.isFirstTimer
                        ? "bg-success/20 text-success"
                        : "bg-primary/20 text-primary",
                    )}
                  >
                    {selectedBooking.memberAvatar ??
                      initials(selectedBooking.memberName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedBooking.memberName}
                    </p>
                    <div className="flex items-center gap-2">
                      {selectedBooking.isFirstTimer ? (
                        <Badge variant="success" className="text-xs">
                          First Timer
                        </Badge>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {getSourceLabel(selectedBooking.source)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant={getStatusBadgeVariant(selectedBooking.status)}
                    >
                      {getStatusLabel(selectedBooking)}
                    </Badge>
                  </div>
                  {selectedBooking.checkedInAt ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Checked in
                      </span>
                      <span className="text-xs text-foreground">
                        {new Date(
                          selectedBooking.checkedInAt,
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Booking source
                    </span>
                    <span className="text-xs text-foreground">
                      {getSourceLabel(selectedBooking.source)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedBooking.status === "confirmed" ? (
                    <Button
                      onClick={() => onCheckIn(selectedBooking.id)}
                      disabled={isPending}
                      className="w-full"
                      variant="success"
                    >
                      <Check className="w-4 h-4 mr-2" /> Check In
                    </Button>
                  ) : null}

                  <Card>
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Reassign Station
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {openStations.length} open
                        </span>
                      </div>
                      <Select
                        value={moveTargetStationId}
                        onValueChange={onMoveTargetChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an open bag" />
                        </SelectTrigger>
                        <SelectContent>
                          {openStations.map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              Bag {station.number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => onMove(selectedBooking.id)}
                        disabled={isPending || !moveTargetStationId}
                        variant="secondary"
                        className="w-full"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" /> Move to Another
                        Bag
                      </Button>
                    </CardContent>
                  </Card>

                  {selectedBooking.status !== "cancelled" ? (
                    <Button
                      onClick={() => onCancel(selectedBooking.id)}
                      disabled={isPending}
                      variant="destructive"
                      className="w-full"
                    >
                      Cancel Booking
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <CircleDot className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    This bag is available
                  </p>
                </div>

                <Card>
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Assign Member
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {availableMembers.length} available
                      </span>
                    </div>
                    <Input
                      value={memberSearch}
                      onChange={(event) =>
                        onMemberSearchChange(event.target.value)
                      }
                      placeholder="Search members..."
                    />
                    <ScrollArea className="max-h-56">
                      <div className="space-y-2">
                        {filteredAvailableMembers.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                            No bookable members matched this search.
                          </div>
                        ) : (
                          filteredAvailableMembers.map((member) => {
                            const isSelected = selectedMemberId === member.id;

                            return (
                              <button
                                key={member.id}
                                onClick={() => onMemberSelect(member.id)}
                                className={cn(
                                  "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                                  isSelected
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-card hover:border-primary/40",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                    {member.avatar ?? initials(member.name)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {member.name}
                                    </p>
                                    <p className="text-xs capitalize text-muted-foreground">
                                      {member.status}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Button
                  onClick={onBook}
                  disabled={isPending || !selectedMemberId}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" /> Book This Spot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-card/70 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Class Roster</CardTitle>
          <Badge variant="default">
            {activeBookings.length} / {selectedClass?.capacity ?? 24}
          </Badge>
        </CardHeader>

        <CardContent className="pt-0">
          {activeBookings.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No bookings for this class yet
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-1.5">
                {activeBookings
                  .sort((left, right) => {
                    const leftStation = floorStations.find(
                      (station) => station.id === left.stationId,
                    );
                    const rightStation = floorStations.find(
                      (station) => station.id === right.stationId,
                    );

                    return (
                      (leftStation?.number || 0) - (rightStation?.number || 0)
                    );
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
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                          selectedStationId === booking.stationId
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-secondary/50",
                        )}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                            booking.isFirstTimer
                              ? "bg-success/20 text-success"
                              : booking.status === "checked_in"
                                ? "bg-accent/20 text-accent"
                                : booking.status === "no_show"
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {booking.memberName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            Bag {station?.number}
                          </span>
                          {booking.status === "checked_in" ? (
                            <Check className="w-3.5 h-3.5 text-accent" />
                          ) : null}
                          {booking.status === "no_show" ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                          ) : null}
                          {booking.isFirstTimer ? (
                            <span className="text-[10px]">{"⭐"}</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </ScrollArea>
          )}

          {selectedClass && selectedClass.waitlist > 0 ? (
            <>
              <Separator className="mt-4" />
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Waitlist ({selectedClass.waitlist})
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-warning" />
                  <span className="text-xs text-muted-foreground">
                    {selectedClass.waitlist} member
                    {selectedClass.waitlist > 1 ? "s" : ""} waiting
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
