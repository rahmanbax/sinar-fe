"use client"
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ButtonComponent from '../buttons/ButtonComponent'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react'
import AuthModal from '../modals/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleDefaultRoute } from '@/types/User'

type NavItem = {
  label: string;
  href?: string;
  options?: { label: string; href: string }[];
}

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mobilePublikasiOpen, setMobilePublikasiOpen] = useState(false)
  const { user, logout } = useAuth()

  const navItems: NavItem[] = [
    { label: 'Beranda', href: '/v2' },
    { label: 'Peta', href: '/v2?view=peta' },
    { label: 'Nama Rupabumi', href: '/v2/pengumuman' },
    { label: 'Gazeter', href: '/v2/gazeter' },
    { 
      label: 'Publikasi', 
      options: [
        { label: 'Dropdown 1', href: '#' },
        { label: 'Dropdown 2', href: '#' },
        { label: 'Dropdown 3', href: '#' },
      ]
    },
    { label: 'Bantuan', href: '/v2/bantuan' },
  ]

  const getProfileRoute = () => {
    if (user?.role === 'verificator') {
      return (user?.permission_level === 2 || user?.name?.toLowerCase().includes('provinsi'))
        ? 'verifikator-provinsi'
        : 'verifikator-kota';
    }
    return user?.role || 'admin';
  };

  const toggleMenu = () => setIsOpen(!isOpen)
  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsDropdownOpen(false)
      }
    }

    if (isOpen || isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, isDropdownOpen])

  return (
    <>
      <nav ref={navRef} className="sticky top-0 z-99 w-full">
        <div className="relative p-4 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="shrink-0 flex items-center gap-3">
              <a href="/v2" className="transition-opacity">
                <Image
                  src="/sinar-logo.png"
                  alt="SINAR Logo"
                  width={40}
                  height={38}
                  className="object-contain"
                />
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <ul className="flex gap-8 items-center">
                {navItems.map((item) => (
                  <li key={item.label} className="relative group">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="font-medium text-gray-700 hover:text-navy-500 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button className="flex items-center gap-1 font-medium text-gray-700 hover:text-navy-500 transition-colors cursor-pointer pb-2 mb-[-8px]">
                        {item.label}
                        <ChevronDown size={16} />
                      </button>
                    )}
                    
                    {/* Dropdown Options for Desktop */}
                    {item.options && (
                      <div className="absolute top-full left-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-2">
                          {item.options.map(opt => (
                            <Link key={opt.label} href={opt.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                              {opt.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 font-medium transition cursor-pointer"
                  >
                    <div className='flex flex-col items-end'>
                      <span className='text-sm'>{user.name || 'User'}</span>
                      <span className='text-xs capitalize text-gray-500'>{user.role}</span>
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-2 z-50">
                      <Link href={`/v2/${getProfileRoute()}/profil-saya`} className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer">
                        <User size={16} strokeWidth={2} /> Profil Saya
                      </Link>
                      <Link
                        href={getRoleDefaultRoute(user)}
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard size={16} strokeWidth={2} /> Dashboard
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
              ) : (
                <ButtonComponent
                  label="Masuk"
                  onClick={openAuthModal}
                />
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-600 hover:text-navy-500 focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel Layer */}
        <div className={`md:hidden absolute top-full left-0 w-full overflow-hidden ${!isOpen ? 'pointer-events-none' : ''}`}>
          <div
            className={`w-full max-h-[80vh] overflow-y-auto bg-white border-b border-gray-100 shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
              }`}
          >
            <div className="px-5 py-6 flex flex-col gap-6">
              <ul className="flex flex-col gap-5">
                {navItems.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium text-gray-700 hover:text-navy-500 transition-all font-outfit"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setMobilePublikasiOpen(!mobilePublikasiOpen)}
                          className="flex items-center justify-between w-full text-lg font-medium text-gray-700 hover:text-navy-500 transition-all font-outfit cursor-pointer"
                        >
                          {item.label}
                          <ChevronDown size={20} className={`transition-transform ${mobilePublikasiOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {mobilePublikasiOpen && item.options && (
                          <ul className="flex flex-col gap-3 pl-4 border-l-2 border-gray-100 mt-2">
                            {item.options.map(opt => (
                              <li key={opt.label}>
                                <Link
                                  href={opt.href}
                                  onClick={() => setIsOpen(false)}
                                  className="block text-base text-gray-600 hover:text-navy-500 transition-colors"
                                >
                                  {opt.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-gray-100">
                {user ? (
                  <>
                    <Link
                      href={getRoleDefaultRoute(user)}
                      onClick={() => setIsOpen(false)}
                      className="w-full text-lg flex items-center gap-2 font-medium text-gray-700 hover:text-navy-500 py-2 mt-2"
                    >
                      <LayoutDashboard size={20} strokeWidth={2} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="w-full text-lg flex items-center gap-2 font-medium text-red-600 py-2 mt-2"
                    >
                      <LogOut size={20} strokeWidth={2} />
                      <span>Keluar</span>
                    </button>
                  </>
                ) : (
                  <ButtonComponent
                    label="Masuk"
                    className="w-full justify-center py-3 mt-2"
                    onClick={() => {
                      setIsOpen(false);
                      openAuthModal();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </>
  )
}

export default PublicNavbar
