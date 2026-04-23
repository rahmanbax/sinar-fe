"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import { Mail, MapPin, Phone, Printer } from 'lucide-react'
import AuthModal from '../modals/AuthModal';

const Footer = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <footer className='py-6 px-10 border-t border-gray-200'>
      <div className='flex justify-between'>

        <div className='space-y-5'>
          <div className='flex items-center gap-2'>
            <Image src="/sinar-logo.png" alt="SINAR Logo" width={44} height={44} />
            <p className='font-semibold text-navy-500'>Sistem Informasi Nama Rupabumi</p>
          </div>
          <div className='flex gap-1'>
            <MapPin size={20} />
            <p className='text-sm w-72'>Jalan Raya Jakarta-Bogor KM 46, Cibinong, Kabupaten Bogor, Jawa Barat 16911</p>
          </div>
        </div>

        <div className='flex gap-20'>
          <div className='space-y-4'>
            <h2 className='font-semibold '>Publik</h2>
            <ul className='text-sm space-y-2 text-gray-700'>
              <li><a href='/v2' className='hover:text-navy-500 transition-colors cursor-pointer'>Peta Indonesia</a></li>
              <li><a href='/v2/nama-rupabumi' className='hover:text-navy-500 transition-colors cursor-pointer'>Nama Rupabumi</a></li>
              <li><a href='/v2/gazeter' className='hover:text-navy-500 transition-colors cursor-pointer'>Gazeter</a></li>
              <li><a href='/v2/bantuan' className='hover:text-navy-500 transition-colors cursor-pointer'>Bantuan</a></li>
            </ul>
          </div>
          <div className='space-y-4'>
            <h2 className='font-semibold '>Akun</h2>
            <ul className='text-sm space-y-2 text-gray-700'>
              <li><a onClick={() => setIsAuthModalOpen(true)} className="hover:text-navy-500 transition-colors cursor-pointer">Masuk atau Daftar</a></li>
              <li><a href='/v2/daftar-akun-admin' className='hover:text-navy-500 transition-colors cursor-pointer'>Daftar Sebagai Admin</a></li>
            </ul>
          </div>
          <div className='space-y-4'>
            <h2 className='font-semibold '>Kontak</h2>
            <ul className='text-sm space-y-2 text-gray-700'>
              <li ><a className='flex items-center gap-2 hover:text-navy-500 transition-colors cursor-pointer'><Mail size={16} />nna-ina@big.go.id</a></li>
              <li ><a className='flex items-center gap-2 hover:text-navy-500 transition-colors cursor-pointer'><Phone size={16} />0898-3163-030</a></li>
              <li ><a className='flex items-center gap-2 hover:text-navy-500 transition-colors cursor-pointer'><Printer size={16} />021 8752064; 021 87901254</a></li>
            </ul>
          </div>
        </div>

      </div>
      {/* <p>© {new Date().getFullYear()} SINAR - Sistem Informasi Nama Rupabumi Nasional.</p> */}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </footer>
  )
}

export default Footer