import React from 'react';

export interface BarChartPoint {
  label: string;
  sublabel?: string;
  value: number;
}

interface BarChartProps {
  data: BarChartPoint[];
  height?: number;
  color?: string;
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  color = '#4f46e5',
  formatValue = (v) => String(v),
  emptyMessage = 'Chưa có dữ liệu',
}) => {
  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-400 dark:text-slate-500 font-medium rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const labelHeight = 40;
  const chartHeight = height - labelHeight;

  return (
    <div className="w-full rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3" style={{ height }}>
      <div className="flex items-end gap-2" style={{ height: chartHeight }}>
        {data.map((item, i) => {
          const barHeight = Math.max(6, (item.value / max) * (chartHeight - 8));
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group">
              <div
                className="opacity-0 group-hover:opacity-100 mb-1 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm pointer-events-none whitespace-nowrap z-10"
              >
                {formatValue(item.value)}
              </div>
              <div
                className="w-full max-w-[48px] rounded-t-lg transition-all duration-300"
                style={{
                  height: barHeight,
                  backgroundColor: color,
                  opacity: 0.9,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-2" style={{ height: labelHeight - 8 }}>
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center min-w-0">
            <p className="text-[10px] font-bold text-slate-600 truncate capitalize">{item.label}</p>
            {item.sublabel && (
              <p className="text-[9px] text-slate-400 truncate">{item.sublabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
