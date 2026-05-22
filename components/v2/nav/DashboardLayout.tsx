"use client";

import React, { useState, useRef, useEffect } from 'react';
import SurveyorNav from './SurveyorNav';
import VerifikatorKotaNav from './VerifikatorKotaNav';
import VerifikatorProvinsiNav from './VerifikatorProvinsiNav';
import VerifikatorPusatNav from './VerifikatorPusatNav';
import { ChevronDown, LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import AdminNav from './AdminNav';
import BigNav from './BigNav';
import SuperadminNav from './SuperadminNav';

interface DashboardLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
    tightMargin?: boolean;
}

const DashboardLayout = ({ children, showNav = true, tightMargin = false }: DashboardLayoutProps) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const getProfileRoute = () => {
        if (user?.role === 'verificator') {
            if (!user?.level || user.level === 'NATIONAL') return 'verifikator-pusat';
            if (user.level === 'PROVINCE') return 'verifikator-provinsi';
            return 'verifikator-kota';
        }
        return user?.role || 'admin';
    };

    const formatRegionName = (name?: string) => {
        if (!name) return '';
        return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    const getDisplayRole = () => {
        const regionName = formatRegionName(user?.region_name);

        if (user?.role === 'verificator') {
            if (!user?.level || user.level === 'NATIONAL') return 'Verifikator Pusat';
            if (user.level === 'PROVINCE') return `Verifikator Provinsi ${regionName}`.trim();
            return `Verifikator Kota ${regionName}`.trim();
        }

        if (user?.role === 'surveyor') {
            if (!user?.level || user.level === 'NATIONAL') return 'Surveyor Pusat';
            if (user.level === 'PROVINCE') return `Surveyor Provinsi ${regionName}`.trim();
            return `Surveyor ${regionName}`.trim();
        }

        if (user?.role === 'admin' || user?.role === 'contributor') {
            const roleName = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            return `${roleName} ${regionName}`.trim();
        }

        if (user?.role === 'big') {
            return 'Admin Badan Informasi Geospasial';
        }

        return user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Role';
    };

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden">
            {/* Sidebar Navigation */}
            {showNav && (
                <>
                    {(user?.role === 'surveyor' || user?.role === 'contributor') && (
                        <SurveyorNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                    )}
                    {user?.role === 'verificator' && (
                        (!user?.level || user.level === 'NATIONAL') ? (
                            <VerifikatorPusatNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                        ) : (user.level === 'PROVINCE') ? (
                            <VerifikatorProvinsiNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                        ) : (
                            <VerifikatorKotaNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                        )
                    )}
                    {user?.role === 'admin' && (
                        <AdminNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                    )}
                    {user?.role === 'superadmin' && (
                        <SuperadminNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                    )}
                    {user?.role === 'big' && (
                        <BigNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                    )}
                </>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className={`p-4 bg-white border-b border-gray-100 flex items-center shrink-0 ${!showNav ? 'justify-between' : 'justify-between md:justify-end'}`}>
                    <div className="flex items-center gap-3">
                        {showNav && (
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 -ml-2 text-gray-500 rounded-lg md:hidden"
                            >
                                <Menu size={24} />
                            </button>
                        )}

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
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex font-medium items-center gap-2 cursor-pointer">
                            <div className='flex flex-col text-right items-end max-w-[120px] sm:max-w-[200px]'>
                                <span className='text-sm truncate w-full block'>{user?.name || 'User'}</span>
                                <span className='text-xs capitalize text-gray-500 truncate w-full block'>{getDisplayRole()}</span>
                            </div>
                            <ChevronDown size={16} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-2 z-30">
                                <Link href={`/v2/${getProfileRoute()}/profil-saya`} className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer">
                                    <User size={16} strokeWidth={2} /> Profil Saya
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    <LogOut size={16} strokeWidth={2} /> Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className={`flex-1 overflow-y-auto ${tightMargin ? 'p-0' : 'p-4 md:p-8'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;