import React from 'react';
import ReactCalendar, { CalendarTileProperties, OnArgs } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

const toLocalDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface CalendarProps {
  /** Dates with check-in activity (YYYY-MM-DD) */
  events?: string[];
  /** Check-in count per date */
  eventCounts?: Record<string, number>;
  /** Selected date */
  value?: Date;
  /** Called when user picks a date */
  onChange?: (date: Date) => void;
  /** Called when user navigates to another month */
  onActiveStartDateChange?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  eventCounts = {},
  value,
  onChange,
  onActiveStartDateChange,
}) => {
  const tileClassName = ({ date, view }: CalendarTileProperties) => {
    if (view === 'month') {
      const iso = toLocalDateString(date);
      if (events.includes(iso)) {
        return 'event-day';
      }
    }
    return null;
  };

  const tileContent = ({ date, view }: CalendarTileProperties) => {
    if (view !== 'month') return null;
    const iso = toLocalDateString(date);
    const count = eventCounts[iso];
    if (!count) return null;
    return <span className="event-count">{count}</span>;
  };

  const handleChange = (value: Date | [Date, Date] | null, _event: React.MouseEvent<HTMLButtonElement>) => {
    if (value instanceof Date && onChange) {
      onChange(value);
    }
  };

  const handleActiveStartDateChange = ({ activeStartDate }: OnArgs) => {
    if (activeStartDate && onActiveStartDateChange) {
      onActiveStartDateChange(activeStartDate);
    }
  };

  return (
    <div className="custom-calendar">
      <ReactCalendar
        calendarType="iso8601"
        prevLabel="‹"
        nextLabel="›"
        value={value}
        onChange={handleChange}
        onActiveStartDateChange={handleActiveStartDateChange}
        tileClassName={tileClassName}
        tileContent={tileContent}
      />
    </div>
  );
};

export default Calendar;
