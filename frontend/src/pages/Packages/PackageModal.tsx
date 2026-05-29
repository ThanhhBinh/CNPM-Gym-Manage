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
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white">
                    <h3 className="text-xl font-bold text-slate-800">
                        {pkg ? 'Chỉnh Sửa Gói Tập' : 'Tạo Gói Tập Mới'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên gói tập <span className="text-red-500">*</span></label>
                        <input 
                            type="text" name="name" required
                            value={formData.name} onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Loại gói <span className="text-red-500">*</span></label>
                            <select 
                                name="type" required
                                value={formData.type} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="monthly">Theo tháng</option>
                                <option value="quarterly">Theo quý</option>
                                <option value="yearly">Theo năm</option>
                                <option value="pt">Gói PT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Thời hạn (ngày) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" name="duration_days" required min="1"
                                value={formData.duration_days} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Giá tiền (VND) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" name="price" required min="0" step="1000"
                                value={formData.price} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Số buổi PT (nếu có)</label>
                            <input 
                                type="number" name="max_pt_sessions" min="1"
                                value={formData.max_pt_sessions} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quyền lợi</label>
                        <textarea 
                            name="benefits" rows={2}
                            value={formData.benefits} onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái <span className="text-red-500">*</span></label>
                        <select 
                            name="status" required
                            value={formData.status} onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Ẩn</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả thêm</label>
                        <textarea 
                            name="description" rows={2}
                            value={formData.description} onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors shadow-md disabled:opacity-70 flex items-center">
                            {loading ? 'Đang xử lý...' : (pkg ? 'Cập Nhật' : 'Tạo Mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PackageModal;
