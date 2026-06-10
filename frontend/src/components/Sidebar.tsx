import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    const menuItems = [
        { name: 'Tổng quan', path: '/', icon: '📊', roles: ['admin', 'receptionist'] },
        { name: 'Hội viên', path: '/members', icon: '👥', roles: ['admin', 'receptionist'] },
        { name: 'Check-in', path: '/check-in', icon: '📷', roles: ['admin', 'receptionist'] },
        { name: 'Thanh toán', path: '/payments', icon: '💳', roles: ['admin', 'receptionist'] },
        { name: 'Gói tập', path: '/packages', icon: '📦', roles: ['admin'] },
        { name: 'Lịch tập', path: '/schedule', icon: '📅', roles: ['admin', 'receptionist'] },
        { name: 'Báo cáo', path: '/reports', icon: '📈', roles: ['admin'] },
    ];

    return (
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex flex-col transition-all duration-300">
            <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Gym Manager</span>
            </div>

            <div className="p-4 flex-1">
                <div className="space-y-1.5">
                    {menuItems.filter(item => user?.role && item.roles.includes(user.role)).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                                    isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shadow-sm'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 dark:text-slate-400 border border-transparent'
                                }`
                            }
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20 text-sm tracking-wide">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</div>
                        <div className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 capitalize">
                            {user?.role === 'admin' ? 'Quản trị viên' : 'Lễ tân'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
