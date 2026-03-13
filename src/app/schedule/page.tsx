'use client';

import { useState } from 'react';
import { classes } from '@/lib/data';
import { Clock, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const typeColors: Record<string, string> = {
  boxing: 'bg-red-500/20 text-red-400 border-red-500/30',
  kickboxing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  conditioning: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  fundamentals: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const [view, setView] = useState<'week' | 'list'>('week');

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">Class Schedule</h1>
          <p className="text-gym-text-muted text-sm mt-1">{classes.length} classes this week &middot; {classes.reduce((a, c) => a + c.enrolled, 0)} total enrolled</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
            <button onClick={() => setView('week')} className={`px-3 py-2 text-xs font-medium ${view === 'week' ? 'bg-gym-primary text-white' : 'text-gym-text-secondary'}`}>Week</button>
            <button onClick={() => setView('list')} className={`px-3 py-2 text-xs font-medium ${view === 'list' ? 'bg-gym-primary text-white' : 'text-gym-text-secondary'}`}>List</button>
          </div>
          <button className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>
      </div>

      {/* Week Nav */}
      <div className="flex items-center justify-between mb-6 bg-gym-card border border-gym-border rounded-xl p-3">
        <button className="p-1 hover:bg-gym-bg rounded"><ChevronLeft className="w-5 h-5 text-gym-text-muted" /></button>
        <span className="text-sm font-medium text-gym-text">March 10 - 16, 2026</span>
        <button className="p-1 hover:bg-gym-bg rounded"><ChevronRight className="w-5 h-5 text-gym-text-muted" /></button>
      </div>

      {view === 'week' ? (
        /* Week Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {days.map(day => {
            const dayClasses = classes.filter(c => c.dayOfWeek === day);
            const isToday = day === 'Thursday'; // fake "today"
            return (
              <div key={day} className="min-h-[300px]">
                <div className={`text-center mb-3 pb-2 border-b ${isToday ? 'border-gym-primary' : 'border-gym-border'}`}>
                  <p className={`text-xs font-medium ${isToday ? 'text-gym-primary' : 'text-gym-text-muted'}`}>{day.slice(0, 3).toUpperCase()}</p>
                </div>
                <div className="space-y-2">
                  {dayClasses.map(cls => {
                    const fill = Math.round((cls.enrolled / cls.capacity) * 100);
                    return (
                      <div key={cls.id} className={`p-2.5 rounded-lg border ${typeColors[cls.type]} cursor-pointer hover:opacity-80 transition-opacity`}>
                        <p className="text-xs font-semibold mb-1 leading-tight">{cls.name}</p>
                        <div className="flex items-center gap-1 text-[10px] opacity-80 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{cls.time}</span>
                          <span>&middot;</span>
                          <span>{cls.duration}m</span>
                        </div>
                        <p className="text-[10px] opacity-70 mb-2">{cls.instructor}</p>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 opacity-70" />
                          <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${fill >= 90 ? 'bg-red-400' : fill >= 70 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${fill}%` }} />
                          </div>
                          <span className="text-[10px] opacity-70">{cls.enrolled}/{cls.capacity}</span>
                        </div>
                        {cls.waitlist > 0 && <p className="text-[10px] text-yellow-300 mt-1">{cls.waitlist} waitlisted</p>}
                      </div>
                    );
                  })}
                  {dayClasses.length === 0 && <p className="text-xs text-gym-text-muted text-center pt-8">No classes</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gym-border">
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Class</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Day</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Time</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Instructor</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Capacity</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Type</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => {
                const fill = Math.round((cls.enrolled / cls.capacity) * 100);
                return (
                  <tr key={cls.id} className="border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer">
                    <td className="p-3 text-sm font-medium text-gym-text">{cls.name}</td>
                    <td className="p-3 text-sm text-gym-text-secondary">{cls.dayOfWeek}</td>
                    <td className="p-3 text-sm text-gym-text-secondary">{cls.time} ({cls.duration}m)</td>
                    <td className="p-3 text-sm text-gym-text-secondary">{cls.instructor}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gym-bg rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${fill >= 90 ? 'bg-red-400' : fill >= 70 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${fill}%` }} />
                        </div>
                        <span className="text-xs text-gym-text-muted">{cls.enrolled}/{cls.capacity}</span>
                      </div>
                    </td>
                    <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full capitalize border ${typeColors[cls.type]}`}>{cls.type}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
