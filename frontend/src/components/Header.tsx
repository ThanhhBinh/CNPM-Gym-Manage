import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const Header = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Tổng quan';
        if (path.startsWith('/members')) return 'Quản lý Hội viên';
        if (path.startsWith('/packages')) return 'Quản lý Gói tập';
        if (path.startsWith('/check-in')) return 'Check-in';
        if (path.startsWith('/payments')) return 'Thanh toán & Hóa đơn';
        return 'Gym Manager';
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                </button>
            </div>
        </header>
    );
};

export default Header;
