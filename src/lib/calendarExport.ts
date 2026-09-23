import { Task } from '../types';

function formatDateToIcs(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatDateToGoogle(dateStr: string): string {
  const d = new Date(dateStr);
  // Default duration 1 hour for deadline
  const start = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endD = new Date(d.getTime() + 3600000);
  const end = endD.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `${start}/${end}`;
}

// Generate RFC 5545 iCalendar format text
export function generateIcsContent(tasks: Task[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TBK Teman Bawa Kawan//Task Management System//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:TBK Tim Tasks & Deadlines',
  ];

  tasks.forEach((t) => {
    const dtstamp = formatDateToIcs(new Date().toISOString());
    const dtstart = formatDateToIcs(t.dueDate);
    const dtend = formatDateToIcs(new Date(new Date(t.dueDate).getTime() + 3600000).toISOString());

    const description = `Prioritas: ${t.priority.toUpperCase()}\\nPenanggung Jawab: ${t.assigneeName}${
      t.buddyName ? `\\nKawan Pendamping: ${t.buddyName}` : ''
    }\\nStatus: ${t.status.toUpperCase()}\\nKategori: ${t.category}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:tbk-${t.id}@tbktaskmanager.id`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:[TBK] ${t.title}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`STATUS:${t.status === 'done' ? 'COMPLETED' : 'CONFIRMED'}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Trigger client download of .ics file
export function downloadIcsCalendar(tasks: Task[], filename = 'tbk-jadwal-tugas.ics') {
  const icsText = generateIcsContent(tasks);
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate Google Calendar Web Intent Link
export function createGoogleCalendarUrl(task: Task): string {
  const title = encodeURIComponent(`[TBK] ${task.title}`);
  const dates = formatDateToGoogle(task.dueDate);
  const details = encodeURIComponent(
    `Tugas TBK: ${task.title}\n` +
      `Prioritas: ${task.priority.toUpperCase()}\n` +
      `Penanggung Jawab: ${task.assigneeName}\n` +
      (task.buddyName ? `Kawan Pendamping: ${task.buddyName}\n` : '') +
      `Kategori: ${task.category}\n` +
      `Status: ${task.status}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}
