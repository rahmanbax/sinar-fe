"use client";

import React from 'react';
import AdminNav from './AdminNav';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface AdminLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
    tightMargin?: boolean;
}

const AdminLayout = ({ children, showNav = true, tightMargin = false }: AdminLayoutProps) => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden">
            {/* Sidebar Navigation */}
            {showNav && <AdminNav />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className={`p-4 bg-white border-b border-gray-100 flex items-center shrink-0 ${!showNav ? 'justify-between' : 'justify-end'}`}>
                    {!showNav && <Link href="/v2" className="block w-fit">
                        <Image
                            src="/sinar-logo.png"
                            alt="SINAR Logo"
                            width={100}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>}
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="text-right">
                            <p className="text-sm font-bold text-navy-900 leading-tight">{user?.name || 'John Sinar'}</p>
                            <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role || 'Admin SINAR'}</p>
                        </div>
                        <ChevronDown size={16} className="text-gray-500" />
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className={`flex-1 overflow-y-auto ${tightMargin ? 'p-0' : 'p-8'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
