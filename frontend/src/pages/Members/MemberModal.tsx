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
    }, [member, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (member) {
                await api.put(`/members/${member.id}`, formData);
            } else {
                await api.post('/members', formData);
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">
                        {member ? 'Chỉnh Sửa Hội Viên' : 'Thêm Hội Viên Mới'}
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                        <input 
                            type="text" name="full_name" required
                            value={formData.full_name} onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                            <input 
                                type="tel" name="phone" required
                                value={formData.phone} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CCCD / CMND</label>
                            <input 
                                type="text" name="id_card"
                                value={formData.id_card} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input 
                                type="email" name="email"
                                value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
                            <input 
                                type="date" name="date_of_birth"
                                value={formData.date_of_birth} onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                        <input 
                            type="text" name="address"
                            value={formData.address} onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors shadow-md disabled:opacity-70 flex items-center">
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {member ? 'Cập Nhật' : 'Tạo Mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemberModal;
