"use client"
import { useState, useRef, useEffect } from "react";
import { PiPencilSimpleLineDuotone } from 'react-icons/pi'
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/config";

import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronLeft, ChevronsDown, ChevronsUp, ChevronsUpDown, CircleUserRound, Database, X } from "lucide-react";
import ReviewerLayout from "@/layouts/ReviewerLayout";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
// import * as d3 from 'd3'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { Map, type MapRef, type ViewState, } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import Image from "next/image";
import StatisticTab from "../StatisticTab";
import MyTeamTab from "../MyTeamTab";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Minus, Plus } from "lucide-react";
import { Marker } from '@vis.gl/react-maplibre'
import { IoLocationSharp } from 'react-icons/io5'

interface PreviewMapProps {
    coordinates?: [number, number] | null
}

const PreviewMap: React.FC<PreviewMapProps> = ({ coordinates }) => {
    const mapRef = useRef<MapRef>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geoRef = useRef<maplibregl.GeolocateControl>(null);

    const [bearing, setBearing] = useState(0)
    const [showLayerMenu, setShowLayerMenu] = useState(false)

    // Validate coordinates
    const isValidCoordinates = (coords: [number, number] | null | undefined): coords is [number, number] => {
        if (!coords || coords.length !== 2) return false
        const [lng, lat] = coords
        return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90
    }

    const validCoordinates = isValidCoordinates(coordinates) ? coordinates : null

    const initialViewState: ViewState = {
        longitude: validCoordinates ? validCoordinates[0] : big_office_coord.longitude,
        latitude: validCoordinates ? validCoordinates[1] : big_office_coord.latitude,
        zoom: validCoordinates ? 14 : 4.55,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0 }
    };

    const [loadingStyle, setLoadingStyle] = useState(false)
    const [viewState, setViewState] = useState(initialViewState);
    const [mapStyle, setMapStyle] = useState(MapStyles[0])
    const [onHover, setOnHover] = useState<string | undefined>()

    // Update view when coordinates change
    useEffect(() => {
        if (validCoordinates && mapRef.current) {
            mapRef.current.flyTo({
                center: [validCoordinates[0], validCoordinates[1]],
                zoom: 14,
                duration: 1000
            })
        }
    }, [validCoordinates])

    const handleZoomIn = () => {
        if (mapRef.current) {
            const currentZoom = viewState.zoom
            mapRef.current.flyTo({ zoom: Math.min(currentZoom + 1, 18), duration: 300 })
        }
    }

    const handleZoomOut = () => {
        if (mapRef.current) {
            const currentZoom = viewState.zoom
            mapRef.current.flyTo({ zoom: Math.max(currentZoom - 1, 1), duration: 300 })
        }
    }

    const handleChangeStyle = (style: typeof MapStyles[0]) => {
        setMapStyle(style)
        setShowLayerMenu(false)
    }

    return (
        <div className="w-full h-full border-2 border-black relative">
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle.src}
                onMove={e => {
                    setViewState(e.viewState)
                    setBearing(e.viewState.bearing)
                }}
                maxBounds={[
                    [92, -12],
                    [142, 7]
                ]}
            >
                {/* Marker for toponym location */}
                {validCoordinates && (
                    <Marker
                        longitude={validCoordinates[0]}
                        latitude={validCoordinates[1]}
                        anchor="center"
                        pitchAlignment="map"
                    >
                        <IoLocationSharp className="text-3xl text-blue-600 drop-shadow-lg" />
                    </Marker>
                )}
            </Map>

            {/* Map Controls - Bottom Right */}
            <div className="absolute bottom-12 right-4 flex flex-col gap-2">
                {/* Layer Toggle */}
                <div className="relative">
                    {showLayerMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-2 min-w-[140px]">
                            {MapStyles.map((style) => (
                                <button
                                    key={style.label}
                                    onClick={() => handleChangeStyle(style)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${mapStyle.label === style.label ? 'bg-blue-100 text-blue-700 font-medium' : ''
                                        }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white shadow-md hover:bg-gray-100"
                        onClick={() => setShowLayerMenu(!showLayerMenu)}
                    >
                        <Layers size={18} />
                    </Button>
                </div>

                {/* Zoom Controls */}
                <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-none border-b hover:bg-gray-100"
                        onClick={handleZoomIn}
                    >
                        <Plus size={18} />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-none hover:bg-gray-100"
                        onClick={handleZoomOut}
                    >
                        <Minus size={18} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Toponym Detail API Response Type
interface ToponymDetail {
    id: string
    element_id: string
    local_name: string
    map_name: string
    other_name: string | null
    language_origin: string
    name_meaning: string | null
    name_history: string | null
    pronounciation: string | null
    spelling: string | null
    geometry_type: string
    location_point: {
        type: string
        coordinates: [number, number]
    } | null
    elevation_value: string
    country: string
    province_id: string
    regency_id: string
    district_id: string
    village_id: string | null
    survey_at: string | null
    source: string
    notes: string | null
    sketch: string | null
    photos: Array<{
        url: string
        size: number
        filename: string
        uploaded_at: string
        original_name: string
    }>
    utm_zone: string
    status: string
}

const Page = () => {
    const searchParams = useSearchParams()
    const transactionId = searchParams.get('transactionId')
    const toponymId = searchParams.get('toponymId')

    const [fullTab, setFulltab] = useState(false)
    const navbarRef = useRef<HTMLDivElement>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [openCollapsible, setOpenCollapsible] = useState({ toponim: true, additional: true })

    // API State
    const [toponymData, setToponymData] = useState<ToponymDetail | null>(null)
    const [loading, setLoading] = useState(true)

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedData, setEditedData] = useState<Partial<ToponymDetail>>({})
    const [saving, setSaving] = useState(false)

    const handleOpenCollapsible = (key: keyof typeof openCollapsible) => {
        setOpenCollapsible({ ...openCollapsible, [key]: !openCollapsible[key] })
    }

    const handleEditClick = () => {
        if (toponymData) {
            setEditedData({
                local_name: toponymData.local_name,
                map_name: toponymData.map_name,
                element_id: toponymData.element_id,
                name_meaning: toponymData.name_meaning,
                other_name: toponymData.other_name,
                language_origin: toponymData.language_origin,
                name_history: toponymData.name_history,
                pronounciation: toponymData.pronounciation,
                spelling: toponymData.spelling,
                notes: toponymData.notes,
                sketch: toponymData.sketch,
                survey_at: toponymData.survey_at
            })
            setIsEditMode(true)
        }
    }

    const handleCancelEdit = () => {
        setIsEditMode(false)
        setEditedData({})
    }

    const handleInputChange = (field: keyof ToponymDetail, value: string) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSaveChanges = async () => {
        if (!transactionId || !toponymId || !toponymData) return

        setSaving(true)
        try {
            const token = localStorage.getItem('token')

            // Map editedData and toponymData to the requested format
            const requestBody = {
                local_name: editedData.local_name || toponymData.local_name,
                map_name: editedData.map_name || toponymData.map_name,
                other_name: editedData.other_name || toponymData.other_name,
                language_origin: editedData.language_origin || toponymData.language_origin,
                name_meaning: editedData.name_meaning || toponymData.name_meaning,
                name_history: editedData.name_history || toponymData.name_history,
                pronounciation: editedData.pronounciation || toponymData.pronounciation,
                spelling: editedData.spelling || toponymData.spelling,
                element: editedData.element_id || toponymData.element_id,
                province_code: toponymData.province_id,
                regency_code: toponymData.regency_id,
                district_code: toponymData.district_id,
                village_code: toponymData.village_id,
                survey_at: editedData.survey_at || toponymData.survey_at,
                notes: editedData.notes || toponymData.notes,
                sketch: editedData.sketch || toponymData.sketch,
                photos: toponymData.photos || [],
                geometry: toponymData.location_point ? {
                    type: toponymData.geometry_type || toponymData.location_point.type,
                    coordinates: toponymData.location_point.coordinates
                } : null
            }

            const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })

            const result = await response.json()

            if (!result.error) {
                // Update local data with saved changes
                setToponymData(prev => prev ? { ...prev, ...editedData } : null)
                setIsEditMode(false)
                setEditedData({})
                alert('Perubahan berhasil disimpan!')
            } else {
                alert('Gagal menyimpan perubahan: ' + result.message)
            }
        } catch (error) {
            console.error('Failed to save changes:', error)
            alert('Terjadi kesalahan saat menyimpan perubahan')
        } finally {
            setSaving(false)
        }
    }

    const handleAccept = async () => {
        if (!transactionId || !toponymId) return

        if (!confirm('Apakah Anda yakin ingin menerima toponim ini?')) return

        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const result = await response.json()

            if (!result.error) {
                alert('Toponim berhasil diterima!')
                // Optionally redirect back to list
                // window.location.href = '/penelaahan'
            } else {
                alert('Gagal menerima toponim: ' + result.message)
            }
        } catch (error) {
            console.error('Failed to accept toponym:', error)
            alert('Terjadi kesalahan saat menerima toponim')
        } finally {
            setSaving(false)
        }
    }

    const handleReject = async () => {
        if (!transactionId || !toponymId) return

        if (!confirm('Apakah Anda yakin ingin menolak toponim ini?')) return

        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const result = await response.json()

            if (!result.error) {
                alert('Toponim berhasil ditolak!')
                // Optionally redirect back to list
                // window.location.href = '/penelaahan'
            } else {
                alert('Gagal menolak toponim: ' + result.message)
            }
        } catch (error) {
            console.error('Failed to reject toponym:', error)
            alert('Terjadi kesalahan saat menolak toponim')
        } finally {
            setSaving(false)
        }
    }

    // Fetch toponym detail data
    useEffect(() => {
        if (!transactionId || !toponymId) return

        const fetchToponymDetail = async () => {
            setLoading(true)
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result = await response.json()

                if (!result.error && result.data) {
                    setToponymData(result.data)
                }
            } catch (error) {
                console.error('Failed to fetch toponym detail:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchToponymDetail()
    }, [transactionId, toponymId])

    useEffect(() => {
        if (!navbarRef.current) return;

        // Observe height changes of navbar
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setNavbarHeight(entry.contentRect.height);
            }
        });

        observer.observe(navbarRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <ReviewerLayout navbarRef={navbarRef}>
            <div className="flex flex-col overflow-hidden grow pt-23 h-full">
                <div className="flex grow">
                    <div className="block w-3/4 py-4 px-6 overflow-y-scroll max-h-[83vh]">
                        <Link href="/penelaahan" className="flex items-center gap-3 mb-5">
                            <Button size='icon-sm'><ChevronLeft /></Button>
                            Kembali
                        </Link>
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-500">Memuat data toponim...</p>
                            </div>
                        ) : toponymData ? (
                            <>
                                <h3 className="text-xl font-bold mb-3">ID Toponim: {toponymData.id}</h3>
                                <div className="flex gap-3 mb-3">
                                    {!isEditMode ? (
                                        <>
                                            <Button
                                                onClick={handleReject}
                                                disabled={saving}
                                                className="bg-red-600 hover:bg-red-800"
                                            >
                                                <X /> Ditolak
                                            </Button>
                                            <Button
                                                onClick={handleAccept}
                                                disabled={saving}
                                                className="bg-green-700 hover:bg-green-800"
                                            >
                                                <Check /> Diterima
                                            </Button>
                                            <Button onClick={handleEditClick} variant="outline">
                                                <PiPencilSimpleLineDuotone className="mr-2" /> Edit
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleSaveChanges}
                                                disabled={saving}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                            </Button>
                                            <Button
                                                onClick={handleCancelEdit}
                                                variant="outline"
                                                disabled={saving}
                                            >
                                                Batalkan
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Collapsible open={openCollapsible.toponim} onOpenChange={() => handleOpenCollapsible('toponim')}>
                                        <div className="flex items-center justify-between gap-4 px-4">
                                            <h3 className="text-xl font-semibold">
                                                Informasi Unsur Rupabumi
                                            </h3>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <ChevronDown />
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="flex flex-col px-6 mt-3">
                                            <form action="">
                                                <FieldSet className="gap-y-3">
                                                    <FieldGroup className="flex flex-row">
                                                        <Field>
                                                            <FieldLabel htmlFor="local_name">
                                                                Nama Lokal
                                                            </FieldLabel>
                                                            <Input
                                                                id="local_name"
                                                                name="local_name"
                                                                value={isEditMode ? (editedData.local_name || '') : (toponymData.local_name || '')}
                                                                onChange={(e) => handleInputChange('local_name', e.target.value)}
                                                                readOnly={!isEditMode}
                                                            />
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="map_name">
                                                                Nama Peta
                                                            </FieldLabel>
                                                            <Input
                                                                id="map_name"
                                                                name="map_name"
                                                                value={isEditMode ? (editedData.map_name || '') : (toponymData.map_name || '')}
                                                                onChange={(e) => handleInputChange('map_name', e.target.value)}
                                                                readOnly={!isEditMode}
                                                            />
                                                        </Field>
                                                    </FieldGroup>
                                                    <Field>
                                                        <FieldLabel htmlFor="element_type">
                                                            Jenis Unsur Rupabumi
                                                        </FieldLabel>
                                                        <Input
                                                            id="element_type"
                                                            name="element_type"
                                                            value={isEditMode ? (editedData.element_id || '') : (toponymData.element_id || '')}
                                                            onChange={(e) => handleInputChange('element_id', e.target.value)}
                                                            readOnly={!isEditMode}
                                                        />
                                                    </Field>
                                                    <FieldGroup className="flex flex-row">
                                                        <Field>
                                                            <FieldLabel htmlFor="decimal_coordinate">
                                                                Koordinat (Derajat Desimal)
                                                            </FieldLabel>
                                                            <Input
                                                                id="decimal_coordinate"
                                                                name="decimal_coordinate"
                                                                value={toponymData.location_point ? `${toponymData.location_point.coordinates[1]}, ${toponymData.location_point.coordinates[0]}` : '-'}
                                                                readOnly
                                                            />
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="utm_zone">
                                                                Zona UTM
                                                            </FieldLabel>
                                                            <Input
                                                                id="utm_zone"
                                                                name="utm_zone"
                                                                value={toponymData.utm_zone || ''}
                                                                readOnly
                                                            />
                                                        </Field>
                                                    </FieldGroup>
                                                    <Field>
                                                        <FieldLabel htmlFor="name_meaning">
                                                            Arti Nama
                                                        </FieldLabel>
                                                        <Input
                                                            id="name_meaning"
                                                            name="name_meaning"
                                                            value={isEditMode ? (editedData.name_meaning || '') : (toponymData.name_meaning || '-')}
                                                            onChange={(e) => handleInputChange('name_meaning', e.target.value)}
                                                            readOnly={!isEditMode}
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="other_name">
                                                            Nama Lain
                                                        </FieldLabel>
                                                        <Input
                                                            id="other_name"
                                                            name="other_name"
                                                            value={isEditMode ? (editedData.other_name || '') : (toponymData.other_name || '-')}
                                                            onChange={(e) => handleInputChange('other_name', e.target.value)}
                                                            readOnly={!isEditMode}
                                                        />
                                                    </Field>
                                                    <FieldGroup className="flex flex-row">
                                                        <Field>
                                                            <FieldLabel htmlFor="language_origin">
                                                                Asal Bahasa
                                                            </FieldLabel>
                                                            <Input
                                                                id="language_origin"
                                                                name="language_origin"
                                                                value={isEditMode ? (editedData.language_origin || '') : (toponymData.language_origin || '-')}
                                                                onChange={(e) => handleInputChange('language_origin', e.target.value)}
                                                                readOnly={!isEditMode}
                                                            />
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="pronounciation">
                                                                Pengucapan
                                                            </FieldLabel>
                                                            <Input
                                                                id="pronounciation"
                                                                name="pronounciation"
                                                                value={isEditMode ? (editedData.pronounciation || '') : (toponymData.pronounciation || '-')}
                                                                onChange={(e) => handleInputChange('pronounciation', e.target.value)}
                                                                readOnly={!isEditMode}
                                                            />
                                                        </Field>
                                                    </FieldGroup>
                                                    <FieldGroup className="flex flex-row">
                                                        <Field>
                                                            <FieldLabel htmlFor="spelling">
                                                                Ejaan
                                                            </FieldLabel>
                                                            <Input
                                                                id="spelling"
                                                                name="spelling"
                                                                value={isEditMode ? (editedData.spelling || '') : (toponymData.spelling || '-')}
                                                                onChange={(e) => handleInputChange('spelling', e.target.value)}
                                                                readOnly={!isEditMode}
                                                            />
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="survey_at">
                                                                Tanggal Survei
                                                            </FieldLabel>
                                                            <Input
                                                                id="survey_at"
                                                                name="survey_at"
                                                                type={isEditMode ? "date" : "text"}
                                                                value={isEditMode ? (editedData.survey_at || '') : (toponymData.survey_at || '-')}
                                                                onChange={(e) => handleInputChange('survey_at', e.target.value)}
                                                                readOnly={!isEditMode}
                                                            />
                                                        </Field>
                                                    </FieldGroup>
                                                    <Field>
                                                        <FieldLabel htmlFor="name_history">
                                                            Sejarah Nama
                                                        </FieldLabel>
                                                        <Textarea
                                                            id="name_history"
                                                            name="name_history"
                                                            value={isEditMode ? (editedData.name_history || '') : (toponymData.name_history || '-')}
                                                            onChange={(e) => handleInputChange('name_history', e.target.value)}
                                                            readOnly={!isEditMode}
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="notes">
                                                            Catatan
                                                        </FieldLabel>
                                                        <Textarea
                                                            id="notes"
                                                            name="notes"
                                                            value={isEditMode ? (editedData.notes || '') : (toponymData.notes || '-')}
                                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                                            readOnly={!isEditMode}
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="sketch">
                                                            Sketsa (URL)
                                                        </FieldLabel>
                                                        <Input
                                                            id="sketch"
                                                            name="sketch"
                                                            value={isEditMode ? (editedData.sketch || '') : (toponymData.sketch || '-')}
                                                            onChange={(e) => handleInputChange('sketch', e.target.value)}
                                                            readOnly={!isEditMode}
                                                        />
                                                    </Field>
                                                </FieldSet>
                                            </form>
                                        </CollapsibleContent>
                                    </Collapsible>
                                    <Collapsible open={openCollapsible.additional} onOpenChange={() => handleOpenCollapsible('additional')}>
                                        <div className="flex items-center justify-between gap-4 px-4">
                                            <h3 className="text-xl font-semibold">
                                                Informasi Pendukung
                                            </h3>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <ChevronDown />
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="grid grid-cols-2 gap-x-6 gap-y-8 place-items-center px-6 mt-3">
                                            {toponymData.photos && toponymData.photos.length > 0 ? (
                                                toponymData.photos.map((photo, index) => (
                                                    <div key={index} className="w-48 h-32 relative">
                                                        <Image
                                                            src={photo.url}
                                                            alt={photo.filename}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="col-span-2 text-gray-500">Tidak ada foto</p>
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500">Data tidak ditemukan</p>
                        )}
                    </div>
                    <PreviewMap coordinates={toponymData?.location_point?.coordinates || null} />
                </div>
            </div>
        </ReviewerLayout>

    );
}

export default Page