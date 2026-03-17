'use client';

import { useState, useMemo } from 'react';
import {
  floorStations,
  floorClasses,
  floorBookings,
  Station,
  FloorBooking,
  FloorClass,
} from '@/lib/data';
import {
  ChevronDown,
  X,
  Check,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  Tv,
  Users,
  CircleDot,
  ArrowRight,
} from 'lucide-react';

// Color logic per spec
function getStationColor(station: Station, booking?: FloorBooking, isSelected?: boolean) {
  if (!station.isBookable) return { fill: '#1E293B', border: '#374151', text: '#64748B' }; // decorative
  if (!booking) return { fill: '#0A0F1C', border: '#FFFFFF', text: '#FFFFFF' }; // available — white border
  if (isSelected) return { fill: '#1E3A5F', border: '#3B82F6', text: '#FFFFFF' }; // your booking

  if (booking.isFirstTimer) return { fill: '#064E3B', border: '#27AE60', text: '#27AE60' }; // first-timer green
  if (booking.source === 'staff' || booking.source === 'classpass') return { fill: '#1A1A2E', border: '#1A1A1A', text: '#9CA3AF' }; // staff/classpass dark
  if (booking.status === 'no_show') return { fill: '#3B1320', border: '#EF4444', text: '#EF4444' }; // no-show red flash
  if (booking.status === 'checked_in') return { fill: '#0C2D48', border: '#06B6D4', text: '#06B6D4' }; // checked in cyan
  return { fill: '#1C1427', border: '#C0392B', text: '#C0392B' }; // self-booked red
}

function getStatusLabel(booking?: FloorBooking) {
  if (!booking) return 'Available';
  switch (booking.status) {
    case 'checked_in': return 'Checked In';
    case 'confirmed': return 'Confirmed';
    case 'no_show': return 'No Show';
    case 'waitlisted': return 'Waitlisted';
    case 'cancelled': return 'Cancelled';
    default: return booking.status;
  }
}

function getSourceLabel(source: string) {
  switch (source) {
    case 'self': return 'Member App';
    case 'staff': return 'Staff Booked';
    case 'classpass': return 'ClassPass';
    case 'ai_chat': return 'AI Chat';
    case 'ai_voice': return 'AI Voice';
    default: return source;
  }
}

export default function FloorPlanPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>('fc-001');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const selectedClass = floorClasses.find((c) => c.id === selectedClassId)!;
  const bookings = floorBookings[selectedClassId] || [];

  const bookingMap = useMemo(() => {
    const map = new Map<string, FloorBooking>();
    bookings.forEach((b) => map.set(b.stationId, b));
    return map;
  }, [bookings]);

  const selectedStation = selectedStationId
    ? floorStations.find((s) => s.id === selectedStationId)
    : null;
  const selectedBooking = selectedStationId
    ? bookingMap.get(selectedStationId)
    : undefined;

  // Stats
  const checkedIn = bookings.filter((b) => b.status === 'checked_in').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const noShows = bookings.filter((b) => b.status === 'no_show').length;
  const firstTimers = bookings.filter((b) => b.isFirstTimer).length;
  const availableCount = 24 - bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'no_show').length;

  return (
    <div className="min-h-screen bg-gym-bg p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gym-text">Floor Plan</h1>
            <p className="text-sm text-gym-text-secondary mt-1">Undisputed Boxing Gym — 24 Heavy Bags</p>
          </div>

          {/* Class Selector */}
          <div className="relative">
            <button
              onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              className="flex items-center gap-3 bg-gym-card border border-gym-border rounded-xl px-4 py-3 min-w-[280px] hover:border-gym-primary/50 transition-colors"
            >
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gym-text">{selectedClass.name}</p>
                <p className="text-xs text-gym-text-secondary">
                  {selectedClass.time} · {selectedClass.instructor} · {selectedClass.enrolled}/{selectedClass.capacity} booked
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gym-text-muted transition-transform ${classDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {classDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gym-card border border-gym-border rounded-xl shadow-2xl z-50 overflow-hidden">
                {floorClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => { setSelectedClassId(cls.id); setClassDropdownOpen(false); setSelectedStationId(null); }}
                    className={`w-full text-left px-4 py-3 hover:bg-gym-bg/50 transition-colors border-b border-gym-border last:border-b-0 ${cls.id === selectedClassId ? 'bg-gym-primary/10' : ''}`}
                  >
                    <p className="text-sm font-medium text-gym-text">{cls.name}</p>
                    <p className="text-xs text-gym-text-secondary">{cls.time} · {cls.instructor} · {cls.enrolled}/{cls.capacity}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
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

        {/* Main Content: Floor Plan + Booking Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Floor Plan */}
          <div className="flex-1">
            <div className="bg-gym-card/50 backdrop-blur border border-gym-border rounded-2xl p-4 lg:p-6">
              {/* Zone Labels */}
              <div className="flex justify-between mb-2 px-2">
                <span className="text-xs text-gym-text-muted uppercase tracking-widest">Wall Side</span>
                <span className="text-xs text-gym-text-muted uppercase tracking-widest">Entrance →</span>
              </div>

              {/* SVG Floor Plan */}
              <div className="relative w-full" style={{ paddingBottom: '85%' }}>
                <svg
                  viewBox="0 0 1000 850"
                  className="absolute inset-0 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid lines (subtle) */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 85} x2="1000" y2={i * 85} stroke="#1E293B" strokeWidth="0.5" strokeDasharray="4 4" />
                  ))}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="850" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="4 4" />
                  ))}

                  {/* Render stations */}
                  {floorStations.map((station) => {
                    const cx = station.x * 1000;
                    const cy = station.y * 850;
                    const booking = bookingMap.get(station.id);
                    const isSelected = selectedStationId === station.id;
                    const colors = getStationColor(station, booking, isSelected);

                    if (station.type === 'tv_monitor') {
                      // TV — rectangle
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
                          <text x={cx} y={cy + 4} textAnchor="middle" fill={colors.text} fontSize="9" fontFamily="monospace">
                            TV
                          </text>
                        </g>
                      );
                    }

                    // Heavy bag — circle
                    const radius = isSelected ? 30 : 26;
                    return (
                      <g
                        key={station.id}
                        onClick={() => station.isBookable && setSelectedStationId(isSelected ? null : station.id)}
                        className={station.isBookable ? 'cursor-pointer' : ''}
                      >
                        {/* Glow ring for selected */}
                        {isSelected && (
                          <circle cx={cx} cy={cy} r={radius + 6} fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.4">
                            <animate attributeName="r" from={radius + 4} to={radius + 10} dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                          </circle>
                        )}

                        {/* No-show pulse */}
                        {booking?.status === 'no_show' && (
                          <circle cx={cx} cy={cy} r={radius + 4} fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.6">
                            <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                          </circle>
                        )}

                        {/* Main circle */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius}
                          fill={colors.fill}
                          stroke={colors.border}
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all duration-150"
                        />

                        {/* Bag number */}
                        <text
                          x={cx}
                          y={booking ? cy - 3 : cy + 5}
                          textAnchor="middle"
                          fill={colors.text}
                          fontSize={booking ? '11' : '14'}
                          fontWeight="bold"
                          fontFamily="system-ui"
                        >
                          {station.number}
                        </text>

                        {/* Member avatar initials (if booked) */}
                        {booking && (
                          <text
                            x={cx}
                            y={cy + 12}
                            textAnchor="middle"
                            fill={colors.text}
                            fontSize="9"
                            fontFamily="system-ui"
                            opacity="0.8"
                          >
                            {booking.memberAvatar}
                          </text>
                        )}

                        {/* First-timer star */}
                        {booking?.isFirstTimer && (
                          <text x={cx + 18} y={cy - 16} textAnchor="middle" fontSize="12">⭐</text>
                        )}

                        {/* Check-in dot */}
                        {booking?.status === 'checked_in' && (
                          <circle cx={cx + 20} cy={cy - 18} r={5} fill="#06B6D4" stroke="#0A0F1C" strokeWidth={1.5} />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Zone Label Bottom */}
              <div className="flex justify-between mt-2 px-2">
                <span className="text-xs text-gym-text-muted uppercase tracking-widest">Ring Side</span>
                <span className="text-xs text-gym-text-muted uppercase tracking-widest">← Back Wall</span>
              </div>

              {/* Legend */}
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
                  <span className="text-xs text-gym-text-secondary">Staff / ClassPass</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-[#EF4444] bg-[#3B1320]"></div>
                  <span className="text-xs text-gym-text-secondary">No Show</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Booking Detail or Roster */}
          <div className="w-full lg:w-[360px] flex-shrink-0 space-y-4">
            {/* Booking Detail Panel */}
            {selectedStation && (
              <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gym-text">Bag {selectedStation.number}</h3>
                  <button onClick={() => setSelectedStationId(null)} className="p-1 hover:bg-gym-bg rounded-lg">
                    <X className="w-4 h-4 text-gym-text-muted" />
                  </button>
                </div>

                {selectedBooking ? (
                  <div className="space-y-4">
                    {/* Member Info */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedBooking.isFirstTimer ? 'bg-green-500/20 text-green-400' : 'bg-gym-primary/20 text-gym-primary'
                      }`}>
                        {selectedBooking.memberAvatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gym-text">{selectedBooking.memberName}</p>
                        <div className="flex items-center gap-2">
                          {selectedBooking.isFirstTimer && (
                            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full">First Timer</span>
                          )}
                          <span className="text-xs text-gym-text-muted">{getSourceLabel(selectedBooking.source)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gym-bg/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gym-text-secondary">Status</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          selectedBooking.status === 'checked_in' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          selectedBooking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          selectedBooking.status === 'no_show' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {getStatusLabel(selectedBooking)}
                        </span>
                      </div>
                      {selectedBooking.checkedInAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gym-text-secondary">Checked in</span>
                          <span className="text-xs text-gym-text">{new Date(selectedBooking.checkedInAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gym-text-secondary">Booking source</span>
                        <span className="text-xs text-gym-text">{getSourceLabel(selectedBooking.source)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {selectedBooking.status === 'confirmed' && (
                        <button className="w-full text-sm bg-gym-accent hover:bg-gym-accent/80 text-white rounded-lg px-4 py-2.5 font-medium transition flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Check In
                        </button>
                      )}
                      <button className="w-full text-sm bg-gym-bg hover:bg-gym-border text-gym-text-secondary rounded-lg px-4 py-2.5 font-medium transition flex items-center justify-center gap-2">
                        <ArrowRight className="w-4 h-4" /> Move to Another Bag
                      </button>
                      <button className="w-full text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-4 py-2.5 font-medium transition">
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gym-bg/50 rounded-lg p-4 text-center">
                      <CircleDot className="w-8 h-8 text-gym-text-muted mx-auto mb-2" />
                      <p className="text-sm text-gym-text-secondary">This bag is available</p>
                    </div>
                    <button className="w-full text-sm bg-gym-primary hover:bg-gym-primary/80 text-white rounded-lg px-4 py-2.5 font-medium transition flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" /> Book This Spot
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Coach Roster */}
            <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gym-text">Class Roster</h3>
                <span className="text-xs bg-gym-primary/20 text-gym-primary px-2 py-1 rounded-full font-medium">
                  {bookings.length} / {selectedClass.capacity}
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gym-text-muted mx-auto mb-2" />
                  <p className="text-sm text-gym-text-secondary">No bookings for this class yet</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {bookings
                    .sort((a, b) => {
                      const stA = floorStations.find((s) => s.id === a.stationId);
                      const stB = floorStations.find((s) => s.id === b.stationId);
                      return (stA?.number || 0) - (stB?.number || 0);
                    })
                    .map((booking) => {
                      const station = floorStations.find((s) => s.id === booking.stationId);
                      return (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedStationId(booking.stationId)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                            selectedStationId === booking.stationId ? 'bg-gym-primary/10 border border-gym-primary/30' : 'hover:bg-gym-bg/50'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            booking.isFirstTimer ? 'bg-green-500/20 text-green-400' :
                            booking.status === 'checked_in' ? 'bg-cyan-500/20 text-cyan-400' :
                            booking.status === 'no_show' ? 'bg-red-500/20 text-red-400' :
                            'bg-gym-bg text-gym-text-secondary'
                          }`}>
                            {booking.memberAvatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gym-text truncate">{booking.memberName}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gym-text-muted">Bag {station?.number}</span>
                            {booking.status === 'checked_in' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                            {booking.status === 'no_show' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                            {booking.isFirstTimer && <span className="text-[10px]">⭐</span>}
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Waitlist */}
              {selectedClass.waitlist > 0 && (
                <div className="mt-4 pt-3 border-t border-gym-border">
                  <p className="text-xs text-gym-text-muted mb-2">Waitlist ({selectedClass.waitlist})</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gym-warning" />
                    <span className="text-xs text-gym-text-secondary">{selectedClass.waitlist} member{selectedClass.waitlist > 1 ? 's' : ''} waiting</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
