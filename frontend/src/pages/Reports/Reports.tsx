import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { PageHeader } from '../../components/ui/PageHeader';
import { LineChart, BarChart } from '../../components/charts';
import { arrayToCsv, downloadBlob } from '../../utils/export';
import api from '../../services/api';
import { formatPeriodLabel, formatShortMoney } from '../../utils/chartFormat';

interface ReportRow {
  id: number;
  period: string;
  period_label: string;
  revenue: number;
  new_members: number;
  checkin_count: number;
}

interface ReportSummary {
  current_month_revenue: number;
  current_month_members: number;
  current_month_checkins: number;
  revenue_change: number | null;
  members_change: number | null;
  checkins_change: number | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatChange = (change: number | null) => {
  if (change === null) return null;
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change}% so với tháng trước`;
};

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/reports', { params: { months: 6 } });
        setReports(data.reports || []);
        setSummary(data.summary || null);
      } catch (error) {
        console.error('Error fetching reports', error);
        setReports([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const downloadCSV = () => {
    const csv = arrayToCsv(reports, [
      'period',
      'period_label',
      'revenue',
      'new_members',
      'checkin_count',
    ]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `bao_cao_gym_${new Date().toISOString().split('T')[0]}.csv`;
    downloadBlob(filename, blob);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        badge="Analytics"
        title="Báo cáo & Phân tích"
        description="Theo dõi doanh thu, tăng trưởng hội viên và hoạt động check-in theo tháng."
        actions={
          <Button variant="export" onClick={downloadCSV} disabled={reports.length === 0}>
            Xuất CSV
          </Button>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 panel">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu tháng này</p>
            <p className="text-2xl font-black text-emerald-600 mt-2">{formatPrice(summary.current_month_revenue)}</p>
            {summary.revenue_change !== null && (
              <p className="text-xs text-slate-400 mt-1">{formatChange(summary.revenue_change)}</p>
            )}
          </Card>
          <Card className="p-5 panel">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hội viên mới</p>
            <p className="text-2xl font-black text-indigo-600 mt-2">{summary.current_month_members}</p>
            {summary.members_change !== null && (
              <p className="text-xs text-slate-400 mt-1">{formatChange(summary.members_change)}</p>
            )}
          </Card>
          <Card className="p-5 panel">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt check-in</p>
            <p className="text-2xl font-black text-violet-600 mt-2">{summary.current_month_checkins}</p>
            {summary.checkins_change !== null && (
              <p className="text-xs text-slate-400 mt-1">{formatChange(summary.checkins_change)}</p>
            )}
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 panel">
          <h3 className="text-md font-bold text-slate-800">Biểu đồ doanh thu</h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">6 tháng gần nhất</p>
          <LineChart
            data={reports.map((r) => ({
              label: formatPeriodLabel(r.period),
              value: r.revenue,
            }))}
            height={200}
            color="#10b981"
            formatValue={formatShortMoney}
            emptyMessage="Chưa có dữ liệu doanh thu"
          />
        </Card>

        <Card className="p-6 panel">
          <h3 className="text-md font-bold text-slate-800">Check-in theo tháng</h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">Số lượt check-in mỗi tháng</p>
          <BarChart
            data={reports.map((r) => ({
              label: formatPeriodLabel(r.period),
              value: r.checkin_count,
            }))}
            height={200}
            formatValue={(v) => String(v)}
            color="#8b5cf6"
            emptyMessage="Chưa có dữ liệu check-in"
          />
        </Card>
      </div>

      <Card className="p-6 panel">
        <h3 className="text-md font-bold text-slate-800 mb-4">Chi tiết theo tháng</h3>
        {reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold text-sm">
            Chưa có dữ liệu báo cáo
          </div>
        ) : (
          <Table
            columns={[
              { header: 'Tháng', accessor: (row) => row.period_label },
              {
                header: 'Doanh thu',
                accessor: (row) => (
                  <span className="font-bold text-emerald-600">{formatPrice(row.revenue)}</span>
                ),
              },
              {
                header: 'Hội viên mới',
                accessor: (row) => (
                  <span className="font-bold text-indigo-600">{row.new_members}</span>
                ),
              },
              {
                header: 'Lượt check-in',
                accessor: (row) => (
                  <span className="font-bold text-violet-600">{row.checkin_count}</span>
                ),
              },
            ]}
            data={reports}
          />
        )}
      </Card>
    </div>
  );
};

export default Reports;
