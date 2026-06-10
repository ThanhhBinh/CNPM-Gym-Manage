import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '../../components/ui/Card';

interface RecentCheckIn {
    id: number;
    checked_in_at: string;
    method: 'qr_scan' | 'manual' | 'face_id';
    member: {
        full_name: string;
        member_code: string;
    };
    verifier?: {
        name: string;
    };
}

const CheckIn = () => {
    const [activeTab, setActiveTab] = useState<'manual' | 'qr'>('manual');
    const [memberCode, setMemberCode] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
    
    // Scanner states
    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [scannerActive, setScannerActive] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const qrRegionId = "qr-reader-container";
    const qrScannerRef = useRef<Html5Qrcode | null>(null);

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
        if (activeTab === 'manual') {
            inputRef.current?.focus();
        }
        
        // Cleanup on tab switch or unmount
        return () => {
            stopQrScanner();
        };
    }, [activeTab]);

    const keepFocus = () => {
        if (activeTab === 'manual') {
            inputRef.current?.focus();
        }
    };

    // --- QR SCANNER LOGIC ---
    const startQrScanner = async () => {
        setResult(null);
        try {
            // Check camera permission first
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                setCameraPermission(true);
                const html5QrCode = new Html5Qrcode(qrRegionId);
                qrScannerRef.current = html5QrCode;
                setScannerActive(true);

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        // On scan success
                        handleCodeSubmit(decodedText, 'qr_scan');
                        stopQrScanner();
                    },
                    (errorMessage) => {
                        // ignore scan errors (they fire constantly when no QR is found)
                    }
                );
            } else {
                setCameraPermission(false);
            }
        } catch (err) {
            console.error("Failed to start QR Scanner:", err);
            setCameraPermission(false);
            setScannerActive(false);
        }
    };

    const stopQrScanner = async () => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
            try {
                await qrScannerRef.current.stop();
            } catch (err) {
                console.error("Failed to stop QR scanner:", err);
            }
        }
        qrScannerRef.current = null;
        setScannerActive(false);
    };

    // --- MANUAL / QR SUBMIT LOGIC ---
    const isQrToken = (code: string) => code.trim().startsWith('eyJ');

    const handleCodeSubmit = async (code: string, method: 'qr_scan' | 'manual' = 'manual') => {
        if (!code.trim()) return;

        setLoading(true);
        setResult(null);

        const trimmedCode = code.trim();
        const useQrScan = method === 'qr_scan' || isQrToken(trimmedCode);

        try {
            const { data } = useQrScan
                ? await api.post('/check-ins/scan', { token: trimmedCode })
                : await api.post('/check-ins/manual', { member_code: trimmedCode.toUpperCase() });
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
            inputRef.current?.focus();
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCodeSubmit(memberCode, 'manual');
    };

    // Auto-clear result alert
    useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                setResult(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [result]);

    return (
        <Card className="max-w-4xl mx-auto space-y-6 font-sans" onClick={keepFocus}>
            {/* Action tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex gap-2">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                        activeTab === 'manual' 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                    ⌨️ Nhập thủ công
                </button>
                <button
                    onClick={() => {
                        setActiveTab('qr');
                        setTimeout(startQrScanner, 100);
                    }}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                        activeTab === 'qr' 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                    📷 Quét Camera QR
                </button>

            </div>

            {/* Check-In Panel */}
            <Card className="rounded-3xl border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden">
                {/* Accent top line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>

                {/* MANUAL TAB CONTENT */}
                {activeTab === 'manual' && (
                    <div className="max-w-md mx-auto space-y-4">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Quét hoặc Nhập mã</h2>
                        <p className="text-xs text-slate-400 font-medium">Đặt con trỏ vào ô nhập và quét thẻ hoặc nhập trực tiếp mã hội viên</p>
                        
                        <form onSubmit={handleManualSubmit} className="relative">
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={memberCode}
                                onChange={(e) => {
                                    setMemberCode(e.target.value);
                                    if (result) setResult(null);
                                }}
                                placeholder="MÃ HỘI VIÊN..." 
                                className="w-full text-center text-xl font-bold tracking-widest px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all uppercase placeholder:font-semibold placeholder:text-sm placeholder:tracking-normal"
                                disabled={loading}
                            />
                            
                            {loading && (
                                <div className="absolute right-4 top-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                </div>
                            )}
                        </form>
                        <p className="text-[10px] text-slate-400 font-medium">* Click bất kỳ nơi nào để tự động focus con trỏ vào ô nhập</p>
                    </div>
                )}

                {/* QR SCANNER TAB CONTENT */}
                {activeTab === 'qr' && (
                    <div className="max-w-md mx-auto space-y-4">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Đặt thẻ trước Camera</h2>
                        <p className="text-xs text-slate-400 font-medium">Cấp quyền camera để ứng dụng tiến hành đọc mã QR tự động</p>
                        
                        <div className="relative w-full max-w-[320px] h-[320px] mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                            <div id={qrRegionId} className="w-full h-full object-cover"></div>
                            
                            {/* Futuristic scan target overlay */}
                            {scannerActive && (
                                <div className="absolute inset-0 border-2 border-indigo-500/20 pointer-events-none flex items-center justify-center">
                                    <div className="w-56 h-56 border border-emerald-500 rounded-xl relative">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>
                                        {/* Scan beam */}
                                        <div className="absolute w-full h-[1px] bg-emerald-500 animate-scan"></div>
                                    </div>
                                </div>
                            )}
                            
                            {!scannerActive && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-900 text-white gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    <span className="text-xs font-semibold text-slate-400">Đang khởi tạo camera...</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={startQrScanner} 
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                            >
                                Thử lại
                            </button>
                            <button 
                                onClick={stopQrScanner} 
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                            >
                                Tắt Camera
                            </button>
                        </div>
                    </div>
                )}

                {/* FACE ID TAB CONTENT */}


                {/* Status Result Display */}
                {result && (
                    <div className={`mt-8 p-6 rounded-2xl text-left border animate-fade-in-up ${
                        result.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                        {result.type === 'success' ? (
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-md font-extrabold mb-0.5 text-emerald-900">CHECK-IN THÀNH CÔNG!</h3>
                                    <p className="font-bold text-sm text-slate-800">{result.data.member.full_name} <span className="font-mono text-emerald-700 text-xs">({result.data.member.member_code})</span></p>
                                    <p className="text-emerald-700 text-xs mt-1">
                                        Gói tập: <span className="font-bold">{result.data.package.name}</span> • Hạn dùng: <span className="font-bold">{new Date(result.data.package.end_date).toLocaleDateString('vi-VN')}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-md font-extrabold mb-0.5 text-rose-900">CHECK-IN THẤT BẠI</h3>
                                    <p className="font-bold text-xs text-rose-750">{result.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Recent Check-Ins Table */}
            <Card className="rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Hội viên vào phòng hôm nay
                </h3>
                
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">Hội viên</th>
                                <th className="px-6 py-3.5">Mã số</th>
                                <th className="px-6 py-3.5">Thời gian</th>
                                <th className="px-6 py-3.5">Phương thức</th>
                                <th className="px-6 py-3.5">Người xác nhận</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentCheckIns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">
                                        Chưa có lượt check-in nào trong hôm nay
                                    </td>
                                </tr>
                            ) : (
                                recentCheckIns.slice(0, 8).map((ci) => (
                                    <tr key={ci.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-3.5 font-bold text-slate-800">
                                            {ci.member.full_name}
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-slate-400">
                                            {ci.member.member_code}
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                                            {new Date(ci.checked_in_at).toLocaleTimeString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl font-bold ${
                                                ci.method === 'qr_scan' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {ci.method === 'qr_scan' ? 'Quét QR/Camera' : 'Nhập tay'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-400 font-semibold">
                                            {ci.verifier?.name || 'Hệ thống'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </Card>
    );
};

export default CheckIn;
