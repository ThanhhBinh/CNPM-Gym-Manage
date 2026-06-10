import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Tổng quan';
        if (path.startsWith('/members')) return 'Quản lý Hội viên';
        if (path.startsWith('/packages')) return 'Quản lý Gói tập';
        if (path.startsWith('/check-in')) return 'Cổng Check-in';
        if (path.startsWith('/payments')) return 'Thanh toán & Hóa đơn';
        if (path.startsWith('/schedule')) return 'Lịch tập & Check-in';
        if (path.startsWith('/reports')) return 'Báo cáo & Phân tích';
        return 'Gym Active';
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 z-10">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{getPageTitle()}</h2>

            <div className="flex items-center gap-3 font-sans">
                <ThemeToggle />

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-100 dark:hover:border-rose-900 rounded-2xl transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                </button>
            </div>
        </header>
    );
};

export default Header;
