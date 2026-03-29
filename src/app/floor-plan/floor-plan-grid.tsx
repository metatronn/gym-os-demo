"use client";

import { floorStations, type Station } from "./stations";
import type { FloorBookingRow } from "./floor-plan-client";

function getStationColor(
  station: Station,
  booking?: FloorBookingRow,
  isSelected?: boolean,
) {
  if (!station.isBookable) {
    return { fill: "#1E293B", border: "#374151", text: "#64748B" };
  }

  if (!booking) {
    return { fill: "#0A0F1C", border: "#FFFFFF", text: "#FFFFFF" };
  }

  if (isSelected) {
    return { fill: "#1E3A5F", border: "#3B82F6", text: "#FFFFFF" };
  }

  if (booking.isFirstTimer) {
    return { fill: "#064E3B", border: "#27AE60", text: "#27AE60" };
  }

  if (booking.source === "staff" || booking.source === "classpass") {
    return { fill: "#1A1A2E", border: "#1A1A1A", text: "#9CA3AF" };
  }

  if (booking.status === "no_show") {
    return { fill: "#3B1320", border: "#EF4444", text: "#EF4444" };
  }

  if (booking.status === "checked_in") {
    return { fill: "#0C2D48", border: "#06B6D4", text: "#06B6D4" };
  }

  return { fill: "#1C1427", border: "#C0392B", text: "#C0392B" };
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface FloorPlanGridProps {
  bookingMap: Map<string, FloorBookingRow>;
  selectedStationId: string | null;
  onStationSelect: (stationId: string | null) => void;
}

export default function FloorPlanGrid({
  bookingMap,
  selectedStationId,
  onStationSelect,
}: FloorPlanGridProps) {
  return (
    <div className="flex-1">
      <div className="bg-gym-card/50 backdrop-blur border border-gym-border rounded-2xl p-4 lg:p-6">
        <div className="flex justify-between mb-2 px-2">
          <span className="text-xs text-gym-text-muted uppercase tracking-widest">
            Wall Side
          </span>
          <span className="text-xs text-gym-text-muted uppercase tracking-widest">
            Entrance →
          </span>
        </div>

        <div className="relative w-full" style={{ paddingBottom: "85%" }}>
          <svg
            viewBox="0 0 1000 850"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {Array.from({ length: 11 }).map((_, index) => (
              <line
                key={`h-${index}`}
                x1="0"
                y1={index * 85}
                x2="1000"
                y2={index * 85}
                stroke="#1E293B"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
            ))}
            {Array.from({ length: 11 }).map((_, index) => (
              <line
                key={`v-${index}`}
                x1={index * 100}
                y1="0"
                x2={index * 100}
                y2="850"
                stroke="#1E293B"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
            ))}

            {floorStations.map((station) => {
              const cx = station.x * 1000;
              const cy = station.y * 850;
              const booking = bookingMap.get(station.id);
              const isSelected = selectedStationId === station.id;
              const colors = getStationColor(station, booking, isSelected);
              const avatar = booking
                ? (booking.memberAvatar ?? initials(booking.memberName))
                : null;

              if (station.type === "tv_monitor") {
                return (
                  <g key={station.id}>
                    <rect
                      x={cx - 25}
                      y={cy - 12}
                      width={50}
                      height={24}
                      rx={4}
                      fill={colors.fill}
                      stroke={colors.border}
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      TV
                    </text>
                  </g>
                );
              }

              const radius = isSelected ? 30 : 26;

              return (
                <g
                  key={station.id}
                  onClick={() =>
                    station.isBookable
                      ? onStationSelect(isSelected ? null : station.id)
                      : undefined
                  }
                  className={station.isBookable ? "cursor-pointer" : ""}
                >
                  {isSelected ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 6}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        from={radius + 4}
                        to={radius + 10}
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.4"
                        to="0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ) : null}

                  {booking?.status === "no_show" ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 4}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ) : null}

                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={colors.fill}
                    stroke={colors.border}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-150"
                  />

                  <text
                    x={cx}
                    y={booking ? cy - 3 : cy + 5}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize={booking ? "11" : "14"}
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    {station.number}
                  </text>

                  {booking && avatar ? (
                    <text
                      x={cx}
                      y={cy + 12}
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize="9"
                      fontFamily="system-ui"
                      opacity="0.8"
                    >
                      {avatar}
                    </text>
                  ) : null}

                  {booking?.isFirstTimer ? (
                    <text
                      x={cx + 18}
                      y={cy - 16}
                      textAnchor="middle"
                      fontSize="12"
                    >
                      {"⭐"}
                    </text>
                  ) : null}

                  {booking?.status === "checked_in" ? (
                    <circle
                      cx={cx + 20}
                      cy={cy - 18}
                      r={5}
                      fill="#06B6D4"
                      stroke="#0A0F1C"
                      strokeWidth={1.5}
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between mt-2 px-2">
          <span className="text-xs text-gym-text-muted uppercase tracking-widest">
            Ring Side
          </span>
          <span className="text-xs text-gym-text-muted uppercase tracking-widest">
            ← Back Wall
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gym-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-white bg-gym-bg"></div>
            <span className="text-xs text-gym-text-secondary">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-[#C0392B] bg-[#1C1427]"></div>
            <span className="text-xs text-gym-text-secondary">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-[#06B6D4] bg-[#0C2D48]"></div>
            <span className="text-xs text-gym-text-secondary">Checked In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-[#27AE60] bg-[#064E3B]"></div>
            <span className="text-xs text-gym-text-secondary">First Timer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-[#1A1A1A] bg-[#1A1A2E]"></div>
            <span className="text-xs text-gym-text-secondary">
              Staff / ClassPass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-[#EF4444] bg-[#3B1320]"></div>
            <span className="text-xs text-gym-text-secondary">No Show</span>
          </div>
        </div>
      </div>
    </div>
  );
}
