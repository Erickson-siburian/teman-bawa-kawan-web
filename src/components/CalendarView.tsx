import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Download,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { Task, TeamMember } from '../types';
import { createGoogleCalendarUrl, downloadIcsCalendar } from '../lib/calendarExport';

interface CalendarViewProps {
  tasks: Task[];
  currentUser: TeamMember;
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, currentUser, onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[] | null>(null);
  const [filterMyTasksOnly, setFilterMyTasksOnly] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayTasks(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayTasks(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDayTasks(null);
  };

  // Month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const filteredTasks = filterMyTasksOnly
    ? tasks.filter((t) => t.assigneeId === currentUser.id || t.buddyId === currentUser.id)
    : tasks;

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = filteredTasks.reduce<Record<string, Task[]>>((acc, t) => {
    const dStr = new Date(t.dueDate).toISOString().slice(0, 10);
    if (!acc[dStr]) acc[dStr] = [];
    acc[dStr].push(t);
    return acc;
  }, {});

  // Build calendar matrix
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      isCurrentMonth: true,
      dateString,
      isToday: new Date().toISOString().slice(0, 10) === dateString,
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const dateString = `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateString,
    });
  }

  return (
    <div className="space-y-6">
      {/* Calendar Top Controls & Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-slate-500">
                Jadwal tugas & deadline kolaborasi Teman Bawa Kawan
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterMyTasksOnly(!filterMyTasksOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterMyTasksOnly
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterMyTasksOnly ? '✓ Hanya Tugas Saya & Kawan' : 'Tampilkan Semua Tugas'}
          </button>

          <button
            onClick={() => downloadIcsCalendar(filteredTasks, `jadwal-tbk-${monthNames[month]}-${year}.ics`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download iCal (.ics)
          </button>

          {/* Month Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-2.5">
          <span>Minggu</span>
          <span>Senin</span>
          <span>Selasa</span>
          <span>Rabu</span>
          <span>Kamis</span>
          <span>Jumat</span>
          <span>Sabtu</span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarCells.map((cell, idx) => {
            const dayTasks = tasksByDate[cell.dateString] || [];
            const isSelected = selectedDayTasks && selectedDayTasks.length > 0 && selectedDayTasks[0] && cell.dateString === new Date(selectedDayTasks[0].dueDate).toISOString().slice(0, 10);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (dayTasks.length > 0) {
                    setSelectedDayTasks(dayTasks);
                  }
                }}
                className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth ? 'bg-white hover:bg-indigo-50/20' : 'bg-slate-50/50 text-slate-300'
                } ${cell.isToday ? 'ring-2 ring-inset ring-indigo-500/60' : ''} ${
                  dayTasks.length > 0 ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {dayTasks.length} tugas
                    </span>
                  )}
                </div>

                {/* Task Pills */}
                <div className="space-y-1 mt-1">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(t);
                      }}
                      className={`px-1.5 py-1 rounded-md text-[10px] font-medium truncate flex items-center gap-1 shadow-2xs border ${
                        t.status === 'done'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : t.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}
                      title={t.title}
                    >
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}

                  {dayTasks.length > 2 && (
                    <span className="text-[10px] text-slate-400 block text-right font-medium">
                      +{dayTasks.length - 2} lainnya
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task Detail Drawer */}
      {selectedDayTasks && selectedDayTasks.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Tugas pada {new Date(selectedDayTasks[0].dueDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}:
            </h3>
            <button
              onClick={() => setSelectedDayTasks(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize text-[10px] font-bold text-slate-500">{task.category}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      task.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 line-clamp-1">{task.title}</h4>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>PJ: {task.assigneeName.split(' ')[0]}</span>
                  {task.buddyName && (
                    <span className="text-amber-700 font-bold">🤝 {task.buddyName.split(' ')[0]}</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <a
                    href={createGoogleCalendarUrl(task)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    Google Cal <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
