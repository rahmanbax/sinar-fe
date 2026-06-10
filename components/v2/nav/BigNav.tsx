"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
    LayoutGrid, Database, X, Newspaper, CalendarDays, 
    Images, Building2, ClipboardList, ChevronDown, ChevronRight 
} from 'lucide-react';

type NavItem = {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    children?: NavItem[];
};

const navItems: NavItem[] = [
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
    },
    {
        name: 'Publikasi',
        href: '/v2/big/publikasi',
        icon: Newspaper,
        children: [
            { name: 'Berita', href: '/v2/big/publikasi/berita', icon: Newspaper },
            { name: 'Agenda', href: '/v2/big/publikasi/agenda', icon: CalendarDays },
            { name: 'Galeri', href: '/v2/big/publikasi/galeri', icon: Images },
            { name: 'Struktur Kelembagaan', href: '/v2/big/publikasi/struktur-kelembagaan', icon: Building2 },
            { name: 'Evaluasi & Pemantauan Teknis', href: '/v2/big/publikasi/evaluasi-pemantauan-teknis', icon: ClipboardList },
        ]
    }
];

function getInitialOpenGroups(items: NavItem[], pathname: string): Set<string> {
    const open = new Set<string>();
    const check = (item: NavItem) => {
        if (!item.children) return;
        const childActive = item.children.some(
            child => pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (childActive || pathname.startsWith(item.href + '/')) {
            open.add(item.href);
        }
        item.children.forEach(check);
    };
    items.forEach(check);
    return open;
}

interface BigNavProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const BigNav = ({ isOpen = false, onClose }: BigNavProps) => {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<Set<string>>(
        () => getInitialOpenGroups(navItems, pathname)
    );

    const toggleGroup = (href: string) => {
        setOpenGroups(prev => {
            const next = new Set(prev);
            if (next.has(href)) next.delete(href);
            else next.add(href);
            return next;
        });
    };

    const renderNavItem = (item: NavItem, depth = 0): React.ReactNode => {
        const Icon = item.icon;
        const pl = 12 + depth * 14;
        const isGroup = !!item.children;
        const isGroupOpen = openGroups.has(item.href);
        const isLeafActive = !isGroup && (
            item.href === '/v2/big'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/')
        );
        const isGroupActive = isGroup && pathname.startsWith(item.href + '/');

        if (isGroup) {
            return (
                <div key={item.href}>
                    <button
                        onClick={() => toggleGroup(item.href)}
                        style={{ paddingLeft: `${pl}px` }}
                        className={`w-full flex items-center justify-between pr-3 py-2.5 gap-2 font-semibold rounded-lg transition-colors ${isGroupActive
                            ? 'bg-slate-200/50 text-navy-500'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Icon
                                size={18}
                                className={`shrink-0 ${isGroupActive ? 'text-navy-500' : 'text-gray-500'}`}
                                strokeWidth={2.5}
                            />
                            <span className="text-sm truncate text-left">{item.name}</span>
                        </div>
                        {isGroupOpen
                            ? <ChevronDown size={13} className="shrink-0 text-gray-400" />
                            : <ChevronRight size={13} className="shrink-0 text-gray-400" />
                        }
                    </button>
                    {isGroupOpen && (
                        <div>
                            {item.children!.map(child => renderNavItem(child, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                style={{ paddingLeft: `${pl}px` }}
                className={`flex items-center pr-3 py-2.5 gap-2 font-semibold rounded-lg transition-colors ${isLeafActive
                    ? 'bg-slate-200/50 border-l-4 border-navy-500 text-navy-500'
                    : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
            >
                <Icon
                    size={18}
                    className={`shrink-0 ${isLeafActive ? 'text-navy-500' : 'text-gray-500'}`}
                    strokeWidth={2.5}
                />
                <span className="text-sm truncate">{item.name}</span>
            </Link>
        );
    };

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
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-60 md:w-60 bg-white border-r border-gray-100 flex flex-col py-4 shrink-0 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo & Close Button */}
                <div className="px-4 mb-4 flex items-center justify-between">
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
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-0.5 mx-2 overflow-y-auto flex-1 pb-4">
                    {navItems.map(item => renderNavItem(item))}
                </nav>
            </aside>
        </>
    )
}

export default BigNav;