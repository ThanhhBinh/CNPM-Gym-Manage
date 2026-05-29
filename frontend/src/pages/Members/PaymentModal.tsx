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
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Thanh Toán Gói Tập</h3>
                        <p className="text-sm text-slate-500 mt-1">Hội viên: <span className="font-semibold text-slate-800">{member.full_name}</span> ({member.member_code})</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Chọn Gói Tập <span className="text-red-500">*</span></label>
                        <select 
                            required
                            value={formData.package_id}
                            onChange={handlePackageChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="">-- Chọn gói --</option>
                            {packages.map(pkg => (
                                <option key={pkg.id} value={pkg.id}>{pkg.name} - {formatPrice(pkg.price)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ngày bắt đầu</label>
                            <input 
                                type="date" required
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phương thức TT</label>
                            <select 
                                value={formData.payment_method}
                                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            >
                                <option value="cash">Tiền mặt</option>
                                <option value="transfer">Chuyển khoản</option>
                                <option value="card">Quẹt thẻ</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Giảm giá (VND)</label>
                        <input 
                            type="number" min="0" step="1000"
                            value={formData.discount}
                            onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-4 mt-2 border border-emerald-100 flex justify-between items-center">
                        <span className="font-medium text-emerald-800">Tổng thanh toán:</span>
                        <span className="text-2xl font-bold text-emerald-600">{formatPrice(finalAmount)}</span>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading || !selectedPackage} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-xl font-medium transition-all shadow-md shadow-emerald-500/20 disabled:opacity-70 flex items-center">
                            {loading ? 'Đang xử lý...' : 'Xác nhận Thanh toán'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
