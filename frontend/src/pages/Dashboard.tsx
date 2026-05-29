import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface StatItem {
    title: string;
    value: string;
    change: string | null;
    icon: string;
    color: string;
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

const Dashboard = () => {
    const [stats, setStats] = useState<Record<string, { value: string; change: string | null }>>({});
    const [checkinActivity, setCheckinActivity] = useState<ActivityItem[]>([]);
    const [popularPackages, setPopularPackages] = useState<PopularPackageItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard/stats');
            setStats(data.stats);
            setCheckinActivity(data.checkin_activity);
            setPopularPackages(data.popular_packages);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const statList: StatItem[] = [
        { 
            title: 'Hội viên Hoạt động', 
            value: stats.active_members?.value || '0', 
            change: stats.active_members?.change || null, 
            icon: '👥', 
            color: 'from-blue-500 to-blue-600' 
        },
        { 
            title: 'Doanh thu Tháng', 
            value: stats.monthly_revenue?.value || '0đ', 
            change: stats.monthly_revenue?.change || null, 
            icon: '💰', 
            color: 'from-emerald-500 to-emerald-600' 
        },
        { 
            title: 'Check-in Hôm nay', 
            value: stats.today_checkins?.value || '0', 
            change: stats.today_checkins?.change || null, 
            icon: '📷', 
            color: 'from-purple-500 to-purple-600' 
        },
        { 
            title: 'Gói tập sắp hết hạn', 
            value: stats.expiring_packages?.value || '0', 
            change: null, 
            icon: '⚠️', 
            color: 'from-orange-500 to-orange-600' 
        },
    ];

    // Find the max count for rendering heights proportionally
    const maxCount = Math.max(...checkinActivity.map(c => c.count), 1);

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statList.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                            <div className="text-2xl">{stat.icon}</div>
                        </div>
                        
                        {stat.change !== null ? (
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold flex items-center gap-0.5 ${
                                    stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                    {stat.change.startsWith('+') ? '↑' : '↓'} {stat.change}
                                </span>
                                <span className="text-sm text-slate-400">so với tháng trước</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">cần gia hạn trong 7 ngày tới</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom charts & lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Checkin chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Hoạt động Check-in (7 ngày qua)
                    </h3>
                    <div className="h-64 flex items-end gap-3 px-2 flex-1">
                        {checkinActivity.map((activity, i) => {
                            const percentHeight = Math.max(5, (activity.count / maxCount) * 100);
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                    <div 
                                        className="w-full bg-blue-100 hover:bg-gradient-to-t hover:from-blue-500 hover:to-indigo-500 rounded-t-lg transition-all duration-300 relative flex justify-center" 
                                        style={{ height: `${percentHeight}%` }}
                                    >
                                        {/* Popover badge on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-9 bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-opacity shadow-md pointer-events-none whitespace-nowrap z-10">
                                            {activity.count} lượt
                                        </div>
                                    </div>
                                    <div className="text-center mt-3">
                                        <p className="text-xs font-semibold text-slate-700">{activity.day}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{activity.date}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Popular Packages */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Gói tập phổ biến</h3>
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        {popularPackages.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-12">Chưa có hội viên nào đăng ký gói tập</p>
                        ) : (
                            popularPackages.map((pkg, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-slate-700">{pkg.name}</span>
                                        <span className="text-slate-500 font-mono text-xs">{pkg.users} lượt đăng ký</span>
                                    </div>
                                    <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-[2px]">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.max(10, pkg.percent)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
