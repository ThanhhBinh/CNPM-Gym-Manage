import React, { useState, useEffect } from 'react';
import { Member, Package } from '../../types';
import api from '../../services/api';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    member: Member;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, member }) => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        package_id: '',
        payment_method: 'cash',
        discount: 0,
        start_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            fetchPackages();
            setFormData({
                package_id: '',
                payment_method: 'cash',
                discount: 0,
                start_date: new Date().toISOString().split('T')[0]
            });
            setSelectedPackage(null);
            setError('');
        }
    }, [isOpen]);

    const fetchPackages = async () => {
        try {
            const { data } = await api.get('/packages');
            setPackages(data.filter((p: Package) => p.status === 'active'));
        } catch (err) {
            console.error('Failed to fetch packages', err);
        }
    };

    const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pkgId = e.target.value;
        const pkg = packages.find(p => p.id.toString() === pkgId) || null;
        setSelectedPackage(pkg);
        setFormData({ ...formData, package_id: pkgId });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const finalAmount = selectedPackage ? Math.max(0, selectedPackage.price - formData.discount) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.package_id) {
            setError('Vui lòng chọn một gói tập');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/members/${member.id}/packages`, formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err.response?.data?.errors) {
                const errs = err.response.data.errors;
                const errorList = Object.keys(errs).map(field => {
                    const messages = errs[field].join(', ');
                    return `${field}: ${messages}`;
                });
                setError(errorList.join('\n'));
            } else {
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
            }
        } finally {
            setLoading(false);
        }
    };

    // VietQR URL Generator
    const getVietQrUrl = () => {
        if (!selectedPackage) return '';
        const bankId = 'MB'; // MBBank (Military Bank)
        const accountNo = '0999999999'; // Simulated Gym Account Number
        const accountName = encodeURIComponent('PHONG TAP GYM ACTIVE');
        const addInfo = encodeURIComponent(`Gia han ${member.member_code} ${selectedPackage.name}`);
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${finalAmount}&addInfo=${addInfo}&accountName=${accountName}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden animate-fade-in-up border border-slate-100 flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh]">
                
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8 space-y-5 overflow-y-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Gia hạn / Thanh toán</h3>
                            <p className="text-xs text-slate-400 mt-1 font-semibold">
                                Hội viên: <span className="text-slate-700 font-bold">{member.full_name}</span> • Mã: <span className="font-mono text-indigo-600 font-bold">{member.member_code}</span>
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl text-xs border border-rose-100 font-bold">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gói Tập <span className="text-rose-500">*</span></label>
                            <select 
                                required
                                value={formData.package_id}
                                onChange={handlePackageChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            >
                                <option value="">-- Chọn gói tập --</option>
                                {packages.map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name} ({formatPrice(pkg.price)})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ngày bắt đầu</label>
                                <input 
                                    type="date" required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phương thức TT</label>
                                <select 
                                    value={formData.payment_method}
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                >
                                    <option value="cash">💵 Tiền mặt</option>
                                    <option value="transfer">💳 Chuyển khoản</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Giảm giá (VND)</label>
                            <input 
                                type="number" min="0" step="1000"
                                value={formData.discount}
                                onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/30 flex justify-between items-center mt-2">
                        <span className="font-bold text-indigo-900 text-sm">Tổng cộng:</span>
                        <span className="text-xl font-black text-indigo-600">{formatPrice(finalAmount)}</span>
                    </div>

                    <div className="pt-2 flex justify-end gap-3 font-sans">
                        <button type="button" onClick={onClose} className="px-5 py-3 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-xs transition-all">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading || !selectedPackage} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50">
                            {loading ? 'Đang lưu...' : 'Xác nhận gia hạn'}
                        </button>
                    </div>
                </form>

                {/* Right Side: VietQR display for transfer method */}
                <div className="w-full md:w-[360px] bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <button type="button" onClick={onClose} className="hidden md:block absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    {formData.payment_method === 'transfer' && selectedPackage ? (
                        <div className="w-full text-center space-y-4 animate-fade-in-up">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Quét mã chuyển khoản VietQR</h4>
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60 inline-block">
                                <img 
                                    src={getVietQrUrl()} 
                                    alt="VietQR Payment Code" 
                                    className="w-48 h-48 object-contain rounded-lg mx-auto"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/200x200?text=VietQR+Error";
                                    }}
                                />
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium leading-relaxed px-2">
                                <p className="font-bold text-slate-700">Ngân hàng MB (Military Bank)</p>
                                <p>Số tài khoản: <span className="font-bold font-mono text-indigo-600">0999999999</span></p>
                                <p className="mt-1">Mã tự động điền số tiền và nội dung chuyển khoản chính xác.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-2 text-slate-400 p-4">
                            <div className="text-4xl">💳</div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Hình thức thanh toán</h4>
                            <p className="text-[11px] font-medium leading-relaxed">
                                {formData.payment_method === 'cash'
                                    ? 'Nhận tiền mặt trực tiếp từ khách hàng và ấn xác nhận.'
                                    : 'Vui lòng chọn gói tập để hiển thị mã VietQR chuyển khoản.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
