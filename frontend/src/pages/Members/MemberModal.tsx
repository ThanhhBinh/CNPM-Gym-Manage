import React, { useState, useEffect } from 'react';
import { Member } from '../../types';
import api from '../../services/api';

interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    member?: Member | null;
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, onSuccess, member }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        id_card: '',
        date_of_birth: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (member) {
            setFormData({
                full_name: member.full_name || '',
                phone: member.phone || '',
                email: member.email || '',
                id_card: member.id_card || '',
                date_of_birth: member.date_of_birth ? member.date_of_birth.split('T')[0] : '',
                address: member.address || ''
            });
        } else {
            setFormData({
                full_name: '',
                phone: '',
                email: '',
                id_card: '',
                date_of_birth: '',
                address: ''
            });
        }
        setFieldErrors({});
    }, [member, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: [] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});

        // Clean empty fields by converting them to null before submitting
        const cleanedData = Object.entries(formData).reduce((acc: any, [key, val]) => {
            acc[key] = val === '' ? null : val;
            return acc;
        }, {});

        try {
            if (member) {
                await api.put(`/members/${member.id}`, cleanedData);
            } else {
                await api.post('/members', cleanedData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err.response?.data?.errors) {
                // Store field-specific errors and also a combined message
                setFieldErrors(err.response.data.errors);
                const combined = Object.entries(err.response.data.errors)
                    .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(', ')}`)
                    .join('\n');
                setError(combined);
            } else {
                setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                        {member ? 'Chỉnh sửa Hội viên' : 'Thêm Hội viên Mới'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-650 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl text-xs border border-rose-100 font-bold whitespace-pre-line">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Họ và Tên <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" name="full_name" required
                            value={formData.full_name} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            placeholder="Nguyễn Văn A"
                        />
                        {fieldErrors.full_name && (
                            <div className="mt-1 text-xs text-rose-600">{fieldErrors.full_name.join(', ')}</div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại <span className="text-rose-500">*</span></label>
                            <input 
                                type="tel" name="phone" required
                                value={formData.phone} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                placeholder="09xxxxxxxx"
                            />
                            {fieldErrors.phone && (
                                <div className="mt-1 text-xs text-rose-600">{fieldErrors.phone.join(', ')}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Số CCCD / CMND</label>
                            <input 
                                type="text" name="id_card"
                                value={formData.id_card} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                placeholder="03xxxxxxxxxx"
                            />
                            {fieldErrors.id_card && (
                                <div className="mt-1 text-xs text-rose-600">{fieldErrors.id_card.join(', ')}</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                            <input 
                                type="email" name="email"
                                value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                                placeholder="example@email.com"
                            />
                            {fieldErrors.email && (
                                <div className="mt-1 text-xs text-rose-600">{fieldErrors.email.join(', ')}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ngày sinh</label>
                            <input 
                                type="date" name="date_of_birth"
                                value={formData.date_of_birth} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            />
                            {fieldErrors.date_of_birth && (
                                <div className="mt-1 text-xs text-rose-600">{fieldErrors.date_of_birth.join(', ')}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Địa chỉ thường trú</label>
                        <input 
                            type="text" name="address"
                            value={formData.address} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm"
                            placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố"
                        />
                        {fieldErrors.address && (
                            <div className="mt-1 text-xs text-rose-600">{fieldErrors.address.join(', ')}</div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 font-sans">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-xs transition-all">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50 flex items-center">
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {member ? 'Lưu thay đổi' : 'Tạo mới Hội viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemberModal;
