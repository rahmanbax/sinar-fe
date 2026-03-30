"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ButtonComponent from '../buttons/ButtonComponent'
import { Menu, X } from 'lucide-react'
import AuthModal from '../modals/AuthModal'

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const navItems = [
    { label: 'Peta', href: '/v2' },
    { label: 'Nama Rupabumi', href: '/v2/pengumuman' },
    { label: 'Gazeter', href: '/v2/gazeter' },
    { label: 'Bantuan', href: '/v2/bantuan' },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)
  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-5 py-4">
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
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="font-medium text-gray-700 hover:text-navy-500 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonComponent
                label="Masuk"
                onClick={openAuthModal}
              />
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

        {/* Mobile Menu Panel */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl z-50">
            <div className="px-5 py-6 flex flex-col gap-6">
              <ul className="flex flex-col gap-5">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-lg font-medium text-gray-700 hover:text-navy-500 transition-all font-outfit"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <ButtonComponent
                  label="Masuk"
                  className="w-full justify-center py-3"
                  onClick={() => {
                    setIsOpen(false);
                    openAuthModal();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </>
  )
}

export default PublicNavbar
