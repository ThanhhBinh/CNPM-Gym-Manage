import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 160,
  formatValue = (v) => String(v),
  emptyMessage = 'Chưa có dữ liệu',
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (!segments.length || total === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-400 font-medium" style={{ height: size }}>
        {emptyMessage}
      </div>
    );
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const arcs = segments.map((segment) => {
    const percent = segment.value / total;
    const dash = percent * circumference;
    const arc = { ...segment, dash, offset, percent };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth="12"
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-800">{formatValue(total)}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Tổng</span>
        </div>
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
              <span className="text-sm font-semibold text-slate-700 truncate">{arc.label}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-slate-800">{formatValue(arc.value)}</span>
              <span className="text-[10px] text-slate-400 ml-1">({Math.round(arc.percent * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
