import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import { LogOut, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CalendarScreenProps {
  onDateSelect: (date: string) => void;
  onSignOut: () => void;
  userEmail: string;
}

export default function CalendarScreen({ onDateSelect, onSignOut, userEmail }: CalendarScreenProps) {
  const [entryDates, setEntryDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntryDates();
  }, []);

  const fetchEntryDates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('date');
    if (!error && data) {
      setEntryDates(data.map((row) => row.date as string));
    }
    setLoading(false);
  };

  const handleDateClick = (arg: DateClickArg) => {
    onDateSelect(arg.dateStr);
  };

  const events = entryDates.map((date) => ({
    date,
    title: '',
    display: 'background' as const,
    backgroundColor: 'transparent',
    classNames: ['entry-dot-event'],
  }));

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
            <Leaf className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-bold text-stone-800 text-lg">자존감 다이어리</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500 hidden sm:block">{userEmail}</span>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* Calendar */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-stone-800">나의 기록</h2>
          <p className="text-stone-500 text-sm mt-1">날짜를 클릭해 오늘의 잘한 일을 기록해보세요</p>
        </div>

        <div className="bg-white rounded-3xl shadow-soft p-4 sm:p-6 calendar-wrapper">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ko"
              height="auto"
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{
                left: 'prev',
                center: 'title',
                right: 'next',
              }}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('en-CA');
                const hasEntry = entryDates.includes(dateStr);
                return (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-sm ${arg.isToday ? 'font-bold text-green-600' : 'text-stone-700'}`}>
                      {arg.dayNumberText.replace('일', '')}
                    </span>
                    {hasEntry && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </div>
                );
              }}
              eventContent={() => null}
              dayHeaderContent={(arg) => {
                const days = ['일', '월', '화', '수', '목', '금', '토'];
                return <span className="text-xs font-medium text-stone-500">{days[arg.date.getDay()]}</span>;
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 px-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-stone-500">기록이 있는 날짜</span>
        </div>
      </main>
    </div>
  );
}
