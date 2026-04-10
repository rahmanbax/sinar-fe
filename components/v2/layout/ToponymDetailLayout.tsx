"use client";

import React, { useState, useRef, useEffect } from 'react'
import ToponymDetailMap from '../map/ToponymDetailMap'
import DropdownInput from '../inputs/DropdownInput';
import TextInput from '../inputs/TextInput';
import CalendarInput from '../inputs/CalendarInput';
import FileInput from '../inputs/FileInput';
import { Camera, File, MapPin, Mic } from 'lucide-react';
import ButtonComponent from '../buttons/ButtonComponent';

const ToponymDetailLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(400); // Lebar awal dalam pixel
  const [isResizing, setIsResizing] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawType, setDrawType] = useState<string>("Point");
  const [drawnPoint, setDrawnPoint] = useState<{ lat: number, lng: number } | null>(null);
  const [drawnLine, setDrawnLine] = useState<{ lat: number, lng: number }[]>([]);
  const [drawnPolygon, setDrawnPolygon] = useState<{ lat: number, lng: number }[][]>([[]]);
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const polygonScrollRef = useRef<HTMLDivElement>(null);
  const lineScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (polygonScrollRef.current) {
      polygonScrollRef.current.scrollTop = polygonScrollRef.current.scrollHeight;
    }
  }, [drawnPolygon]);

  useEffect(() => {
    if (lineScrollRef.current) {
      lineScrollRef.current.scrollTop = lineScrollRef.current.scrollHeight;
    }
  }, [drawnLine]);

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

          {!isDrawingMode ? (
            <ButtonComponent
              label={(drawnPoint && drawType === 'Point') || (drawnLine.length > 0 && drawType === 'Line') || (drawnPolygon.length > 0 && drawnPolygon[0].length > 0 && drawType === 'Polygon') ? "Ubah Lokasi di Peta" : "Tambah Lokasi di Peta"}
              onClick={() => setIsDrawingMode(true)}
              {...((drawnPoint && drawType === 'Point') || (drawnLine.length > 0 && drawType === 'Line') || (drawnPolygon.length > 0 && drawnPolygon[0].length > 0 && drawType === 'Polygon') ? { secondary: true } : {})}
              className='w-full'
            />
          ) : (
            <div className="p-4 border border-gray-300 rounded-lg space-y-4 bg-gray-50">
              <h3 className="font-medium">Penggambaran Lokasi di Peta</h3>

              <div className="flex flex-col gap-3">
                <label className="block text-sm font-semibold text-black">Tipe Geometri</label>
                <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-4">
                  {[
                    { label: "Titik", value: "Point" },
                    { label: "Garis", value: "Line" },
                    { label: "Area/ Polygon", value: "Polygon" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer group w-fit">
                      <input
                        type="radio"
                        name="drawType"
                        value={option.value}
                        checked={drawType === option.value}
                        onChange={(e) => setDrawType(e.target.value)}
                        className="w-4 h-4 accent-navy-600 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-navy-600 transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ButtonComponent
                  label="Undo"
                  onClick={() => {
                    if (drawType === 'Point') setDrawnPoint(null);
                    if (drawType === 'Line') setDrawnLine(prev => prev.slice(0, -1));
                    if (drawType === 'Polygon') {
                      setDrawnPolygon(prev => {
                        const lastIdx = prev.length - 1;
                        if (lastIdx < 0) return [[]];
                        const lastPoly = prev[lastIdx];
                        if (lastPoly.length > 0) {
                          const next = [...prev];
                          next[lastIdx] = lastPoly.slice(0, -1);
                          return next;
                        } else if (lastIdx > 0) {
                          // pop empty poly and pop last point of prev poly
                          const next = prev.slice(0, -1);
                          const newLastIdx = next.length - 1;
                          next[newLastIdx] = next[newLastIdx].slice(0, -1);
                          return next;
                        }
                        return [[]];
                      });
                    }
                  }}
                  secondary={true}
                  className='w-full text-sm'
                />
                <ButtonComponent
                  label="Bersihkan"
                  onClick={() => {
                    if (drawType === 'Point') setDrawnPoint(null);
                    if (drawType === 'Line') setDrawnLine([]);
                    if (drawType === 'Polygon') setDrawnPolygon([[]]);
                  }}
                  secondary={true}
                  className='w-full text-sm transition-colors'
                />
                <ButtonComponent
                  label="Batalkan"
                  onClick={() => {
                    setIsDrawingMode(false);
                  }}
                  secondary={true}
                  className='w-full text-sm col-span-2'
                />
                <ButtonComponent
                  label="Simpan Lokasi"
                  onClick={() => {
                    // Add logic to save the drawnPoint here
                    setIsDrawingMode(false);
                  }}
                  className='w-full text-sm col-span-2'
                />
              </div>
            </div>
          )}


          {drawnPoint && drawType === 'Point' && (
            <div className='p-3 border border-gray-300 bg-gray-50 rounded-lg space-y-2'>
              <p className='font-medium'>Koordinat Titik</p>
              <div className='flex flex-col'>
                <span className='text-sm text-gray-500'>Bujur</span>
                <span className='font-medium'>{drawnPoint.lng.toFixed(6)}</span>
              </div>
              <div className='flex flex-col'>
                <span className='text-sm text-gray-500'>Lintang</span>
                <span className='font-medium'>{drawnPoint.lat.toFixed(6)}</span>
              </div>
            </div>
          )}

          {drawnLine.length > 0 && drawType === 'Line' && (
            <div ref={lineScrollRef} className='p-3 border border-gray-300 bg-gray-50 rounded-lg space-y-2 max-h-40 overflow-y-auto custom-scrollbar'>
              <p className='font-medium'>Koordinat Garis ({drawnLine.length} Titik)</p>
              {drawnLine.map((pt, i) => (
                <div key={i} className='flex flex-col'>
                  <span className='text-gray-500 text-sm'>Titik {i + 1}</span>
                  <span className='font-medium'>{pt.lng.toFixed(6)}, {pt.lat.toFixed(6)}</span>
                </div>
              ))}
            </div>
          )}

          {drawnPolygon.length > 0 && drawnPolygon[0].length > 0 && drawType === 'Polygon' && (
            <div ref={polygonScrollRef} className='p-3 border border-gray-300 bg-gray-50 rounded-lg space-y-3 max-h-60 overflow-y-auto custom-scrollbar flex flex-col'>
              {drawnPolygon.map((poly, pIdx) => poly.length > 0 && (
                <div key={pIdx} className="space-y-1">
                  <p className='font-medium'>Area {pIdx + 1} ({poly.length} Titik)</p>
                  {poly.map((pt, i) => (
                    <div key={i} className='flex flex-col'>
                      <span className='text-gray-500 text-sm'>Titik {i + 1}</span>
                      <span className='font-medium'>{pt.lng.toFixed(6)}, {pt.lat.toFixed(6)}</span>
                    </div>
                  ))}
                </div>
              ))}
              
              {isDrawingMode && (
                <ButtonComponent 
                  label="Tambah Area Baru"
                  secondary={true}
                  onClick={() => setDrawnPolygon(prev => [...prev, []])}
                  className="text-xs py-1.5 mt-2"
                />
              )}
            </div>
          )}

          <DropdownInput
            label="Elemen Generik"
            placeholder='Pilih Elemen Generik'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
            required={true}
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
            disabled
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
            label="Jenis Unsur"
            placeholder='Jenis Unsur'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
            required={true}
          />
          <DropdownInput
            label="Provinsi"
            placeholder='Provinsi'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
            required={true}
          />
          <DropdownInput
            label="Kabupaten/ Kota"
            placeholder='Kabupaten/ Kota'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
            required={true}
          />
          <DropdownInput
            label="Kecamatan"
            placeholder='Kecamatan'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
            required={true}
          />
          <DropdownInput
            label="Desa/ Kelurahan"
            placeholder='Desa/ Kelurahan'
            value={""}
            onChange={() => { }}
            options={[]}
            searchable={true}
            required={true}
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
            icon={<Camera size={20} className='text-gray-500' />}
          />
          <FileInput
            id='sketsa-lokasi'
            label="Sketsa Lokasi"
            onChange={() => { }}
            required={true}
            accept='.jpg, .jpeg, .png'
            maxSizeMB={5}
            icon={<MapPin size={20} className='text-gray-500' />}
          />
          <FileInput
            id='rekaman-suara-pengucapan'
            label="Rekaman Suara Pengucapan"
            onChange={() => { }}
            required={true}
            accept='.mp3, .wav'
            maxSizeMB={5}
            icon={<Mic size={20} className='text-gray-500' />}
          />
          <FileInput
            id='rekaman-audio-visual'
            label="Rekaman Audio Visual"
            onChange={() => { }}
            required={true}
            accept='.mp4, .avi, .mov'
            maxSizeMB={5}
            icon={<Camera size={20} className='text-gray-500' />}
          />
          <FileInput
            id='dokumen-pendukung'
            label="Dokumen Pendukung"
            onChange={() => { }}
            required={true}
            accept='.pdf, .doc, .docx'
            maxSizeMB={5}
            icon={<File size={20} className='text-gray-500' />}
          />
        </div>
        <div className="flex gap-3">
          <ButtonComponent
            label="Batal"
            onClick={() => { }}
            secondary={true}
            className='w-full'
          />
          <ButtonComponent
            label="Simpan"
            onClick={() => { }}
            className='w-full'
            type='submit'
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
        <ToponymDetailMap
          isDrawingMode={isDrawingMode}
          drawType={drawType}
          drawnPoint={drawnPoint}
          setDrawnPoint={setDrawnPoint}
          drawnLine={drawnLine}
          setDrawnLine={setDrawnLine}
          drawnPolygon={drawnPolygon}
          setDrawnPolygon={setDrawnPolygon}
          onSave={() => setIsDrawingMode(false)}
        />
      </div>
    </div>
  )
}

export default ToponymDetailLayout