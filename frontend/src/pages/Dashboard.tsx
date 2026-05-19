import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
    // A premium dashboard with some mock stats to wow the user initially
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Hội viên Active', value: '1,240', change: '+12%', icon: '👥', color: 'from-blue-500 to-blue-600' },
                    { title: 'Doanh thu Tháng', value: '45.2M', change: '+8%', icon: '💰', color: 'from-emerald-500 to-emerald-600' },
                    { title: 'Check-in Hôm nay', value: '342', change: '+24%', icon: '📷', color: 'from-purple-500 to-purple-600' },
                    { title: 'Gói sắp hết hạn', value: '28', change: '-5%', icon: '⚠️', color: 'from-orange-500 to-orange-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                            <div className="text-2xl">{stat.icon}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.change}
                            </span>
                            <span className="text-sm text-slate-400">so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Hoạt động Check-in (Giả lập)</h3>
                    <div className="h-64 flex items-end gap-2">
                        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group">
                                <div 
                                    className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-500 transition-colors relative" 
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity">
                                        {h}
                                    </div>
                                </div>
                                <div className="text-center mt-2 text-xs text-slate-500">T{i+2}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Gói tập phổ biến</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Gym 1 Tháng', users: 450, percent: 75 },
                            { name: 'Gym 3 Tháng', users: 210, percent: 45 },
                            { name: 'Gói PT 12 Buổi', users: 85, percent: 20 },
                        ].map((pkg, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700">{pkg.name}</span>
                                    <span className="text-slate-500">{pkg.users}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pkg.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
