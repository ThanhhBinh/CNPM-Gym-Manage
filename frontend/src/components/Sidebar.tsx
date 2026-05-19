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
    ];

    return (
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Gym Manager</span>
            </div>
            
            <div className="p-4 flex-1">
                <div className="space-y-1">
                    {menuItems.filter(item => user?.role && item.roles.includes(user.role)).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                        : 'hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
