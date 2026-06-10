import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Member } from '../../types';
import MemberModal from './MemberModal';
import PaymentModal from './PaymentModal';
import { Card } from '../../components/ui/Card';
import { downloadBlob } from '../../utils/export';

const MemberList = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal states
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMember, setPaymentMember] = useState<Member | null>(null);
    const [downloadingQrId, setDownloadingQrId] = useState<number | null>(null);

    const fetchMembers = async () => {
        try {
            const { data } = await api.get('/members', { params: { search } });
            setMembers(data.data || []);
        } catch (error) {
            console.error('Error fetching members', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMembers();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const downloadQr = async (member: Member) => {
        setDownloadingQrId(member.id);
        try {
            const response = await api.get(`/members/${member.id}/qr`, {
                responseType: 'blob',
            });

            const contentType = response.headers['content-type'] ?? '';
            if (!contentType.includes('image/png')) {
                const message = await response.data.text();
                throw new Error(message || 'Không thể tải mã QR');
            }

            downloadBlob(`member_${member.member_code}_qr.png`, response.data);
        } catch (error) {
            console.error('Error downloading QR code', error);
            alert('Không thể tải mã QR. Vui lòng thử lại.');
        } finally {
            setDownloadingQrId(null);
        }
    };

    return (
        <>
            <Card className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm theo Tên, SĐT, Mã HV..." 
                        className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-sm shadow-sm"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                
                <button 
                    onClick={() => { setSelectedMember(null); setIsMemberModalOpen(true); }}
                    className="bg-indigo-600 hover:bg-indigo-750 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm Hội Viên
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Hội viên</th>
                                <th className="px-6 py-4">Mã HV</th>
                                <th className="px-6 py-4">Liên hệ</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold text-sm">
                                        Không tìm thấy hội viên nào trong hệ thống
                                    </td>
                                </tr>
                            ) : members.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                {member.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-bold text-slate-800 text-sm">{member.full_name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-bold font-mono text-sm">{member.member_code}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-800 font-semibold">{member.phone}</div>
                                        {member.email && <div className="text-slate-400 text-[10px] mt-0.5">{member.email}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                            member.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 
                                            member.status === 'locked' ? 'bg-rose-50 text-rose-750' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {member.status === 'active' ? '● Hoạt động' : member.status === 'locked' ? '● Đã khóa' : '● Bảo lưu'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {new Date(member.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button 
                                                onClick={() => { setSelectedMember(member); setIsMemberModalOpen(true); }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100" 
                                                title="Sửa / Chi tiết"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => { setPaymentMember(member); setIsPaymentModalOpen(true); }}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100" 
                                                title="Gia hạn gói tập"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => downloadQr(member)}
                                                disabled={downloadingQrId === member.id}
                                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 disabled:opacity-50"
                                                title="Tải mã QR"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7h4V3H3v4zm0 7h4v-4H3v4zm0 7h4v-4H3v4zm7 0h4v-4h-4v4zm7-14h4V3h-4v4zm0 7h4v-4h-4v4zm-7 7h4v-4h-4v4z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </Card>

        <MemberModal 
            isOpen={isMemberModalOpen} 
            onClose={() => setIsMemberModalOpen(false)} 
            onSuccess={fetchMembers}
            member={selectedMember}
        />

        {paymentMember && (
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={fetchMembers}
                member={paymentMember}
            />
        )}
        </>
    );
};

export default MemberList;
