import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Payment } from '../../types';

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Lịch sử Thanh toán</h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="refunded">Đã hoàn tiền</option>
                    </select>

                    <select
                        value={methodFilter}
                        onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả phương thức</option>
                        <option value="cash">Tiền mặt</option>
                        <option value="transfer">Chuyển khoản</option>
                        <option value="card">Quẹt thẻ</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-medium">Mã Hóa Đơn</th>
                                <th className="px-6 py-4 font-medium">Hội viên</th>
                                <th className="px-6 py-4 font-medium">Gói tập</th>
                                <th className="px-6 py-4 font-medium">Thành tiền</th>
                                <th className="px-6 py-4 font-medium">Phương thức</th>
                                <th className="px-6 py-4 font-medium">Trạng thái</th>
                                <th className="px-6 py-4 font-medium">Thời gian</th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        Chưa có giao dịch nào được ghi nhận
                                    </td>
                                </tr>
                            ) : payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                                        {payment.invoice_code}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{payment.member?.full_name}</div>
                                        <div className="text-slate-500 text-xs">{payment.member?.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {payment.member_package?.package?.name || 'Gói đã xóa'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {formatPrice(payment.final_amount)}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${
                                            payment.payment_method === 'cash' ? 'bg-amber-100 text-amber-700' :
                                            payment.payment_method === 'transfer' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                                        }`}>
                                            {payment.payment_method === 'cash' ? 'Tiền mặt' :
                                             payment.payment_method === 'transfer' ? 'Chuyển khoản' : 'Thẻ'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                            payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {payment.status === 'paid' ? 'Thành công' : 'Đã hoàn tiền'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {new Date(payment.paid_at).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setSelectedPayment(payment); setIsDetailOpen(true); }}
                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
                                                title="Chi tiết & Hoàn tiền"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadInvoice(payment.id, payment.invoice_code)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                                title="Tải hóa đơn PDF"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Trang trước
                        </button>
                        <span className="text-slate-600 text-sm font-medium">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>

            {/* Invoice Detail & Refund Modal */}
            {isDetailOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-slate-800">Thông Tin Hóa Đơn</h3>
                            <button onClick={() => { setIsDetailOpen(false); setRefundError(''); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Summary Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm border-b border-slate-100 pb-4">
                                <div>
                                    <p className="text-slate-500">Mã hóa đơn:</p>
                                    <p className="font-mono font-bold text-slate-800">{selectedPayment.invoice_code}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Trạng thái:</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        selectedPayment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedPayment.status === 'paid' ? 'Thành công' : 'Đã hoàn tiền'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-slate-500">Người thu tiền:</p>
                                    <p className="font-medium text-slate-800">{selectedPayment.collector?.name || 'Hệ thống'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Ngày lập hóa đơn:</p>
                                    <p className="text-slate-800">{new Date(selectedPayment.paid_at).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* Client & Package details */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hội viên & Gói tập</h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm text-slate-700">
                                    <p><span className="text-slate-400">Tên:</span> <span className="font-medium text-slate-900">{selectedPayment.member?.full_name}</span> ({selectedPayment.member?.member_code})</p>
                                    <p><span className="text-slate-400">SĐT:</span> {selectedPayment.member?.phone}</p>
                                    <p><span className="text-slate-400">Gói tập đăng ký:</span> <span className="font-medium text-slate-900">{selectedPayment.member_package?.package?.name || 'Gói đã xóa'}</span></p>
                                </div>
                            </div>

                            {/* Pricing summary */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chi tiết thanh toán</h4>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Giá gốc gói tập:</span>
                                        <span>{formatPrice(selectedPayment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-500">
                                        <span>Khấu trừ/Giảm giá:</span>
                                        <span>-{formatPrice(selectedPayment.discount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 text-base">
                                        <span>Thành tiền:</span>
                                        <span>{formatPrice(selectedPayment.final_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Refund logic */}
                            {selectedPayment.status === 'refunded' ? (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800 space-y-2">
                                    <h4 className="font-bold text-red-900">Chi tiết hoàn tiền</h4>
                                    <p><span className="text-red-600">Lý do:</span> {selectedPayment.refund_reason}</p>
                                    <p><span className="text-red-600">Người thực hiện:</span> {selectedPayment.refunder?.name || 'Hệ thống'}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRefund} className="border-t border-slate-100 pt-4 space-y-3">
                                    <h4 className="text-sm font-bold text-slate-800">Hoàn tiền giao dịch này</h4>
                                    <p className="text-xs text-slate-500">Hành động này sẽ hủy kích hoạt gói tập liên kết của hội viên và đánh dấu hóa đơn đã được hoàn tiền.</p>
                                    
                                    {refundError && (
                                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                                            {refundError}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            placeholder="Lý do hoàn tiền..." 
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={refundLoading}
                                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
                                        >
                                            {refundLoading ? 'Đang xử lý...' : 'Hoàn tiền'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentList;
