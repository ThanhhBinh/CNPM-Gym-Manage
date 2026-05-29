import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package } from '../../types';
import PackageModal from './PackageModal';

const PackageList = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Tìm gói tập..." 
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button 
                    onClick={() => { setSelectedPackage(null); setIsModalOpen(true); }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo Gói Tập
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-800">{pkg.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${pkg.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {pkg.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                                    </span>
                                </div>
                                
                                <div className="mb-6">
                                    <span className="text-3xl font-extrabold text-blue-600">{formatPrice(pkg.price)}</span>
                                    <span className="text-slate-500 text-sm">/{pkg.duration_days} ngày</span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Loại: {pkg.type.toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Thời hạn: {pkg.duration_days} ngày
                                    </div>
                                    {pkg.max_pt_sessions && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Số buổi PT: {pkg.max_pt_sessions} buổi
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">
                                    {pkg.benefits || 'Không có mô tả chi tiết'}
                                </p>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setSelectedPackage(pkg); setIsModalOpen(true); }}
                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-xl transition-colors" title="Sao chép gói">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <PackageModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPackages}
                pkg={selectedPackage}
            />
        </div>
    );
};

export default PackageList;
