"use client";

import React, { useState, useRef, useEffect } from 'react'
import MiniIndonesiaMap from '../map/MiniIndonesiaMap'
import DropdownInput from '../inputs/DropdownInput';
import TextInput from '../inputs/TextInput';
import CalendarInput from '../inputs/CalendarInput';
import FileInput from '../inputs/FileInput';

const ToponymDetailLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(400); // Lebar awal dalam pixel
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Mencegah highlight teks default browser
    isResizingRef.current = true;
    setIsResizing(true);
  };

  const stopResizing = () => {
    isResizingRef.current = false;
    setIsResizing(false);
  };

  useEffect(() => {
    // 1. Muat lebar yang tersimpan dari LocalStorage (jika ada) saat pertama kali buka
    const savedWidth = localStorage.getItem('toponymSidebarWidth');
    if (savedWidth) {
      const parsedWidth = Number(savedWidth);
      if (parsedWidth >= 300 && parsedWidth <= 800) {
        setSidebarWidth(parsedWidth);
      }
    }

    // 2. Logika Penggeseran
    const resize = (e: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current || !sidebarRef.current) return;

      let clientX;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }

      // Gunakan getBoundingClientRect agar kebal terhadap struktur layout kompleks
      const sidebarLeft = sidebarRef.current.getBoundingClientRect().left;
      const newWidth = clientX - sidebarLeft;

      // Batas minimum 300px dan maksimum 800px
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
        localStorage.setItem('toponymSidebarWidth', newWidth.toString()); // Simpan secara waktu nyata
      }
    };

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    window.addEventListener("touchmove", resize, { passive: false });
    window.addEventListener("touchend", stopResizing);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", resize);
      window.removeEventListener("touchend", stopResizing);
    };
  }, []);

  return (
    <div className={`flex w-full h-full bg-gray-50 overflow-hidden ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className={`h-full bg-white p-5 overflow-y-auto z-10 shrink-0 shadow-sm space-y-5 ${isResizing ? 'pointer-events-none' : ''}`}
      >
        <h2 className="text-xl font-bold text-gray-900">Data Toponim</h2>
        <div className="space-y-5">
          <DropdownInput
            label="Elemen Generik"
            placeholder='Pilih Elemen Generik'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
          />
          <TextInput
            id='elemen-spesifik'
            label="Elemen Spesifik"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <TextInput
            id='nama-rupabumi'
            label="Nama Rupabumi"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <TextInput
            id='nama-lain'
            label="Nama Lain"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <TextInput
            id='asal-bahasa'
            label="Asal Bahasa"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <TextInput
            id='arti-nama'
            label="Arti Nama"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <TextInput
            id='sejarah-nama'
            label="Sejarah Nama"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <TextInput
            id='pelafalan'
            label="Pelafalan"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <TextInput
            id='ejaan'
            label="Ejaan"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <DropdownInput
            label="jenis-unsur"
            placeholder='Jenis Unsur'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
          />
          <DropdownInput
            label="Provinsi"
            placeholder='Provinsi'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
          />
          <DropdownInput
            label="Kabupaten/ Kota"
            placeholder='Kabupaten/ Kota'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
          />
          <DropdownInput
            label="Kecamatan"
            placeholder='Kecamatan'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
          />
          <DropdownInput
            label="Desa/ Kelurahan"
            placeholder='Desa/ Kelurahan'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
          />
          <CalendarInput
            id='tanggal-survey'
            label="Tanggal Survey"
            value={""}
            onChange={() => { }}
            required={true}
          />
          <FileInput
            id='foto'
            label="Foto"
            onChange={() => { }}
            required={true}
            accept='.jpg, .jpeg, .png'
            maxSizeMB={5}
          />
        </div>
      </div>

      {/* Resizer Handle (Pemindah Batas Kolom) */}
      <div
        className={`w-1 transition-all bg-white hover:bg-navy-300 cursor-col-resize z-20 shrink-0 ${isResizing ? 'bg-navy-300' : ''}`}
        onMouseDown={startResizing}
        onTouchStart={startResizing}
      />

      <div className={`flex-1 h-full relative z-0 bg-blue-50 ${isResizing ? 'pointer-events-none' : ''}`}>
        <MiniIndonesiaMap />
      </div>
    </div>
  )
}

export default ToponymDetailLayout