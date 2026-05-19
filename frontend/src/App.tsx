import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/Members/MemberList';
import PackageList from './pages/Packages/PackageList';

import CheckIn from './pages/CheckIn/CheckIn';
import PaymentList from './pages/Payments/PaymentList';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="members" element={<MemberList />} />
                        <Route path="packages" element={<PackageList />} />
                        <Route path="check-in" element={<CheckIn />} />
                        <Route path="payments" element={<PaymentList />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
