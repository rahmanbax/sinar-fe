"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutGrid, User } from 'lucide-react';

const navItems = [
    {
        name: 'Dashboard',
        href: '/v2/admin',
        icon: LayoutGrid,
    },
    {
        name: 'Akun',
        href: '/v2/admin/akun',
        icon: User,
    },
];

const AdminNav = () => {
    const pathname = usePathname();

    return (
        <aside className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col py-4 shrink-0">
            {/* Logo */}
            <div className="px-4 mb-6">
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
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2 m-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = item.href === '/v2/admin' 
                        ? pathname === item.href 
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center transition-colors p-3 gap-2 font-semibold ${isActive
                                ? 'bg-slate-200/50 border-l-4 border-navy-800 text-navy-900 rounded-lg'
                                : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-100 rounded-lg'
                                }`}
                        >
                            <Icon
                                size={20}
                                className={isActive ? 'text-navy-800' : 'text-gray-500'}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}

export default AdminNav;
