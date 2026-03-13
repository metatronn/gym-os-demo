'use client';

import { useState } from 'react';
import { tasks } from '@/lib/data';
import {
  Plus, Calendar, User, AlertCircle, CheckCircle2,
  Circle, Clock, Filter
} from 'lucide-react';

type TaskStatus = 'todo' | 'in-progress' | 'done';

const columnConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'todo': { label: 'To Do', color: 'border-t-blue-500', icon: <Circle className="w-4 h-4 text-blue-400" /> },
  'in-progress': { label: 'In Progress', color: 'border-t-yellow-500', icon: <Clock className="w-4 h-4 text-yellow-400" /> },
  'done': { label: 'Done', color: 'border-t-green-500', icon: <CheckCircle2 className="w-4 h-4 text-green-400" /> },
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-green-500/20 text-green-400',
};

const categoryColors: Record<string, string> = {
  'follow-up': 'bg-blue-500/10 text-blue-400',
  billing: 'bg-orange-500/10 text-orange-400',
  operations: 'bg-purple-500/10 text-purple-400',
  coaching: 'bg-cyan-500/10 text-cyan-400',
};

export default function TasksPage() {
  const [view, setView] = useState<'board' | 'list'>('board');

  const columns: TaskStatus[] = ['todo', 'in-progress', 'done'];

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">Tasks</h1>
          <p className="text-gym-text-muted text-sm mt-1">
            {tasks.filter(t => t.status !== 'done').length} open &middot; {tasks.filter(t => t.priority === 'high' && t.status !== 'done').length} high priority
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
            <button onClick={() => setView('board')} className={`px-3 py-2 text-xs font-medium ${view === 'board' ? 'bg-gym-primary text-white' : 'text-gym-text-secondary'}`}>Board</button>
            <button onClick={() => setView('list')} className={`px-3 py-2 text-xs font-medium ${view === 'list' ? 'bg-gym-primary text-white' : 'text-gym-text-secondary'}`}>List</button>
          </div>
          <button className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {view === 'board' ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {columns.map(status => {
            const config = columnConfig[status];
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className={`bg-gym-card/50 border border-gym-border rounded-xl border-t-2 ${config.color}`}>
                <div className="p-3 flex items-center justify-between border-b border-gym-border">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="text-sm font-medium text-gym-text">{config.label}</span>
                    <span className="text-xs text-gym-text-muted bg-gym-bg px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {columnTasks.map(task => (
                    <div key={task.id} className="p-3 bg-gym-card border border-gym-border rounded-lg hover:border-gym-primary/50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gym-text leading-tight pr-2">{task.title}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize ${priorityColors[task.priority]}`}>{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${categoryColors[task.category]}`}>{task.category}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gym-border/50">
                        <div className="flex items-center gap-1 text-[10px] text-gym-text-muted">
                          <User className="w-3 h-3" />
                          <span>{task.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gym-text-muted">
                          <Calendar className="w-3 h-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="p-6 text-center text-xs text-gym-text-muted border border-dashed border-gym-border rounded-lg">No tasks</div>
                  )}
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
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Task</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Priority</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Category</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Assigned</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Due</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer">
                  <td className="p-3 text-sm font-medium text-gym-text">{task.title}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${priorityColors[task.priority]}`}>{task.priority}</span></td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded capitalize ${categoryColors[task.category]}`}>{task.category}</span></td>
                  <td className="p-3 text-xs text-gym-text-secondary">{task.assignedTo}</td>
                  <td className="p-3 text-xs text-gym-text-muted">{task.dueDate}</td>
                  <td className="p-3"><div className="flex items-center gap-1.5">{columnConfig[task.status].icon}<span className="text-xs text-gym-text-secondary capitalize">{task.status}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
