import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package } from '../../types';
import PackageModal from './PackageModal';
import { Card } from '../../components/ui/Card';
const PackageList = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const totalPages = Math.ceil(packages.length / itemsPerPage);
    const paginatedPackages = packages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const fetchPackages = async () => {
        try {
            const { data } = await api.get('/packages');
            setPackages(data);
        } catch (error) {
            console.error('Error fetching packages', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <>
            <Card className="space-y-6 font-sans">
            <div className="flex justify-between items-center">
                <div className="relative max-w-xs w-full">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm gói tập..." 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 text-xs shadow-sm"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button 
                    onClick={() => { setSelectedPackage(null); setIsModalOpen(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-[0.99]"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo Gói Tập
                </button>
            </div>

                 {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedPackages.map((pkg) => (
                            <div key={pkg.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
                                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight">{pkg.name}</h3>
                                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${pkg.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-150 text-slate-600'}`}>
                                                {pkg.status === 'active' ? '● Hoạt động' : '● Nháp/Ẩn'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-2xl font-black text-indigo-600 tracking-tight">{formatPrice(pkg.price)}</span>
                                            <span className="text-slate-400 text-xs font-semibold"> / {pkg.duration_days} ngày</span>
                                        </div>
                                        <div className="border-t border-b border-slate-100 py-3 space-y-2 text-xs font-medium text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Phân loại: <span className="font-bold text-slate-700 uppercase">{pkg.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Hiệu lực: <span className="font-bold text-slate-700">{pkg.duration_days} ngày</span>
                                            </div>
                                            {pkg.max_pt_sessions && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Số buổi PT kèm: <span className="font-bold text-slate-700">{pkg.max_pt_sessions} buổi</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-450 leading-relaxed line-clamp-3">
                                            {pkg.benefits || 'Không có mô tả lợi ích đi kèm cho gói tập này.'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={() => { setSelectedPackage(pkg); setIsModalOpen(true); }}
                                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-2xl text-xs transition-colors"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

        <PackageModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchPackages}
            pkg={selectedPackage}
        />
        </>
    );
};

export default PackageList;
