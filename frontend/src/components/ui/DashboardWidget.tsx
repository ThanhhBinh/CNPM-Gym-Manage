import React from 'react';
import { Card } from './Card';

export interface DashboardWidgetProps {
  title: string;
  value: string;
  change: string | null;
  icon: React.ReactNode;
  color: string; // not used directly yet, could be for border color
  bgLight: string; // background light class for icon container
}

/**
 * Reusable widget for the dashboard stat cards.
 * Wraps content in the glass‑morphism Card component and provides hover elevation.
 */
export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  change,
  icon,
  bgLight,
}) => {
  return (
    <Card className="p-6 flex flex-col justify-between panel hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{title}</span>
        <div className={`w-11 h-11 ${bgLight} rounded-2xl flex items-center justify-center shrink-0`}> {icon} </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{value}</h3>
        {change !== null ? (
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold inline-flex items-center px-2 py-0.5 rounded-full ${
              change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}> {change.startsWith('+') ? '↑' : '↓'} {change} </span>
            <span className="text-xs text-slate-400 font-medium">so với tháng trước</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Hết hạn trong vòng 7 ngày</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DashboardWidget;
