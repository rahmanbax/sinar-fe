"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronLeft, Layers, Minus, Plus, RotateCcw, Save, MousePointer, CircleDot, Trash2, Loader2 } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { Map, Source, Layer, Marker, type MapRef, type ViewState, type MapLayerMouseEvent } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FeatureCollection, Feature, Point, LineString, Polygon } from 'geojson'
import { IoLocationSharp } from 'react-icons/io5'
import { API_URL } from "@/lib/config"

// Category type from API
interface Category {
    id: number
    code: string
    name: string
}

interface PreviewMapProps {
    isEditing: boolean
    geometriType: 'titik' | 'garis' | 'area'
    snappingEnabled: boolean
    drawnPoints: [number, number][]
    onPointsChange: (points: [number, number][]) => void
    savedGeometry: FeatureCollection | null
    onClearSaved: () => void
    onSave: () => void
    onUndo: () => void
}

const PreviewMap: React.FC<PreviewMapProps> = ({
    isEditing,
    geometriType,
    snappingEnabled,
    drawnPoints,
    onPointsChange,
    savedGeometry,
    onClearSaved,
    onSave,
    onUndo
}) => {
    const mapRef = useRef<MapRef>(null)
    const [showLayerMenu, setShowLayerMenu] = useState(false)
    const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null)

    const initialViewState: ViewState = {
        longitude: big_office_coord.longitude,
        latitude: big_office_coord.latitude,
        zoom: 4.55,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0 }
    }

    const [viewState, setViewState] = useState(initialViewState)
    const [mapStyle, setMapStyle] = useState(MapStyles[0])

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

    // Snapping logic - find nearest point within threshold
    const snapToNearestPoint = useCallback((lng: number, lat: number): [number, number] => {
        if (!snappingEnabled || drawnPoints.length === 0) {
            return [lng, lat]
        }

        const threshold = 0.001 // ~100m at equator
        let nearestPoint: [number, number] = [lng, lat]
        let minDistance = Infinity

        for (const point of drawnPoints) {
            const distance = Math.sqrt(
                Math.pow(point[0] - lng, 2) + Math.pow(point[1] - lat, 2)
            )
            if (distance < threshold && distance < minDistance) {
                minDistance = distance
                nearestPoint = point
            }
        }

        return nearestPoint
    }, [snappingEnabled, drawnPoints])

    // Handle map click for drawing
    const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
        if (!isEditing) return

        // Clear saved geometry when starting new drawing
        if (drawnPoints.length === 0) {
            onClearSaved()
        }

        const { lng, lat } = e.lngLat
        const snappedPoint = snapToNearestPoint(lng, lat)

        if (geometriType === 'titik') {
            // Point mode - replace with single point
            onPointsChange([snappedPoint])
        } else {
            // Line/Polygon mode - add point
            onPointsChange([...drawnPoints, snappedPoint])
        }
    }, [isEditing, geometriType, drawnPoints, onPointsChange, snapToNearestPoint, onClearSaved])

    // Handle double-click to finish line/polygon
    const handleMapDblClick = useCallback((e: MapLayerMouseEvent) => {
        if (!isEditing || geometriType === 'titik') return
        e.preventDefault()

        // Finish drawing - trigger save
        if (drawnPoints.length >= 2) {
            onSave()
        }
    }, [isEditing, geometriType, drawnPoints, onSave])

    // Handle mouse move for cursor tracking
    const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
        if (!isEditing) return
        setCursorPosition([e.lngLat.lng, e.lngLat.lat])
    }, [isEditing])

    // Build GeoJSON for current drawing
    const currentDrawingGeoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    // Add drawn points as features
    if (drawnPoints.length > 0) {
        // Points layer
        drawnPoints.forEach((point, idx) => {
            currentDrawingGeoJson.features.push({
                type: 'Feature',
                properties: { id: idx },
                geometry: { type: 'Point', coordinates: point }
            })
        })

        // Line/Polygon layer
        if (geometriType === 'garis' && drawnPoints.length >= 2) {
            const lineCoords = cursorPosition
                ? [...drawnPoints, cursorPosition]
                : drawnPoints
            currentDrawingGeoJson.features.push({
                type: 'Feature',
                properties: { type: 'line' },
                geometry: { type: 'LineString', coordinates: lineCoords }
            })
        } else if (geometriType === 'area' && drawnPoints.length >= 2) {
            const polygonCoords = cursorPosition
                ? [...drawnPoints, cursorPosition, drawnPoints[0]]
                : [...drawnPoints, drawnPoints[0]]
            currentDrawingGeoJson.features.push({
                type: 'Feature',
                properties: { type: 'polygon' },
                geometry: { type: 'Polygon', coordinates: [polygonCoords] }
            })
        }
    }

    return (
        <div className="w-full h-full relative">
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle.src}
                onMove={e => setViewState(e.viewState)}
                onClick={handleMapClick}
                onDblClick={handleMapDblClick}
                onMouseMove={handleMouseMove}
                cursor={isEditing ? 'crosshair' : 'grab'}
                maxBounds={[
                    [92, -12],
                    [142, 7]
                ]}
            >
                {/* Saved Geometry Layer */}
                {savedGeometry && (
                    <>
                        <Source id="saved-geometry" type="geojson" data={savedGeometry}>
                            <Layer
                                id="saved-polygon-fill"
                                type="fill"
                                filter={['==', ['geometry-type'], 'Polygon']}
                                paint={{
                                    'fill-color': '#10b981',
                                    'fill-opacity': 0.3
                                }}
                            />
                            <Layer
                                id="saved-line"
                                type="line"
                                filter={['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'Polygon']]}
                                paint={{
                                    'line-color': '#10b981',
                                    'line-width': 2
                                }}
                            />
                        </Source>
                        {/* Render saved points as Markers with location icon */}
                        {savedGeometry.features
                            .filter(f => f.geometry.type === 'Point')
                            .map((feature, idx) => {
                                const coords = (feature.geometry as Point).coordinates as [number, number]
                                return (
                                    <Marker
                                        key={`saved-point-${idx}`}
                                        longitude={coords[0]}
                                        latitude={coords[1]}
                                        anchor="bottom"
                                    >
                                        <IoLocationSharp className='text-3xl text-blue-600 drop-shadow-lg' />
                                    </Marker>
                                )
                            })
                        }
                    </>
                )}

                {/* Current Drawing Layer */}
                {isEditing && currentDrawingGeoJson.features.length > 0 && (
                    <>
                        <Source id="current-drawing" type="geojson" data={currentDrawingGeoJson}>
                            <Layer
                                id="drawing-polygon-fill"
                                type="fill"
                                filter={['==', ['geometry-type'], 'Polygon']}
                                paint={{
                                    'fill-color': '#3b82f6',
                                    'fill-opacity': 0.2
                                }}
                            />
                            <Layer
                                id="drawing-line"
                                type="line"
                                filter={['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'Polygon']]}
                                paint={{
                                    'line-color': '#3b82f6',
                                    'line-width': 2,
                                    'line-dasharray': [2, 2]
                                }}
                            />
                            {/* Circle points only for line/polygon modes */}
                            {geometriType !== 'titik' && (
                                <Layer
                                    id="drawing-points"
                                    type="circle"
                                    filter={['==', ['geometry-type'], 'Point']}
                                    paint={{
                                        'circle-radius': 6,
                                        'circle-color': '#3b82f6',
                                        'circle-stroke-width': 2,
                                        'circle-stroke-color': '#ffffff'
                                    }}
                                />
                            )}
                        </Source>
                        {/* Marker icon for point mode */}
                        {geometriType === 'titik' && drawnPoints.map((point, idx) => (
                            <Marker
                                key={`drawing-point-${idx}`}
                                longitude={point[0]}
                                latitude={point[1]}
                                anchor="bottom"
                            >
                                <IoLocationSharp className='text-3xl text-blue-600 drop-shadow-lg opacity-70' />
                            </Marker>
                        ))}
                    </>
                )}
            </Map>

            {/* Drawing Mode Indicator */}
            {isEditing && (
                <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <CircleDot size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">
                        Mode: {geometriType === 'titik' ? 'Titik' : geometriType === 'garis' ? 'Garis' : 'Area'}
                        {snappingEnabled && ' (Snapping ON)'}
                    </span>
                </div>
            )}

            {/* Instructions */}
            {isEditing && (
                <div className="absolute bottom-20 left-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-[200px]">
                    {geometriType === 'titik' ? (
                        <p>Klik pada peta untuk menempatkan titik</p>
                    ) : (
                        <p>Klik untuk menambah titik, double-click untuk selesai</p>
                    )}
                </div>
            )}

            {/* Map Controls - Bottom Right */}
            <div className="absolute bottom-12 right-4 flex flex-col gap-2">
                {/* Layer Toggle */}
                <div className="relative">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-white shadow-lg"
                        onClick={() => setShowLayerMenu(!showLayerMenu)}
                    >
                        <Layers size={18} />
                    </Button>

                    {showLayerMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[150px]">
                            {MapStyles.map((style) => (
                                <button
                                    key={style.label}
                                    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${mapStyle.label === style.label ? 'bg-blue-100 text-blue-700' : ''
                                        }`}
                                    onClick={() => {
                                        setMapStyle(style)
                                        setShowLayerMenu(false)
                                    }}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Zoom Controls */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white shadow-lg"
                    onClick={handleZoomIn}
                >
                    <Plus size={18} />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white shadow-lg"
                    onClick={handleZoomOut}
                >
                    <Minus size={18} />
                </Button>
            </div>
        </div>
    )
}


const Page = () => {
    const [openSpasial, setOpenSpasial] = useState(true)
    const [openAtribut, setOpenAtribut] = useState(true)

    // Spasial/Geometri
    const [isEditingDraft, setIsEditingDraft] = useState(false)
    const [geometriType, setGeometriType] = useState<'titik' | 'garis' | 'area'>('titik')
    const [fiturSnapping, setFiturSnapping] = useState(false)

    // Drawing state
    const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([])
    const [savedGeometry, setSavedGeometry] = useState<FeatureCollection | null>(null)
    const [historyStack, setHistoryStack] = useState<[number, number][][]>([])

    // Atribut
    const [elemenGenerik, setElemenGenerik] = useState('')
    const [elemenSpesifik, setElemenSpesifik] = useState('')
    const [jenisUnsur, setJenisUnsur] = useState('')
    const [lingkup, setLingkup] = useState('')
    const [kabupatenKota, setKabupatenKota] = useState('')
    const [kecamatan, setKecamatan] = useState('')
    const [desaKelurahan, setDesaKelurahan] = useState('')

    const namaRupabumi = elemenGenerik && elemenSpesifik
        ? `${elemenGenerik} ${elemenSpesifik}`
        : ''

    // Category data from API
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/classification/categories?sort_by=name&sort_order=asc`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setCategories(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err)
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    // Handle points change with history
    const handlePointsChange = useCallback((points: [number, number][]) => {
        setHistoryStack(prev => [...prev, drawnPoints])
        setDrawnPoints(points)
    }, [drawnPoints])

    // Save geometry
    const handleSaveGeometry = useCallback(() => {
        if (drawnPoints.length === 0) return

        const features: Feature[] = []

        if (geometriType === 'titik' && drawnPoints.length >= 1) {
            features.push({
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: drawnPoints[0] }
            })
        } else if (geometriType === 'garis' && drawnPoints.length >= 2) {
            features.push({
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: drawnPoints }
            })
        } else if (geometriType === 'area' && drawnPoints.length >= 3) {
            features.push({
                type: 'Feature',
                properties: {},
                geometry: { type: 'Polygon', coordinates: [[...drawnPoints, drawnPoints[0]]] }
            })
        }

        if (features.length > 0) {
            setSavedGeometry({
                type: 'FeatureCollection',
                features
            })
            setDrawnPoints([])
            setHistoryStack([])
            setIsEditingDraft(false)
        }
    }, [drawnPoints, geometriType])

    // Undo last point
    const handleUndoGeometry = useCallback(() => {
        if (historyStack.length > 0) {
            const previousPoints = historyStack[historyStack.length - 1]
            setDrawnPoints(previousPoints)
            setHistoryStack(prev => prev.slice(0, -1))
        } else {
            setDrawnPoints([])
        }
    }, [historyStack])

    // Clear all drawing
    const handleClearGeometry = useCallback(() => {
        setDrawnPoints([])
        setSavedGeometry(null)
        setHistoryStack([])
    }, [])

    // Clear only saved geometry (for when starting new drawing)
    const handleClearSavedGeometry = useCallback(() => {
        setSavedGeometry(null)
    }, [])

    return (
        <ReviewerLayout>
            <div className="flex h-full pt-20">
                {/* Left Side - Form */}
                <div className="w-1/2 p-6 overflow-y-auto border-r">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/penelaahan">
                            <Button size='icon-sm' variant="ghost">
                                <ChevronLeft />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Tambah Usulan</h1>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        {/* Penggambaran Spasial/Geometri */}
                        <Collapsible open={openSpasial} onOpenChange={setOpenSpasial}>
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                <ChevronDown className={`transition-transform ${openSpasial ? '' : '-rotate-90'}`} size={20} />
                                Penggambaran Spasial/Geometri
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                {!isEditingDraft ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                        onClick={() => setIsEditingDraft(true)}
                                    >
                                        Edit Draf Penggambaran
                                    </Button>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Tipe/Jenis Geometri</Label>
                                            <RadioGroup value={geometriType} onValueChange={(v) => setGeometriType(v as 'titik' | 'garis' | 'area')} className="flex gap-6">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="titik" id="titik" />
                                                    <Label htmlFor="titik" className="font-normal">Titik</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="garis" id="garis" />
                                                    <Label htmlFor="garis" className="font-normal">Garis</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="area" id="area" />
                                                    <Label htmlFor="area" className="font-normal">Area</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="snapping"
                                                checked={fiturSnapping}
                                                onCheckedChange={(checked) => setFiturSnapping(checked as boolean)}
                                            />
                                            <Label htmlFor="snapping" className="font-normal">Fitur Snapping</Label>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" className="border-red-400 text-red-500 hover:bg-red-50" onClick={handleClearGeometry}>
                                                <Trash2 size={16} className="mr-2" />
                                                Bersihkan Penggambaran
                                            </Button>
                                            <Button variant="outline" className="border-orange-400 text-orange-500 hover:bg-orange-50" onClick={handleUndoGeometry}>
                                                <RotateCcw size={16} className="mr-2" />
                                                Kembali ke penggambaran sebelumnya
                                            </Button>
                                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveGeometry}>
                                                <Save size={16} className="mr-2" />
                                                Simpan penggambaran
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-gray-400 text-gray-600 hover:bg-gray-50"
                                                onClick={() => setIsEditingDraft(false)}
                                            >
                                                Batalkan
                                            </Button>
                                        </div>

                                        {/* Display coordinates */}
                                        {(drawnPoints.length > 0 || savedGeometry) && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <Label className="text-sm font-medium mb-2 block">Koordinat Titik</Label>
                                                {drawnPoints.length > 0 && (
                                                    <div className="space-y-1 text-sm">
                                                        <p className="text-gray-500 text-xs mb-1">Titik yang sedang digambar:</p>
                                                        {drawnPoints.map((point, idx) => (
                                                            <p key={idx} className="font-mono text-blue-600">
                                                                {geometriType === 'titik' ? '' : `${idx + 1}. `}
                                                                {point[1].toFixed(6)}, {point[0].toFixed(6)}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                {savedGeometry && savedGeometry.features.length > 0 && drawnPoints.length === 0 && (
                                                    <div className="space-y-1 text-sm">
                                                        <p className="text-gray-500 text-xs mb-1">Titik tersimpan:</p>
                                                        {savedGeometry.features.map((feature, idx) => {
                                                            if (feature.geometry.type === 'Point') {
                                                                const coords = (feature.geometry as Point).coordinates
                                                                return (
                                                                    <p key={idx} className="font-mono text-emerald-600">
                                                                        {coords[1].toFixed(6)}, {coords[0].toFixed(6)}
                                                                    </p>
                                                                )
                                                            } else if (feature.geometry.type === 'LineString') {
                                                                const coords = (feature.geometry as LineString).coordinates
                                                                return coords.map((c, i) => (
                                                                    <p key={`${idx}-${i}`} className="font-mono text-emerald-600">
                                                                        {i + 1}. {(c as number[])[1].toFixed(6)}, {(c as number[])[0].toFixed(6)}
                                                                    </p>
                                                                ))
                                                            } else if (feature.geometry.type === 'Polygon') {
                                                                const coords = (feature.geometry as Polygon).coordinates[0]
                                                                return coords.slice(0, -1).map((c, i) => (
                                                                    <p key={`${idx}-${i}`} className="font-mono text-emerald-600">
                                                                        {i + 1}. {(c as number[])[1].toFixed(6)}, {(c as number[])[0].toFixed(6)}
                                                                    </p>
                                                                ))
                                                            }
                                                            return null
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Pengisian Atribut */}
                        <Collapsible open={openAtribut} onOpenChange={setOpenAtribut}>
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                <ChevronDown className={`transition-transform ${openAtribut ? '' : '-rotate-90'}`} size={20} />
                                Pengisian Atribut
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="elemen-generik">Elemen Generik</Label>
                                    <Input
                                        id="elemen-generik"
                                        placeholder="Contoh: SMA Negeri"
                                        value={elemenGenerik}
                                        onChange={(e) => setElemenGenerik(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="elemen-spesifik">Elemen Spesifik</Label>
                                    <Input
                                        id="elemen-spesifik"
                                        placeholder="Contoh: 1 Jakarta"
                                        value={elemenSpesifik}
                                        onChange={(e) => setElemenSpesifik(e.target.value)}
                                    />
                                </div>

                                {namaRupabumi && (
                                    <p className="text-sm text-gray-500">
                                        Nama Rupabumi: {namaRupabumi}
                                    </p>
                                )}

                                <div className="space-y-2">
                                    <Label>Jenis Unsur Rupabumi</Label>
                                    <Select value={jenisUnsur} onValueChange={setJenisUnsur} disabled={loadingCategories}>
                                        <SelectTrigger>
                                            {loadingCategories ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Memuat...</span>
                                                </div>
                                            ) : (
                                                <SelectValue placeholder="Pilih Jenis Unsur" />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.code}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Lingkup</Label>
                                    <Select value={lingkup} onValueChange={setLingkup}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Lingkup" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="provinsi">Provinsi</SelectItem>
                                            <SelectItem value="kabupaten-kota">Kabupaten/Kota</SelectItem>
                                            <SelectItem value="kecamatan">Kecamatan</SelectItem>
                                            <SelectItem value="desa-kelurahan">Desa/Kelurahan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kab-kota">Kabupaten/Kota</Label>
                                    <Input
                                        id="kab-kota"
                                        placeholder="Kabupaten/Kota"
                                        value={kabupatenKota}
                                        onChange={(e) => setKabupatenKota(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kecamatan">Kecamatan</Label>
                                    <Input
                                        id="kecamatan"
                                        placeholder="Kecamatan"
                                        value={kecamatan}
                                        onChange={(e) => setKecamatan(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="desa-kelurahan">Desa/Kelurahan</Label>
                                    <Input
                                        id="desa-kelurahan"
                                        placeholder="Desa/Kelurahan"
                                        value={desaKelurahan}
                                        onChange={(e) => setDesaKelurahan(e.target.value)}
                                    />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Submit */}
                        <div className="flex gap-4 pt-6">
                            <Link href="/penelaahan" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                            <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                Simpan Usulan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Map */}
                <div className="w-1/2">
                    <PreviewMap
                        isEditing={isEditingDraft}
                        geometriType={geometriType}
                        snappingEnabled={fiturSnapping}
                        drawnPoints={drawnPoints}
                        onPointsChange={handlePointsChange}
                        savedGeometry={savedGeometry}
                        onClearSaved={handleClearSavedGeometry}
                        onSave={handleSaveGeometry}
                        onUndo={handleUndoGeometry}
                    />
                </div>
            </div>
        </ReviewerLayout>
    )
}

export default Page
