import React, { useState, useEffect } from 'react';
import { Package } from '../../types';
import api from '../../services/api';

interface PackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pkg?: Package | null;
}

const PackageModal: React.FC<PackageModalProps> = ({ isOpen, onClose, onSuccess, pkg }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'monthly',
        duration_days: 30,
        price: 0,
        max_pt_sessions: '',
        benefits: '',
        description: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (pkg) {
            setFormData({
                name: pkg.name || '',
                type: pkg.type || 'monthly',
                duration_days: pkg.duration_days || 30,
                price: pkg.price || 0,
                max_pt_sessions: pkg.max_pt_sessions ? pkg.max_pt_sessions.toString() : '',
                benefits: pkg.benefits || '',
                description: pkg.description || '',
                status: pkg.status || 'active'
            });
        } else {
            setFormData({
                name: '',
                type: 'monthly',
                duration_days: 30,
                price: 0,
                max_pt_sessions: '',
                benefits: '',
                description: '',
                status: 'active'
            });
        }
        setError('');
    }, [pkg, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            ...formData,
            max_pt_sessions: formData.max_pt_sessions === '' ? null : Number(formData.max_pt_sessions)
        };

        try {
            if (pkg) {
                await api.put(`/packages/${pkg.id}`, payload);
            } else {
                await api.post('/packages', payload);
            }
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
                setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                        {pkg ? 'Chỉnh sửa Gói tập' : 'Tạo Gói tập Mới'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-655 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl text-xs border border-rose-100 font-bold">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên gói tập <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" name="name" required
                            value={formData.name} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            placeholder="Gói tập 6 tháng Gold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phân loại <span className="text-rose-500">*</span></label>
                            <select 
                                name="type" required
                                value={formData.type} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm bg-white"
                            >
                                <option value="monthly">Theo tháng</option>
                                <option value="quarterly">Theo quý</option>
                                <option value="yearly">Theo năm</option>
                                <option value="pt">Gói thuê PT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hiệu lực (ngày) <span className="text-rose-500">*</span></label>
                            <input 
                                type="number" name="duration_days" required min="1"
                                value={formData.duration_days} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Giá tiền (VND) <span className="text-rose-500">*</span></label>
                            <input 
                                type="number" name="price" required min="0" step="1000"
                                value={formData.price} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Buổi PT kèm (nếu có)</label>
                            <input 
                                type="number" name="max_pt_sessions" min="1"
                                value={formData.max_pt_sessions} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                placeholder="Không có"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quyền lợi đi kèm</label>
                        <textarea 
                            name="benefits" rows={2}
                            value={formData.benefits} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            placeholder="Ví dụ: Miễn phí gửi xe, Tủ đồ riêng, Nước uống..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Trạng thái <span className="text-rose-500">*</span></label>
                            <select 
                                name="status" required
                                value={formData.status} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm bg-white"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Ẩn / Nháp</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mô tả chi tiết</label>
                        <textarea 
                            name="description" rows={2}
                            value={formData.description} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            placeholder="Mô tả chi tiết về đối tượng áp dụng gói..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 bg-white">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-xs transition-all">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50">
                            {loading ? 'Đang lưu...' : (pkg ? 'Lưu thay đổi' : 'Tạo gói tập')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PackageModal;
