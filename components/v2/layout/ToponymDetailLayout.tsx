"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react'
import ToponymDetailMap from '../map/ToponymDetailMap'
import DropdownInput from '../inputs/DropdownInput';
import TextInput from '../inputs/TextInput';
import TextBoxInput from '../inputs/TextBoxInput';
import CalendarInput from '../inputs/CalendarInput';
import FileInput from '../inputs/FileInput';
import { Camera, File, MapPin, Mic } from 'lucide-react';
import ButtonComponent from '../buttons/ButtonComponent';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useProvinces, useCities, useDistricts, useVillages, useElements, useGenericElements } from '@/hooks/useRegions';

export interface ToponymDetailLayoutProps {
  mode?: 'add' | 'edit' | 'detail';
  initialData?: any;
  onSubmitAction?: (data: any) => void;
  onCancelAction?: () => void;
  onRejectAction?: () => void;
  onApproveAction?: () => void;
  isSubmitting?: boolean;
  isVerifikator?: boolean;
}

const ToponymDetailLayout = ({
  mode = 'add',
  initialData,
  onSubmitAction,
  onCancelAction,
  onRejectAction,
  onApproveAction,
  isSubmitting = false,
  isVerifikator = false,
}: ToponymDetailLayoutProps) => {
  const { token } = useAuth();
  const { control, handleSubmit: hookFormSubmit, setValue, reset, watch, getValues } = useForm({
    defaultValues: {
      elemenGenerik: '',
      elemenSpesifik: '',
      namaRupabumi: '',
      namaLokal: '',
      namaLain: '',
      asalBahasa: '',
      artiNama: '',
      sejarahNama: '',
      pelafalan: '',
      ejaan: '',
      jenisUnsur: '',
      provinsi: '',
      kabupatenKota: '',
      kecamatan: '',
      desaKelurahan: '',
      tanggalSurvey: '',
      foto: null as File | null,
      sketsaLokasi: null as File | null,
      rekamanSuaraPengucapan: null as File | null,
      rekamanAudioVisual: null as File | null,
      dokumenPendukung: null as File | null,
      fotoUrl: null as string | null,
      sketsaLokasiUrl: null as string | null,
      rekamanSuaraPengucapanUrl: null as string | null,
      rekamanAudioVisualUrl: null as string | null,
      dokumenPendukungUrl: null as string | null,
    }
  });

  const formData = watch();
  const setFieldValue = useCallback((field: any, value: any) => setValue(field, value, { shouldValidate: true, shouldDirty: true }), [setValue]);
  const setAllFormData = useCallback((data: any) => reset({ ...getValues(), ...data }), [reset, getValues]);
  const resetForm = useCallback(() => reset(), [reset]);
  const [currentMode, setCurrentMode] = useState<ToponymDetailLayoutProps['mode']>(mode);
  const [isVerifikatorMode, setIsVerifikatorMode] = useState<boolean>(isVerifikator);

  // Sync prop changes if mode changes from parent
  useEffect(() => {
    setCurrentMode(mode);
    setIsVerifikatorMode(isVerifikator);
  }, [mode, isVerifikator]);

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

  const [regionOptions, setRegionOptions] = useState({
    provinsi: [] as { label: string, value: string }[],
    kabupatenKota: [] as { label: string, value: string }[],
    kecamatan: [] as { label: string, value: string }[],
    desaKelurahan: [] as { label: string, value: string }[],
    jenisUnsur: [] as { label: string, value: string }[],
    elemenGenerik: [] as { label: string, value: string }[],
  });

  // Flag to prevent auto-generate namaRupabumi from overriding freshly loaded API data
  const isLoadingFromApi = useRef(false);

  const [selectedPaths, setSelectedPaths] = useState({
    provinsi: "",
    kabupatenKota: "",
    kecamatan: ""
  });

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

  useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'detail')) {
      // Mark as loading from API: suppress auto-generate effect temporarily
      isLoadingFromApi.current = true;

      // Mapping API (snake_case) to Form Store (camelCase)
      setAllFormData({
        elemenGenerik: initialData.generic_element || "",
        elemenSpesifik: initialData.specific_element || "",
        namaRupabumi: initialData.map_name || "",
        namaLokal: initialData.local_name || "",
        namaLain: initialData.other_name || "",
        asalBahasa: initialData.language_origin || "",
        artiNama: initialData.name_meaning || "",
        sejarahNama: initialData.name_history || "",
        pelafalan: initialData.pronounciation || "",
        ejaan: initialData.spelling || "",
        jenisUnsur: initialData.element_id || "",
        provinsi: initialData.province_id || "",
        kabupatenKota: initialData.regency_id || "",
        kecamatan: initialData.district_id || "",
        desaKelurahan: initialData.village_id || "",
        tanggalSurvey: initialData.survey_at ? initialData.survey_at.substring(0, 10) : "",
        // Existing media URLs from API
        fotoUrl: initialData.photos?.[0]?.url || null,
        sketsaLokasiUrl: initialData.sketch || null,
        rekamanSuaraPengucapanUrl: initialData.pronounciation_audio || null,
        rekamanAudioVisualUrl: initialData.video || null,
        dokumenPendukungUrl: initialData.support_document || null,
      });

      // Populate paths for dynamic fetching
      setSelectedPaths({
        provinsi: initialData.province?.path || "",
        kabupatenKota: initialData.regency?.path || "",
        kecamatan: initialData.district?.path || "",
      });

      // Populate initial labels for dropdowns
      setRegionOptions({
        provinsi: initialData.province ? [{ value: initialData.province_id, label: initialData.province.name }] : [],
        kabupatenKota: initialData.regency ? [{ value: initialData.regency_id, label: initialData.regency.name }] : [],
        kecamatan: initialData.district ? [{ value: initialData.district_id, label: initialData.district.name }] : [],
        desaKelurahan: initialData.village ? [{ value: initialData.village_id, label: initialData.village.name }] : [],
        jenisUnsur: initialData.element ? [{ value: initialData.element_id, label: initialData.element.name }] : [],
        elemenGenerik: initialData.generic_element ? [{ value: initialData.generic_element, label: initialData.generic_element }] : [],
      });

      // Mapping Geometry — match API geometry_type values: 'Point', 'LineString', 'MultiPolygon'
      if (initialData.location_point && initialData.geometry_type === 'Point') {
        const [lng, lat] = initialData.location_point.coordinates;
        setDrawnPoint({ lat, lng });
        setDrawType("Point");
      } else if (initialData.location_line && initialData.geometry_type === 'LineString') {
        const points = initialData.location_line.coordinates.map((coord: [number, number]) => ({
          lng: coord[0],
          lat: coord[1]
        }));
        setDrawnLine(points);
        setDrawType("Line");
      } else if (initialData.location_area && initialData.geometry_type === 'MultiPolygon') {
        // MultiPolygon coordinates: [ [ [ [lng, lat], ... ] ] ] (3-level nesting)
        const polys = (initialData.location_area.coordinates as [number, number][][][]).map(
          (multiRing) => multiRing[0].map((coord) => ({ lng: coord[0], lat: coord[1] }))
        );
        setDrawnPolygon(polys);
        setDrawType("Polygon");
      } else if (initialData.location_area && initialData.geometry_type === 'Polygon') {
        // Fallback for plain Polygon type
        const polys = (initialData.location_area.coordinates as [number, number][][]).map(
          (ring) => ring.map((coord) => ({ lng: coord[0], lat: coord[1] }))
        );
        setDrawnPolygon(polys);
        setDrawType("Polygon");
      }

      // Release the flag on the next tick after all state updates have been applied
      setTimeout(() => { isLoadingFromApi.current = false; }, 0);

    } else if (mode === 'add') {
      // Only reset form when explicitly opening in 'add' mode
      resetForm();
    }
  }, [initialData, mode, setAllFormData, resetForm]);

  // Auto-generate Nama Rupabumi from Generik + Spesifik
  // Skip if we are in the middle of loading data from API (to prevent overriding the loaded namaRupabumi)
  useEffect(() => {
    if (currentMode === 'detail') return;
    if (isLoadingFromApi.current) return;

    const generik = formData.elemenGenerik?.trim() || "";
    const spesifik = formData.elemenSpesifik?.trim() || "";
    const combined = `${generik} ${spesifik}`.trim();

    if (combined !== formData.namaRupabumi) {
      setFieldValue('namaRupabumi', combined);
    }
  }, [formData.elemenGenerik, formData.elemenSpesifik, currentMode, setFieldValue, formData.namaRupabumi]);

  // Fetching dynamic regions
  const { data: provincesRes } = useProvinces(token);
  const { data: citiesRes } = useCities(selectedPaths.provinsi, token);
  const { data: districtsRes } = useDistricts(selectedPaths.kabupatenKota, token);
  const { data: villagesRes } = useVillages(selectedPaths.kecamatan, token);
  const { data: elementsRes } = useElements(token);
  const { data: genericElementsRes } = useGenericElements(token);

  // Helper to merge initial label with list options
  const getOptions = (dynamicData: any, initialOptions: any[]) => {
    const list = dynamicData?.data?.map((item: any) => ({ label: item.name, value: item.code || item.name })) || [];
    // If we have an initial option (label) but it's not in the list yet, keep it
    if (initialOptions.length > 0 && !list.find((opt: any) => opt.value === initialOptions[0].value)) {
      return [...initialOptions, ...list];
    }
    return list;
  };

  const provinceOptions = getOptions(provincesRes, regionOptions.provinsi);
  const cityOptions = getOptions(citiesRes, regionOptions.kabupatenKota);
  const districtOptions = getOptions(districtsRes, regionOptions.kecamatan);
  const villageOptions = getOptions(villagesRes, regionOptions.desaKelurahan);
  const elementOptions = getOptions(elementsRes, regionOptions.jenisUnsur);
  const genericElementOptions = getOptions(genericElementsRes, regionOptions.elemenGenerik);

  const handleSubmit = (data: typeof formData) => {
    if (onSubmitAction) {
      onSubmitAction({
        ...data,
        _geometry: {
          drawType,
          drawnPoint,
          drawnLine,
          drawnPolygon,
        },
      });
    } else {
      console.log("Form Data:", data);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancelAction) {
      onCancelAction();
    }
  };

  const isReadOnly = currentMode === 'detail';

  // Zoom map to location_point from API (always present on edit/detail)
  const initialCenter = (initialData?.location_point?.coordinates)
    ? { lng: initialData.location_point.coordinates[0], lat: initialData.location_point.coordinates[1] }
    : null;

  return (
    <div className={`flex w-full h-full bg-gray-50 overflow-hidden ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className={`h-full bg-white p-5 overflow-y-auto z-10 shrink-0 shadow-sm space-y-5 ${isResizing ? 'pointer-events-none' : ''}`}
      >
        <h2 className="text-xl font-bold text-gray-900">Data Toponim</h2>
        <form onSubmit={hookFormSubmit(handleSubmit)} className="flex flex-col gap-5 w-full" noValidate>
          <fieldset disabled={isReadOnly} className={`space-y-5 w-full min-w-0`}>

            {!isReadOnly && (!isDrawingMode ? (
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
                      setIsDrawingMode(false);
                    }}
                    className='w-full text-sm col-span-2'
                  />
                </div>
              </div>
            ))}

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
              value={formData.elemenGenerik}
              onChange={(val) => setFieldValue('elemenGenerik', val)}
              options={genericElementOptions}
              searchable={true}
              required={true}
              allowCustomValue={true}
              disabled={isReadOnly}
            />
            <TextInput
              id='elemen-spesifik'
              label="Elemen Spesifik"
              value={formData.elemenSpesifik}
              onChange={(e) => setFieldValue('elemenSpesifik', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <TextInput
              id='nama-rupabumi'
              label="Nama Rupabumi"
              value={formData.namaRupabumi}
              onChange={(e) => setFieldValue('namaRupabumi', e.target.value)}
              disabled={isReadOnly || true}
            />
            <TextInput
              id='nama-lokal'
              label="Nama Lokal"
              value={formData.namaLokal}
              onChange={(e) => setFieldValue('namaLokal', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <TextInput
              id='nama-lain'
              label="Nama Lain"
              value={formData.namaLain}
              onChange={(e) => setFieldValue('namaLain', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <TextInput
              id='asal-bahasa'
              label="Asal Bahasa"
              value={formData.asalBahasa}
              onChange={(e) => setFieldValue('asalBahasa', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <TextInput
              id='arti-nama'
              label="Arti Nama"
              value={formData.artiNama}
              onChange={(e) => setFieldValue('artiNama', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <TextBoxInput
              id='sejarah-nama'
              label="Sejarah Nama"
              value={formData.sejarahNama}
              onChange={(e) => setFieldValue('sejarahNama', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <TextInput
              id='pelafalan'
              label="Pelafalan"
              value={formData.pelafalan}
              onChange={(e) => setFieldValue('pelafalan', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <TextInput
              id='ejaan'
              label="Ejaan"
              value={formData.ejaan}
              onChange={(e) => setFieldValue('ejaan', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <DropdownInput
              label="Jenis Unsur"
              placeholder='Jenis Unsur'
              value={formData.jenisUnsur}
              onChange={(val) => setFieldValue('jenisUnsur', val)}
              options={elementOptions}
              searchable={true}
              required={true}
              disabled={isReadOnly}
            />
            <DropdownInput
              label="Provinsi"
              placeholder='Provinsi'
              value={formData.provinsi}
              onChange={(val) => {
                setFieldValue('provinsi', val);
                // Find path for child fetching
                const path = provincesRes?.data?.find(p => p.code === val)?.path || "";
                setSelectedPaths(prev => ({ ...prev, provinsi: path, kabupatenKota: "", kecamatan: "" }));

                // Reset children when parent changes
                setFieldValue('kabupatenKota', '');
                setFieldValue('kecamatan', '');
                setFieldValue('desaKelurahan', '');
              }}
              options={provinceOptions}
              searchable={true}
              required={true}
              disabled={isReadOnly}
            />
            <DropdownInput
              label="Kabupaten/ Kota"
              placeholder='Kabupaten/ Kota'
              value={formData.kabupatenKota}
              onChange={(val) => {
                setFieldValue('kabupatenKota', val);
                const path = citiesRes?.data?.find(c => c.code === val)?.path || "";
                setSelectedPaths(prev => ({ ...prev, kabupatenKota: path, kecamatan: "" }));

                setFieldValue('kecamatan', '');
                setFieldValue('desaKelurahan', '');
              }}
              options={cityOptions}
              searchable={true}
              required={true}
              disabled={isReadOnly}
            />
            <DropdownInput
              label="Kecamatan"
              placeholder='Kecamatan'
              value={formData.kecamatan}
              onChange={(val) => {
                setFieldValue('kecamatan', val);
                const path = districtsRes?.data?.find(d => d.code === val)?.path || "";
                setSelectedPaths(prev => ({ ...prev, kecamatan: path }));

                setFieldValue('desaKelurahan', '');
              }}
              options={districtOptions}
              searchable={true}
              required={true}
              disabled={isReadOnly}
            />
            <DropdownInput
              label="Desa/ Kelurahan"
              placeholder='Desa/ Kelurahan'
              value={formData.desaKelurahan}
              onChange={(val) => setFieldValue('desaKelurahan', val)}
              options={villageOptions}
              searchable={true}
              required={true}
              disabled={isReadOnly}
            />
            <CalendarInput
              id='tanggal-survey'
              label="Tanggal Survey"
              value={formData.tanggalSurvey}
              onChange={(e) => setFieldValue('tanggalSurvey', e.target.value)}
              required={true}
              disabled={isReadOnly}
            />
            <FileInput
              id='foto'
              label="Foto"
              onChange={(file) => setFieldValue('foto', file)}
              required={true}
              accept='.jpg, .jpeg, .png'
              maxSizeMB={3}
              icon={<Camera size={20} className='text-gray-500' />}
              initialUrl={formData.fotoUrl}
              disabled={isReadOnly}
            />
            <FileInput
              id='sketsa-lokasi'
              label="Sketsa Lokasi"
              onChange={(file) => setFieldValue('sketsaLokasi', file)}
              accept='.jpg, .jpeg, .png'
              maxSizeMB={5}
              icon={<MapPin size={20} className='text-gray-500' />}
              initialUrl={formData.sketsaLokasiUrl}
              disabled={isReadOnly}
            />
            <FileInput
              id='rekaman-suara-pengucapan'
              label="Rekaman Suara Pengucapan"
              onChange={(file) => setFieldValue('rekamanSuaraPengucapan', file)}
              accept='.mp3, .wav'
              maxSizeMB={5}
              icon={<Mic size={20} className='text-gray-500' />}
              initialUrl={formData.rekamanSuaraPengucapanUrl}
              disabled={isReadOnly}
            />
            <FileInput
              id='rekaman-audio-visual'
              label="Rekaman Audio Visual"
              onChange={(file) => setFieldValue('rekamanAudioVisual', file)}
              accept='.mp4, .avi, .mov'
              maxSizeMB={5}
              icon={<Camera size={20} className='text-gray-500' />}
              initialUrl={formData.rekamanAudioVisualUrl}
              disabled={isReadOnly}
            />
            <FileInput
              id='dokumen-pendukung'
              label="Dokumen Pendukung"
              onChange={(file) => setFieldValue('dokumenPendukung', file)}
              accept='.pdf, .doc, .docx'
              maxSizeMB={5}
              icon={<File size={20} className='text-gray-500' />}
              initialUrl={formData.dokumenPendukungUrl}
              disabled={isReadOnly}
            />
          </fieldset>
          <div className="flex gap-3">
            {!isReadOnly && (
              <>
                {/* <ButtonComponent
                  label="Batal"
                  onClick={handleCancel}
                  secondary={true}
                  className='w-full'
                /> */}
                <ButtonComponent
                  label={isSubmitting ? "Menyimpan..." : "Simpan"}
                  className='w-full'
                  type='submit'
                  disabled={isSubmitting}
                />
              </>
            )}
          </div>
        </form>
        {isVerifikatorMode && (
          <div className='grid grid-cols-2 gap-3'>
            <ButtonComponent
              label="Edit"
              className='w-full col-span-2'
              secondary={true}
              onClick={() => {
                setCurrentMode('edit');
                setIsVerifikatorMode(false);
              }}
            />
            <ButtonComponent
              label="Tolak"
              className='w-full border-red-600 text-red-600'
              secondary={true}
              onClick={() => {

                if (onRejectAction) onRejectAction();
              }}
            />
            <ButtonComponent
              label="Setujui"
              className='w-full'
              onClick={() => {
                if (onApproveAction) onApproveAction();
              }}
            />
          </div>
        )}
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
          initialCenter={initialCenter}
        />
      </div>
    </div>
  )
}

export default ToponymDetailLayout