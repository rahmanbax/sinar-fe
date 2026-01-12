"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown, ChevronLeft, Layers, Minus, Plus, RotateCcw, Save, CircleDot, Trash2, Loader2, Check, ChevronsUpDown, Camera, X } from "lucide-react"
import SurveyorLayout from "@/layouts/SurveryorLayout"
import Link from "next/link"
import { Map, Source, Layer, Marker, type MapRef, type ViewState, type MapLayerMouseEvent } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FeatureCollection, Feature, Point, LineString, Polygon } from 'geojson'
import { IoLocationSharp } from 'react-icons/io5'
import { API_URL } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Category type from API
interface Category {
    id: number
    code: string
    name: string
}

// SubCategory type from API
interface SubCategory {
    id: number
    code: string
    name: string
    category_id: number
}

// Province type from API
interface Province {
    id: number
    name: string
    code: string
    level: string
    path: string
}

// Region type for regency/district
interface Region {
    id: number
    name: string
    code: string
    level: string
    parent_id: number
    path: string
}

// Element type from API
interface Element {
    id: number
    code: string
    name: string
    subcategory_id: number
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
    const router = useRouter()
    const { token } = useAuth()
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

    // Form Atribut - Basic Info
    const [localName, setLocalName] = useState('')
    const [mapName, setMapName] = useState('')
    const [otherName, setOtherName] = useState('')
    const [languageOrigin, setLanguageOrigin] = useState('')
    const [nameMeaning, setNameMeaning] = useState('')
    const [nameHistory, setNameHistory] = useState('')
    const [pronounciation, setPronounciation] = useState('')
    const [spelling, setSpelling] = useState('')
    const [elementCode, setElementCode] = useState('')
    const [surveyAt, setSurveyAt] = useState('')

    // Region codes
    const [provinceCode, setProvinceCode] = useState('')
    const [regencyCode, setRegencyCode] = useState('')
    const [districtCode, setDistrictCode] = useState('')
    const [villageCode, setVillageCode] = useState('')

    // API Data
    const [provinces, setProvinces] = useState<Province[]>([])
    const [loadingProvinces, setLoadingProvinces] = useState(true)
    const [regencies, setRegencies] = useState<Region[]>([])
    const [loadingRegencies, setLoadingRegencies] = useState(false)
    const [districts, setDistricts] = useState<Region[]>([])
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [villages, setVillages] = useState<Region[]>([])
    const [loadingVillages, setLoadingVillages] = useState(false)

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Selected files for upload (stored locally until submit)
    const [selectedFiles, setSelectedFiles] = useState<{ file: File, previewUrl: string }[]>([])

    // Photo select handler (store locally, don't upload yet)
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const MAX_SIZE = 5 * 1024 * 1024 // 5MB in bytes
        const validFiles: { file: File, previewUrl: string }[] = []
        const rejectedFiles: string[] = []

        for (const file of Array.from(files)) {
            if (file.size > MAX_SIZE) {
                rejectedFiles.push(file.name)
            } else {
                validFiles.push({
                    file,
                    previewUrl: URL.createObjectURL(file)
                })
            }
        }

        if (rejectedFiles.length > 0) {
            alert(`File berikut melebihi ukuran maksimal 5MB:\n${rejectedFiles.join('\n')}`)
        }

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles])
        }

        // Reset input
        e.target.value = ''
    }

    // Remove selected photo
    const handleRemovePhoto = (index: number) => {
        setSelectedFiles(prev => {
            // Revoke object URL to free memory
            URL.revokeObjectURL(prev[index].previewUrl)
            return prev.filter((_, i) => i !== index)
        })
    }

    // Upload all photos (called during submit)
    const uploadPhotos = async (): Promise<{ url: string, filename: string }[]> => {
        const uploadedPhotos: { url: string, filename: string }[] = []

        for (const { file } of selectedFiles) {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const result = await res.json()
            if (!result.error && result.data) {
                uploadedPhotos.push({
                    url: result.data.url,
                    filename: file.name
                })
            } else {
                throw new Error(`Gagal upload ${file.name}: ${result.message}`)
            }
        }

        return uploadedPhotos
    }

    // Elements data
    const [elements, setElements] = useState<Element[]>([])
    const [loadingElements, setLoadingElements] = useState(true)
    const [openElementCombobox, setOpenElementCombobox] = useState(false)

    // Fetch provinces and elements on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch(`${API_URL}/regions?level=PROVINCE&limit=100`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setProvinces(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch provinces:', err)
            } finally {
                setLoadingProvinces(false)
            }
        }
        fetchProvinces()

        const fetchElements = async () => {
            try {
                const res = await fetch(`${API_URL}/classification/elements?sort_by=name&sort_order=asc`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setElements(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch elements:', err)
            } finally {
                setLoadingElements(false)
            }
        }
        fetchElements()
    }, [])

    // Fetch regencies when province changes
    useEffect(() => {
        if (!provinceCode) {
            setRegencies([])
            setRegencyCode('')
            setDistricts([])
            setDistrictCode('')
            setVillages([])
            setVillageCode('')
            return
        }
        const selectedProvince = provinces.find(p => p.code === provinceCode)
        if (!selectedProvince) return

        const fetchRegencies = async () => {
            setLoadingRegencies(true)
            try {
                const res = await fetch(`${API_URL}/regions?level=CITY&parent=${selectedProvince.path}&limit=100`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setRegencies(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch regencies:', err)
            } finally {
                setLoadingRegencies(false)
            }
        }
        fetchRegencies()
    }, [provinceCode, provinces])

    // Fetch districts when regency changes
    useEffect(() => {
        if (!regencyCode) {
            setDistricts([])
            setDistrictCode('')
            setVillages([])
            setVillageCode('')
            return
        }
        const selectedRegency = regencies.find(r => r.code === regencyCode)
        if (!selectedRegency) return

        const fetchDistricts = async () => {
            setLoadingDistricts(true)
            try {
                const res = await fetch(`${API_URL}/regions?level=DISTRICT&parent=${selectedRegency.path}&limit=100`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setDistricts(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch districts:', err)
            } finally {
                setLoadingDistricts(false)
            }
        }
        fetchDistricts()
    }, [regencyCode, regencies])

    // Fetch villages when district changes
    useEffect(() => {
        if (!districtCode) {
            setVillages([])
            setVillageCode('')
            return
        }
        const selectedDistrict = districts.find(d => d.code === districtCode)
        if (!selectedDistrict) return

        const fetchVillages = async () => {
            setLoadingVillages(true)
            try {
                const res = await fetch(`${API_URL}/regions?level=DISTRICT&parent=${selectedDistrict.path}&limit=100`)
                const result = await res.json()
                if (!result.error && result.data) {
                    setVillages(result.data)
                }
            } catch (err) {
                console.error('Failed to fetch villages:', err)
            } finally {
                setLoadingVillages(false)
            }
        }
        fetchVillages()
    }, [districtCode, districts])

    // Get geometry from saved geometry or drawn points
    const getGeometry = (): { type: string, coordinates: number[] | number[][] } | null => {
        if (savedGeometry && savedGeometry.features.length > 0) {
            const feature = savedGeometry.features[0]
            const geom = feature.geometry as { type: string, coordinates: number[] | number[][] }

            // API expects [lat, lng] format (non-standard), so we need to reverse coordinates
            if (geom.type === 'Point') {
                const coords = geom.coordinates as number[]
                return {
                    type: 'Point',
                    coordinates: [coords[1], coords[0]] // Reverse from [lng, lat] to [lat, lng]
                }
            }
            return geom
        }
        if (drawnPoints.length > 0) {
            // drawnPoints are in [lng, lat] format from map, reverse to [lat, lng] for API
            return {
                type: 'Point',
                coordinates: [drawnPoints[0][1], drawnPoints[0][0]] // Reverse to [lat, lng]
            }
        }
        return null
    }

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

    // Submit toponym
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const geometry = getGeometry()
        if (!geometry) {
            alert('Silakan gambar lokasi titik terlebih dahulu')
            return
        }

        setIsSubmitting(true)
        try {
            // Upload photos first if any
            let uploadedPhotos: { url: string, filename: string }[] = []
            if (selectedFiles.length > 0) {
                uploadedPhotos = await uploadPhotos()
            }

            const payload: Record<string, unknown> = {
                local_name: localName,
                geometry: geometry
            }

            // Optional fields
            if (mapName) payload.map_name = mapName
            if (otherName) payload.other_name = otherName
            if (languageOrigin) payload.language_origin = languageOrigin
            if (nameMeaning) payload.name_meaning = nameMeaning
            if (nameHistory) payload.name_history = nameHistory
            if (pronounciation) payload.pronounciation = pronounciation
            if (spelling) payload.spelling = spelling
            if (elementCode) payload.element_id = elementCode
            if (provinceCode) payload.province_code = provinceCode
            if (regencyCode) payload.regency_code = regencyCode
            if (districtCode) payload.district_code = districtCode
            if (villageCode) payload.village_code = villageCode
            if (surveyAt) payload.survey_at = surveyAt
            if (uploadedPhotos.length > 0) payload.photos = uploadedPhotos

            const res = await fetch(`${API_URL}/toponyms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const result = await res.json()
            if (!result.error) {
                alert('Toponim berhasil ditambahkan!')
                router.push('/survey')
            } else {
                alert(`Gagal: ${result.message}`)
            }
        } catch (err) {
            console.error('Failed to submit:', err)
            alert('Terjadi kesalahan saat menyimpan')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <SurveyorLayout>
            <div className="flex h-full pt-20">
                {/* Left Side - Form */}
                <div className="w-1/2 p-6 overflow-y-auto border-r">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/survey">
                            <Button size='icon-sm' variant="ghost">
                                <ChevronLeft />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Tambah Data Toponim</h1>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        {/* Penggambaran Spasial/Geometri */}
                        <Collapsible open={openSpasial} onOpenChange={setOpenSpasial}>
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                <ChevronDown className={`transition-transform ${openSpasial ? '' : '-rotate-90'}`} size={20} />
                                Penggambaran Lokasi
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                {!isEditingDraft ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                        onClick={() => setIsEditingDraft(true)}
                                    >
                                        Edit Lokasi di Peta
                                    </Button>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Tipe Geometri</Label>
                                            <RadioGroup value={geometriType} onValueChange={(v) => setGeometriType(v as 'titik' | 'garis' | 'area')} className="flex gap-6">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="titik" id="titik" />
                                                    <Label htmlFor="titik" className="font-normal">Titik</Label>
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
                                                Kembali ke sebelumnya
                                            </Button>
                                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveGeometry}>
                                                <Save size={16} className="mr-2" />
                                                Simpan Lokasi
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
                                                                {point[1].toFixed(6)}, {point[0].toFixed(6)}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Show saved coordinates when not editing */}
                                {!isEditingDraft && savedGeometry && savedGeometry.features.length > 0 && (
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <Label className="text-sm font-medium mb-2 block text-green-700">Lokasi Tersimpan</Label>
                                        {savedGeometry.features.map((feature, idx) => {
                                            if (feature.geometry.type === 'Point') {
                                                const coords = (feature.geometry as Point).coordinates
                                                return (
                                                    <p key={idx} className="font-mono text-green-600 text-sm">
                                                        Lat: {coords[1].toFixed(6)}, Lng: {coords[0].toFixed(6)}
                                                    </p>
                                                )
                                            }
                                            return null
                                        })}
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Pengisian Atribut */}
                        <Collapsible open={openAtribut} onOpenChange={setOpenAtribut}>
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                <ChevronDown className={`transition-transform ${openAtribut ? '' : '-rotate-90'}`} size={20} />
                                Informasi Toponim
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="local-name">Nama Lokal <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="local-name"
                                            placeholder="Contoh: Gunung Merapi"
                                            value={localName}
                                            onChange={(e) => setLocalName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="map-name">Nama di Peta <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="map-name"
                                            placeholder="Contoh: Gunung Merapi"
                                            value={mapName}
                                            onChange={(e) => setMapName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="other-name">Nama Lain <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="other-name"
                                            placeholder="Contoh: Mt. Merapi"
                                            value={otherName}
                                            onChange={(e) => setOtherName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="language-origin">Asal Bahasa <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="language-origin"
                                            placeholder="Contoh: Jawa"
                                            value={languageOrigin}
                                            onChange={(e) => setLanguageOrigin(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name-meaning">Arti Nama <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name-meaning"
                                            placeholder="Contoh: Gunung berapi"
                                            value={nameMeaning}
                                            onChange={(e) => setNameMeaning(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name-history">Sejarah Nama <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name-history"
                                            placeholder="Contoh: Digunakan sejak abad ke-15"
                                            value={nameHistory}
                                            onChange={(e) => setNameHistory(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pronounciation">Pelafalan <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="pronounciation"
                                            placeholder="Contoh: Gu-nung Me-ra-pi"
                                            value={pronounciation}
                                            onChange={(e) => setPronounciation(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="spelling">Ejaan <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="spelling"
                                            placeholder="Contoh: Gunung Merapi"
                                            value={spelling}
                                            onChange={(e) => setSpelling(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Elemen <span className="text-red-500">*</span></Label>
                                        <input type="hidden" value={elementCode} required />
                                        <Popover open={openElementCombobox} onOpenChange={setOpenElementCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openElementCombobox}
                                                    className="w-full justify-between font-normal"
                                                    disabled={loadingElements}
                                                >
                                                    {loadingElements ? (
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span>Memuat...</span>
                                                        </div>
                                                    ) : elementCode ? (
                                                        elements.find((e) => e.code === elementCode)?.name
                                                    ) : (
                                                        "Pilih Elemen"
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Cari elemen..." />
                                                    <CommandList>
                                                        <CommandEmpty>Elemen tidak ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {elements.map((element) => (
                                                                <CommandItem
                                                                    key={element.id}
                                                                    value={element.name}
                                                                    onSelect={() => {
                                                                        setElementCode(element.code)
                                                                        setOpenElementCombobox(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            elementCode === element.code ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {element.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Provinsi <span className="text-red-500">*</span></Label>
                                        <input type="hidden" value={provinceCode} required />
                                        <Select value={provinceCode} onValueChange={setProvinceCode} disabled={loadingProvinces}>
                                            <SelectTrigger>
                                                {loadingProvinces ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Memuat...</span>
                                                    </div>
                                                ) : (
                                                    <SelectValue placeholder="Pilih Provinsi" />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((province) => (
                                                    <SelectItem key={province.id} value={province.code}>
                                                        {province.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Kabupaten/Kota <span className="text-red-500">*</span></Label>
                                        <input type="hidden" value={regencyCode} required />
                                        <Select value={regencyCode} onValueChange={setRegencyCode} disabled={loadingRegencies || !provinceCode}>
                                            <SelectTrigger>
                                                {loadingRegencies ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Memuat...</span>
                                                    </div>
                                                ) : (
                                                    <SelectValue placeholder={provinceCode ? "Pilih Kabupaten/Kota" : "Pilih Provinsi terlebih dahulu"} />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regencies.map((regency) => (
                                                    <SelectItem key={regency.id} value={regency.code}>
                                                        {regency.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Kecamatan <span className="text-red-500">*</span></Label>
                                        <input type="hidden" value={districtCode} required />
                                        <Select value={districtCode} onValueChange={setDistrictCode} disabled={loadingDistricts || !regencyCode}>
                                            <SelectTrigger>
                                                {loadingDistricts ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Memuat...</span>
                                                    </div>
                                                ) : (
                                                    <SelectValue placeholder={regencyCode ? "Pilih Kecamatan" : "Pilih Kabupaten/Kota terlebih dahulu"} />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {districts.map((district) => (
                                                    <SelectItem key={district.id} value={district.code}>
                                                        {district.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Desa/Kelurahan <span className="text-red-500">*</span></Label>
                                        <input type="hidden" value={villageCode} required />
                                        <Select required value={villageCode} onValueChange={setVillageCode} disabled={loadingVillages || !districtCode}>
                                            <SelectTrigger>
                                                {loadingVillages ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Memuat...</span>
                                                    </div>
                                                ) : (
                                                    <SelectValue placeholder={districtCode ? "Pilih Kelurahan/Desa" : "Pilih Kecamatan terlebih dahulu"} />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {villages.map((village) => (
                                                    <SelectItem key={village.id} value={village.code}>
                                                        {village.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="survey-at">Tanggal Survei </Label>
                                        <Input
                                            id="survey-at"
                                            type="date"
                                            value={surveyAt}
                                            onChange={(e) => setSurveyAt(e.target.value)}
                                        />
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="space-y-2">
                                        <Label>Foto Pendukung (Maksimal 5MB)</Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotoSelect}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label
                                                htmlFor="photo-upload"
                                                className="flex flex-col items-center justify-center cursor-pointer"
                                            >
                                                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Klik untuk pilih foto</span>
                                                <span className="text-xs text-gray-400 mt-1">Pilih beberapa foto sekaligus</span>
                                            </label>
                                        </div>

                                        {/* Selected photos grid */}
                                        {selectedFiles.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                                {selectedFiles.map((photo, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={photo.previewUrl}
                                                            alt={photo.file.name}
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePhoto(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                        <p className="text-xs text-gray-500 truncate mt-1">{photo.file.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <Link href="/survey" className="flex-1">
                                            <Button type="button" variant="outline" className="w-full">
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Simpan Toponim'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CollapsibleContent>
                        </Collapsible>
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
        </SurveyorLayout>
    )
}

export default Page
