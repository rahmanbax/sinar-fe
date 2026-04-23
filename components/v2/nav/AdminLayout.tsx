"use client";

import React, { useState } from 'react';
import AdminNav from './AdminNav';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface AdminLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
    tightMargin?: boolean;
}

const AdminLayout = ({ children, showNav = true, tightMargin = false }: AdminLayoutProps) => {
    const { user, logout } = useAuth();


    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex font-medium items-center gap-2 cursor-pointer">
                            <div className='flex flex-col text-right items-end max-w-[120px] sm:max-w-[200px]'>
                                <span className='text-sm truncate w-full block'>{user?.name || 'User'}</span>
                                <span className='text-xs capitalize text-gray-500 truncate w-full block'>{user?.role || 'Role'}</span>
                            </div>
                            <ChevronDown size={16} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-2 z-30">
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    <LogOut size={16} strokeWidth={2} /> Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className={`flex-1 overflow-y-auto ${tightMargin ? 'p-0' : 'p-8'}`}>
                    {children}
                </main>
            </div >
        </div >
    );
}

export default AdminLayout;
