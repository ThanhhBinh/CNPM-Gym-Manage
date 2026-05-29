import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

interface RecentCheckIn {
    id: number;
    checked_in_at: string;
    method: 'qr_scan' | 'manual';
    member: {
        full_name: string;
        member_code: string;
    };
    verifier?: {
        name: string;
    };
}

const CheckIn = () => {
    const [memberCode, setMemberCode] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchRecentCheckIns = async () => {
        try {
            const { data } = await api.get('/check-ins');
            setRecentCheckIns(data.data || []);
        } catch (error) {
            console.error('Error fetching recent check-ins', error);
        }
    };

    useEffect(() => {
        fetchRecentCheckIns();
        // Focus the input on mount
        inputRef.current?.focus();
    }, []);

    // Ensure input is always focused for scanner/keyboard convenience
    const keepFocus = () => {
        inputRef.current?.focus();
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberCode.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const { data } = await api.post('/check-ins/manual', { 
                member_code: memberCode.trim().toUpperCase() 
            });
            setResult({ type: 'success', data });
            setMemberCode('');
            fetchRecentCheckIns();
        } catch (error: any) {
            setResult({ 
                type: 'error', 
                message: error.response?.data?.message || 'Có lỗi xảy ra' 
            });
        } finally {
            setLoading(false);
            // Re-focus input
            inputRef.current?.focus();
        }
    };

    // Auto-clear result after 6 seconds
    useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                setResult(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [result]);

    return (
        <div className="max-w-4xl mx-auto space-y-8" onClick={keepFocus}>
            {/* Main scanner/input panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">QUÉT THẺ RA VÀO</h2>
                <p className="text-slate-500 mb-8">Vui lòng quét mã QR hoặc nhập mã hội viên và nhấn Enter</p>

                <form onSubmit={handleCheckIn} className="max-w-md mx-auto relative mb-6">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={memberCode}
                        onChange={(e) => {
                            setMemberCode(e.target.value);
                            if (result) setResult(null); // Clear result as soon as user types again
                        }}
                        placeholder="MÃ HỘI VIÊN..." 
                        className="w-full text-center text-2xl font-mono tracking-widest px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all uppercase placeholder:font-sans placeholder:text-base placeholder:tracking-normal"
                        disabled={loading}
                    />
                    
                    {loading && (
                        <div className="absolute right-4 top-4.5">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </form>

                <p className="text-slate-400 text-xs">
                    * Mẹo: Click bất cứ đâu trên màn hình để tự động tập trung con trỏ chuột vào ô quét thẻ.
                </p>

                {/* Status Result Display */}
                {result && (
                    <div className={`mt-8 p-6 rounded-2xl text-left border animate-fade-in-up ${
                        result.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                        {result.type === 'success' ? (
                            <div className="flex gap-5 items-center">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-1 text-emerald-900">CHECK-IN THÀNH CÔNG!</h3>
                                    <p className="font-semibold text-lg">{result.data.member.full_name} <span className="font-mono text-emerald-700">({result.data.member.member_code})</span></p>
                                    <p className="text-emerald-700 text-sm mt-1">
                                        Gói tập: <span className="font-bold">{result.data.package.name}</span> • Hạn dùng: <span className="font-bold">{new Date(result.data.package.end_date).toLocaleDateString('vi-VN')}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-5 items-center">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-1 text-red-900">CHECK-IN THẤT BẠI</h3>
                                    <p className="font-semibold text-md text-red-700">{result.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Check-Ins Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Hội viên vừa vào phòng tập
                </h3>
                
                <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Hội viên</th>
                                <th className="px-6 py-3">Mã số</th>
                                <th className="px-6 py-3">Thời gian</th>
                                <th className="px-6 py-3">Phương thức</th>
                                <th className="px-6 py-3">Người xác nhận</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentCheckIns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        Chưa có lượt check-in nào trong hôm nay
                                    </td>
                                </tr>
                            ) : (
                                recentCheckIns.slice(0, 8).map((ci) => (
                                    <tr key={ci.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3.5 font-semibold text-slate-800">
                                            {ci.member.full_name}
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-slate-500 text-xs">
                                            {ci.member.member_code}
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-600">
                                            {new Date(ci.checked_in_at).toLocaleTimeString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                ci.method === 'qr_scan' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                                {ci.method === 'qr_scan' ? 'Quét QR' : 'Thủ công'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-500 text-xs">
                                            {ci.verifier?.name || 'Hệ thống'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
