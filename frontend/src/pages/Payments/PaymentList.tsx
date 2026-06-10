import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Payment } from '../../types';
import { Card } from '../../components/ui/Card';
interface ExtendedPayment extends Payment {
    member: {
        full_name: string;
        phone: string;
        member_code: string;
    };
    member_package: {
        package: {
            name: string;
            price: number;
        };
    };
    collector?: {
        name: string;
    };
    refunder?: {
        name: string;
    };
}

const PaymentList = () => {
    const [payments, setPayments] = useState<ExtendedPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modals
    const [selectedPayment, setSelectedPayment] = useState<ExtendedPayment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundError, setRefundError] = useState('');

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params: any = { page: currentPage };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (methodFilter !== 'all') params.method = methodFilter;

            const { data } = await api.get('/payments', { params });
            setPayments(data.data || []);
            setTotalPages(data.last_page || 1);
        } catch (error) {
            console.error('Error fetching payments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [currentPage, statusFilter, methodFilter]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleDownloadInvoice = async (paymentId: number, invoiceCode: string) => {
        try {
            const response = await api.get(`/payments/${paymentId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${invoiceCode}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Error downloading invoice', error);
            alert('Không thể tải hóa đơn. Vui lòng kiểm tra lại.');
        }
    };

    const handleRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayment || !refundReason.trim()) return;

        setRefundLoading(true);
        setRefundError('');

        try {
            await api.post(`/payments/${selectedPayment.id}/refund`, {
                reason: refundReason.trim()
            });
            alert('Hoàn tiền thành công!');
            setIsDetailOpen(false);
            setRefundReason('');
            fetchPayments();
        } catch (err: any) {
            setRefundError(err.response?.data?.message || 'Có lỗi xảy ra khi hoàn tiền');
        } finally {
            setRefundLoading(false);
        }
    };

    return (
        <Card className="space-y-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Lịch sử giao dịch</h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Theo dõi và quản lý hóa đơn thanh toán từ hội viên</p>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-slate-600 text-xs shadow-sm cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="paid">Thành công</option>
                        <option value="refunded">Đã hoàn tiền</option>
                    </select>

                    <select
                        value={methodFilter}
                        onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-slate-600 text-xs shadow-sm cursor-pointer"
                    >
                        <option value="all">Tất cả hình thức</option>
                        <option value="cash">Tiền mặt</option>
                        <option value="transfer">Chuyển khoản</option>
                    </select>
                </div>
            </div>

            <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Mã hóa đơn</th>
                                <th className="px-6 py-4">Hội viên</th>
                                <th className="px-6 py-4">Gói tập</th>
                                <th className="px-6 py-4">Số tiền</th>
                                <th className="px-6 py-4">Phương thức</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-semibold text-sm">
                                        Chưa có giao dịch thanh toán nào
                                    </td>
                                </tr>
                            ) : payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50/20 transition-colors">
                                    <td className="px-6 py-4 font-bold font-mono text-indigo-600 text-sm">
                                        {payment.invoice_code}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{payment.member?.full_name}</div>
                                        <div className="text-slate-400 text-[10px] mt-0.5">{payment.member?.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                        {payment.member_package?.package?.name || 'Gói đã xóa'}
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                                        {formatPrice(payment.final_amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                            payment.payment_method === 'cash' ? 'bg-amber-50 text-amber-700' :
                                            payment.payment_method === 'transfer' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'
                                        }`}>
                                            {payment.payment_method === 'cash' ? 'Tiền mặt' :
                                             payment.payment_method === 'transfer' ? 'Chuyển khoản' : 'Thẻ POS'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                            payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-750'
                                        }`}>
                                            {payment.status === 'paid' ? '● Thành công' : '● Đã hoàn tiền'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {new Date(payment.paid_at).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button 
                                                onClick={() => { setSelectedPayment(payment); setIsDetailOpen(true); }}
                                                className="p-2 text-indigo-650 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all" 
                                                title="Chi tiết / Hoàn tiền"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadInvoice(payment.id, payment.invoice_code)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all" 
                                                title="Tải hóa đơn PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-4 py-2 border border-slate-200 rounded-2xl text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                        >
                            Trang trước
                        </button>
                        <span className="text-slate-500 text-xs font-bold">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-4 py-2 border border-slate-200 rounded-2xl text-xs font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </Card>

            {/* Invoice Detail & Refund Modal */}
            {isDetailOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Chi tiết Hóa đơn</h3>
                            <button onClick={() => { setIsDetailOpen(false); setRefundError(''); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Summary Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-4 font-sans">
                                <div>
                                    <p className="text-slate-400 font-semibold mb-1">Mã hóa đơn:</p>
                                    <p className="font-mono font-bold text-indigo-600 text-sm">{selectedPayment.invoice_code}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-semibold mb-1">Trạng thái:</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-xl font-bold ${
                                        selectedPayment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-750'
                                    }`}>
                                        {selectedPayment.status === 'paid' ? 'Thành công' : 'Đã hoàn tiền'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-semibold mb-1">Người thu tiền:</p>
                                    <p className="font-bold text-slate-700">{selectedPayment.collector?.name || 'Hệ thống'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-semibold mb-1">Ngày giao dịch:</p>
                                    <p className="font-bold text-slate-750">{new Date(selectedPayment.paid_at).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* Client & Package details */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hội viên & Gói tập</h4>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
                                    <p><span className="font-bold text-slate-450">Họ tên:</span> <span className="font-bold text-slate-800">{selectedPayment.member?.full_name}</span> ({selectedPayment.member?.member_code})</p>
                                    <p><span className="font-bold text-slate-450">Liên hệ SĐT:</span> <span className="font-semibold text-slate-755">{selectedPayment.member?.phone}</span></p>
                                    <p><span className="font-bold text-slate-450">Gói đăng ký:</span> <span className="font-bold text-indigo-650">{selectedPayment.member_package?.package?.name || 'Gói đã xóa'}</span></p>
                                </div>
                            </div>

                            {/* Pricing summary */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thành tiền</h4>
                                <div className="space-y-2 text-xs text-slate-600 font-sans">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Giá gốc:</span>
                                        <span className="font-bold">{formatPrice(selectedPayment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-600">
                                        <span className="font-medium">Khấu trừ giảm giá:</span>
                                        <span className="font-bold">-{formatPrice(selectedPayment.discount)}</span>
                                    </div>
                                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-100 pt-2 text-sm">
                                        <span>Khách thanh toán:</span>
                                        <span className="text-indigo-600">{formatPrice(selectedPayment.final_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Refund logic */}
                            {selectedPayment.status === 'refunded' ? (
                                <div className="bg-rose-50/50 border border-rose-100/30 rounded-2xl p-4 text-xs text-rose-800 space-y-2 font-sans">
                                    <h4 className="font-bold text-rose-900">Chi tiết hoàn tiền</h4>
                                    <p><span className="font-semibold">Lý do hoàn trả:</span> {selectedPayment.refund_reason}</p>
                                    <p><span className="font-semibold">Thực hiện bởi:</span> {selectedPayment.refunder?.name || 'Hệ thống'}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRefund} className="border-t border-slate-150 pt-4 space-y-3 font-sans">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hoàn trả hóa đơn</h4>
                                    <p className="text-[10px] text-slate-450 leading-relaxed">Gói tập liên kết sẽ bị hủy kích hoạt lập tức và doanh thu được điều chỉnh giảm.</p>
                                    
                                    {refundError && (
                                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl text-xs border border-rose-100">
                                            {refundError}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            placeholder="Lý do hoàn tiền..." 
                                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all"
                                            required
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={refundLoading}
                                            className="px-4 py-2.5 bg-rose-650 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                                        >
                                            {refundLoading ? 'Đang xử lý...' : 'Xác nhận hoàn'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default PaymentList;
