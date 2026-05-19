import React, { useState } from 'react';
import api from '../../services/api';

const CheckIn = () => {
    const [memberCode, setMemberCode] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleManualCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const { data } = await api.post('/check-ins/manual', { member_code: memberCode });
            setResult({ type: 'success', data });
            setMemberCode('');
        } catch (error: any) {
            setResult({ 
                type: 'error', 
                message: error.response?.data?.message || 'Có lỗi xảy ra' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Check-in Hội viên</h2>
                <p className="text-slate-500 mb-8">Quét mã QR hoặc nhập mã hội viên thủ công</p>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50">
                        <div className="w-48 h-48 bg-slate-200 rounded-xl mb-4 flex items-center justify-center">
                            <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <button className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors">
                            Bật Camera
                        </button>
                    </div>

                    <div className="flex flex-col justify-center">
                        <form onSubmit={handleManualCheckIn} className="space-y-4">
                            <div>
                                <label className="block text-left text-sm font-medium text-slate-700 mb-2">Nhập mã Hội viên thủ công</label>
                                <input 
                                    type="text" 
                                    value={memberCode}
                                    onChange={(e) => setMemberCode(e.target.value)}
                                    placeholder="Vd: GYM-ABCDEF" 
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-md"
                            >
                                {loading ? 'Đang kiểm tra...' : 'Xác nhận Check-in'}
                            </button>
                        </form>
                    </div>
                </div>

                {result && (
                    <div className={`mt-8 p-6 rounded-2xl text-left border ${result.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        {result.type === 'success' ? (
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-emerald-800 mb-1">Check-in Thành công!</h3>
                                    <p className="text-emerald-600 font-medium">{result.data.member.full_name} ({result.data.member.member_code})</p>
                                    <p className="text-emerald-600 text-sm mt-1">Gói: {result.data.package.name} - HSD: {new Date(result.data.package.end_date).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-red-800 mb-1">Check-in Thất bại</h3>
                                    <p className="text-red-600">{result.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckIn;
