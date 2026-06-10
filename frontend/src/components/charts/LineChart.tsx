import React, { useId } from 'react';

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  height?: number;
  color?: string;
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 180,
  color = '#4f46e5',
  formatValue = (v) => String(v),
  emptyMessage = 'Chưa có dữ liệu',
}) => {
  const gradientId = useId().replace(/:/g, '');

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

  const svgWidth = 360;
  const svgHeight = height;
  const padding = { top: 24, right: 16, bottom: 16, left: 16 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartHeight - (d.value / max) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const gridLines = [0, 0.5, 1].map((ratio) => {
    const y = padding.top + chartHeight * (1 - ratio);
    const value = Math.round(max * ratio);
    return { y, value };
  });

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-2" style={{ height }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Biểu đồ đường"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={line.y}
                x2={svgWidth - padding.right}
                y2={line.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={4} y={line.y + 4} fill="#94a3b8" fontSize="9" fontWeight="600">
                {formatValue(line.value)}
              </text>
            </g>
          ))}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2" />
          ))}
        </svg>
      </div>

      <div className="flex justify-between gap-1 mt-3 px-1">
        {data.map((d, i) => (
          <div key={i} className="text-center flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-600 truncate capitalize">{d.label}</p>
            <p className="text-[10px] text-slate-400 font-semibold truncate">{formatValue(d.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
