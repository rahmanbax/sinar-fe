"use client";

import React from 'react';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboardPage = () => {
    const { user } = useAuth();
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">Halo, {user?.name}</h1>
                <p className="text-gray-500">Berikut adalah ringkasan data anda.</p>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboardPage;
