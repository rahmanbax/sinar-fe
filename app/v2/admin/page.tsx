"use client";

import React from 'react';
import AdminLayout from '@/components/v2/nav/AdminLayout';

const AdminDashboardPage = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-navy-900">Halo, SINAR</h1>
                <p className="text-gray-500">Berikut adalah ringkasan data anda.</p>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
