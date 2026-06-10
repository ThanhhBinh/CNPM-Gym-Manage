import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardWidget from '../components/ui/DashboardWidget';
import { PageHeader } from '../components/ui/PageHeader';
import { LineChart, BarChart, DonutChart } from '../components/charts';
import { formatPeriodLabel, formatShortMoney } from '../utils/chartFormat';

interface StatItem {
    title: string;
    value: string;
    change: string | null;
    icon: React.ReactNode;
    color: string;
    bgLight: string;
}

interface ActivityItem {
    day: string;
    date: string;
    count: number;
}

interface PopularPackageItem {
    name: string;
    users: number;
    percent: number;
}

interface TrendItem {
    label: string;
    month: string;
    revenue?: number;
    count?: number;
}

interface PaymentBreakdownItem {
    method: string;
    label: string;
    count: number;
    total: number;
}

interface RecentCheckIn {
    id: number;
    member_name: string;
    member_code: string;
    method: string;
    checked_in_at: string;
}

const PAYMENT_COLORS: Record<string, string> = {
    cash: '#f59e0b',
    transfer: '#4f46e5',
    card: '#14b8a6',
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Record<string, { value: string; change: string | null }>>({});
    const [checkinActivity, setCheckinActivity] = useState<ActivityItem[]>([]);
    const [popularPackages, setPopularPackages] = useState<PopularPackageItem[]>([]);
    const [revenueTrend, setRevenueTrend] = useState<TrendItem[]>([]);
    const [memberGrowth, setMemberGrowth] = useState<TrendItem[]>([]);
    const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdownItem[]>([]);
    const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard/stats');
            setStats(data.stats);
            setCheckinActivity(data.checkin_activity);
            setPopularPackages(data.popular_packages);
            setRevenueTrend(data.revenue_trend || []);
            setMemberGrowth(data.member_growth || []);
            setPaymentBreakdown(data.payment_breakdown || []);
            setRecentCheckIns(data.recent_checkins || []);
        } catch (error) {
            console.error('Error fetching dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        );
    }

    const todayLabel = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const statList: StatItem[] = [
        {
            title: 'Hội viên Hoạt động',
            value: stats.active_members?.value || '0',
            change: stats.active_members?.change || null,
            icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'border-indigo-100',
            bgLight: 'bg-indigo-50',
        },
        {
            title: 'Doanh thu Tháng',
            value: stats.monthly_revenue?.value || '0đ',
            change: stats.monthly_revenue?.change || null,
            icon: (
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16c1.657 0 3-.895 3-2s-1.343-2-3-2-3-.895-3-2 1.343-2 3-2m0-8V7m0 1v8m0 0v1" />
                </svg>
            ),
            color: 'border-emerald-100',
            bgLight: 'bg-emerald-50',
        },
        {
            title: 'Check-in Hôm nay',
            value: stats.today_checkins?.value || '0',
            change: stats.today_checkins?.change || null,
            icon: (
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m6 0h-6" />
                </svg>
            ),
            color: 'border-violet-100',
            bgLight: 'bg-violet-50',
        },
        {
            title: 'Gói tập sắp hết hạn',
            value: stats.expiring_packages?.value || '0',
            change: null,
            icon: (
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: 'border-amber-100',
            bgLight: 'bg-amber-50',
        },
    ];

    const paymentSegments = paymentBreakdown.map((item) => ({
        label: item.label,
        value: item.total,
        color: PAYMENT_COLORS[item.method] || '#94a3b8',
    }));

    return (
        <div className="space-y-6 font-sans">
            <PageHeader
                badge="Dashboard"
                title={`Xin chào, ${user?.name || 'Admin'}`}
                description={`Tổng quan hoạt động phòng gym — ${todayLabel}`}
                actions={
                    <>
                        <Link
                            to="/check-in"
                            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                        >
                            Check-in
                        </Link>
                        <Link
                            to="/members"
                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                        >
                            + Hội viên
                        </Link>
                    </>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statList.map((stat, i) => (
                    <DashboardWidget key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">Doanh thu 6 tháng</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Biểu đồ xu hướng doanh thu từ thanh toán</p>
                        </div>
                        <Link to="/payments" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            Chi tiết →
                        </Link>
                    </div>
                    <LineChart
                        data={revenueTrend.map((item) => ({
                            label: item.month ? formatPeriodLabel(item.month) : item.label,
                            value: item.revenue || 0,
                        }))}
                        height={200}
                        color="#10b981"
                        formatValue={formatShortMoney}
                        emptyMessage="Chưa có doanh thu trong 6 tháng qua"
                    />
                </div>

                <div className="panel p-6">
                    <h3 className="text-md font-bold text-slate-800">Phương thức thanh toán</h3>
                    <p className="text-xs text-slate-400 mt-0.5 mb-4">Tháng hiện tại</p>
                    <DonutChart
                        segments={paymentSegments}
                        formatValue={formatShortMoney}
                        emptyMessage="Chưa có giao dịch tháng này"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Check-in 7 ngày qua
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Số lượt check-in mỗi ngày</p>
                        </div>
                        <Link to="/schedule" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            Lịch tập →
                        </Link>
                    </div>
                    <BarChart
                        data={checkinActivity.map((a) => ({
                            label: a.day,
                            sublabel: a.date,
                            value: a.count,
                        }))}
                        height={200}
                        formatValue={(v) => String(v)}
                        color="#4f46e5"
                        emptyMessage="Chưa có check-in trong 7 ngày qua"
                    />
                </div>

                <div className="panel p-6">
                    <h3 className="text-md font-bold text-slate-800 mb-1">Hội viên mới</h3>
                    <p className="text-xs text-slate-400 mb-4">Đăng ký theo tháng (6 tháng)</p>
                    <BarChart
                        data={memberGrowth.map((m) => ({
                            label: m.month ? formatPeriodLabel(m.month) : m.label,
                            value: m.count || 0,
                        }))}
                        height={200}
                        formatValue={(v) => String(v)}
                        color="#8b5cf6"
                        emptyMessage="Chưa có hội viên mới"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="panel p-6">
                    <h3 className="text-md font-bold text-slate-800 mb-4">Gói tập phổ biến</h3>
                    <div className="space-y-5">
                        {popularPackages.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-8">Chưa có hội viên đăng ký gói</p>
                        ) : (
                            popularPackages.map((pkg, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-slate-700 truncate">{pkg.name}</span>
                                        <span className="text-slate-400 text-xs font-mono shrink-0">{pkg.users} HV</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.max(5, pkg.percent)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">Check-in gần đây</h3>
                            <p className="text-xs text-slate-400 mt-0.5">8 lượt check-in mới nhất</p>
                        </div>
                        <Link to="/check-in" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            Xem tất cả →
                        </Link>
                    </div>
                    {recentCheckIns.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-10">Chưa có check-in nào</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="pb-3 pr-4">Hội viên</th>
                                        <th className="pb-3 pr-4">Mã HV</th>
                                        <th className="pb-3 pr-4">Phương thức</th>
                                        <th className="pb-3 text-right">Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentCheckIns.map((checkIn) => (
                                        <tr key={checkIn.id} className="hover:bg-slate-50/50">
                                            <td className="py-3 pr-4 font-semibold text-slate-800">{checkIn.member_name}</td>
                                            <td className="py-3 pr-4 font-mono text-xs text-slate-500">{checkIn.member_code}</td>
                                            <td className="py-3 pr-4">
                                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600">
                                                    {checkIn.method === 'qr_scan' ? 'QR' : 'Thủ công'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-slate-500 font-medium">
                                                {new Date(checkIn.checked_in_at).toLocaleString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
