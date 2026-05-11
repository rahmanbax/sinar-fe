"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Database, Users, X } from 'lucide-react';

const navItems = [
    {
        name: 'Dashboard',
        href: '/v2/big',
        icon: LayoutGrid,
    },
    {
        name: 'Pengumuman',
        href: '/v2/big/pengumuman',
        icon: Database,
    },
    {
        name: 'Penelaahan Tanggapan',
        href: '/v2/big/penelaahan-tanggapan',
        icon: Database,
    },
    {
        name: 'Penetapan',
        href: '/v2/big/penetapan',
        icon: Database,
    },
    {
        name: 'Pembuatan GRI',
        href: '/v2/big/pembuatan-gazeter',
        icon: Database,
    },
    {
        name: 'Penelaahan Perubahan',
        href: '/v2/big/penelaahan-perubahan',
        icon: Database,
    }
];

interface BigNavProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const BigNav = ({ isOpen = false, onClose }: BigNavProps) => {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[240px] md:w-[240px] bg-white border-r border-gray-100 flex flex-col py-4 shrink-0 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo & Close Button */}
                <div className="px-4 mb-6 flex items-center justify-between">
                    <Link href="/v2" className="block w-fit">
                        <Image
                            src="/sinar-logo.png"
                            alt="SINAR Logo"
                            width={100}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                    {/* Tutup Modal Khusus Mobile */}
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800 hidden-if-not-mobile">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2 m-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.href === '/v2/big'
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onClose?.()}
                                className={`flex items-center transition-colors p-3 gap-2 font-semibold ${isActive
                                    ? 'bg-slate-200/50 border-l-4 border-navy-500 text-navy-500 rounded-lg'
                                    : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-100 rounded-lg'
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={isActive ? 'text-navy-500' : 'text-gray-500'}
                                    strokeWidth={isActive ? 2.5 : 2.5}
                                />
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}

export default BigNav;