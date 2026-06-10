import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from '../../components/ui/Calendar';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

interface CalendarDate {
  date: string;
  count: number;
}

interface DayCheckIn {
  id: number;
  checked_in_at: string;
  method: 'qr_scan' | 'manual';
  member: {
    full_name: string;
    member_code: string;
  };
  verifier?: {
    name: string;
  };
}

const toLocalDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toMonthString = (date: Date): string => toLocalDateString(date).slice(0, 7);

export const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeMonth, setActiveMonth] = useState<Date>(new Date());
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [dayCheckIns, setDayCheckIns] = useState<DayCheckIn[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);

  const eventCounts = calendarDates.reduce<Record<string, number>>((acc, item) => {
    acc[item.date] = item.count;
    return acc;
  }, {});

  const eventDates = calendarDates.map((item) => item.date);

  const fetchCalendar = useCallback(async (month: Date) => {
    setLoadingCalendar(true);
    try {
      const { data } = await api.get('/check-ins/calendar', {
        params: { month: toMonthString(month) },
      });
      setCalendarDates(data.dates || []);
      setMonthTotal(data.total_checkins || 0);
    } catch (error) {
      console.error('Error fetching calendar data', error);
      setCalendarDates([]);
      setMonthTotal(0);
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  const fetchDayCheckIns = useCallback(async (date: Date) => {
    setLoadingDay(true);
    try {
      const { data } = await api.get('/check-ins', {
        params: { date: toLocalDateString(date), per_page: 50 },
      });
      setDayCheckIns(data.data || []);
    } catch (error) {
      console.error('Error fetching day check-ins', error);
      setDayCheckIns([]);
    } finally {
      setLoadingDay(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar(activeMonth);
  }, [activeMonth, fetchCalendar]);

  useEffect(() => {
    fetchDayCheckIns(selectedDate);
  }, [selectedDate, fetchDayCheckIns]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const selectedLabel = selectedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="max-w-5xl mx-auto p-6 space-y-6 font-sans !bg-white border border-slate-100 shadow-sm rounded-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lịch tập & Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi hoạt động check-in theo ngày. Ngày có đánh dấu là ngày có hội viên tập.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Lịch tháng</h2>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {monthTotal} lượt trong tháng
            </span>
          </div>
          {loadingCalendar ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <Calendar
              value={selectedDate}
              events={eventDates}
              eventCounts={eventCounts}
              onChange={setSelectedDate}
              onActiveStartDateChange={setActiveMonth}
            />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Chi tiết ngày</h2>
            <p className="text-sm text-slate-500 mt-1">{selectedLabel}</p>
          </div>

          {loadingDay ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : dayCheckIns.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm font-semibold text-slate-500">Chưa có check-in trong ngày này</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {dayCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{checkIn.member.full_name}</p>
                    <p className="text-xs text-slate-400 font-mono">{checkIn.member.member_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{formatTime(checkIn.checked_in_at)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      {checkIn.method === 'qr_scan' ? 'Quét QR' : 'Thủ công'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Schedule;
