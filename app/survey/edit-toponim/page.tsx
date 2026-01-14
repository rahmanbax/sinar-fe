"use client"
import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown, ChevronLeft, Layers, Minus, Plus, RotateCcw, Save, CircleDot, Trash2, Loader2, Check, ChevronsUpDown, Camera, X } from "lucide-react"
import SurveyorLayout from "@/layouts/SurveryorLayout"
import Link from "next/link"
import { Map, Source, Layer, Marker, type MapRef, type ViewState, type MapLayerMouseEvent } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FeatureCollection, Feature, Point } from 'geojson'
import { IoLocationSharp } from 'react-icons/io5'
import { API_URL } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface Province { id: number; name: string; code: string; level: string; path: string }
interface Region { id: number; name: string; code: string; level: string; parent_id: number; path: string }
interface Element { id: number; code: string; name: string; subcategory_id: number }

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
    isEditing, geometriType, snappingEnabled, drawnPoints, onPointsChange, savedGeometry, onClearSaved, onSave, onUndo
}) => {
    const mapRef = useRef<MapRef>(null)
    const [showLayerMenu, setShowLayerMenu] = useState(false)
    const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null)
    const initialViewState: ViewState = { longitude: big_office_coord.longitude, latitude: big_office_coord.latitude, zoom: 4.55, bearing: 0, pitch: 0, padding: { bottom: 0 } }
    const [viewState, setViewState] = useState(initialViewState)
    const [mapStyle, setMapStyle] = useState(MapStyles[0])

    // Helper to validate and fix swapped Lng/Lat
    const getSafeCoords = (coords: [number, number]): [number, number] => {
        let [lng, lat] = coords;
        // If latitude is definitely a longitude (outside -90 to 90) 
        // and longitude could be a latitude (inside -90 to 90), swap them
        if ((lat > 90 || lat < -90) && (lng <= 90 && lng >= -90)) {
            [lng, lat] = [lat, lng];
        }
        // Final safety clamp for MapLibre
        const safeLat = Math.max(-89.9, Math.min(89.9, lat));
        const safeLng = lng; // Longitude is more flexible but can be wrapped
        return [safeLng, safeLat];
    };

    // Auto zoom to saved geometry on load
    useEffect(() => {
        if (savedGeometry?.features.length && mapRef.current) {
            const feature = savedGeometry.features[0];
            let rawCenter: [number, number] | null = null;

            if (feature.geometry.type === 'Point') {
                rawCenter = feature.geometry.coordinates as [number, number];
            } else if (feature.geometry.type === 'LineString') {
                rawCenter = feature.geometry.coordinates[0] as [number, number];
            } else if (feature.geometry.type === 'Polygon') {
                rawCenter = feature.geometry.coordinates[0][0] as [number, number];
            }

            if (rawCenter) {
                const [lng, lat] = getSafeCoords(rawCenter);
                mapRef.current.flyTo({
                    center: [lng, lat],
                    zoom: 14,
                    duration: 1500
                });
            }
        }
    }, [savedGeometry]);

    const handleZoomIn = () => { if (mapRef.current) mapRef.current.flyTo({ zoom: Math.min(viewState.zoom + 1, 18), duration: 300 }) }
    const handleZoomOut = () => { if (mapRef.current) mapRef.current.flyTo({ zoom: Math.max(viewState.zoom - 1, 1), duration: 300 }) }

    const snapToNearestPoint = useCallback((lng: number, lat: number): [number, number] => {
        if (!snappingEnabled || drawnPoints.length === 0) return [lng, lat]
        const threshold = 0.001
        let nearestPoint: [number, number] = [lng, lat], minDistance = Infinity
        for (const point of drawnPoints) {
            const distance = Math.sqrt(Math.pow(point[0] - lng, 2) + Math.pow(point[1] - lat, 2))
            if (distance < threshold && distance < minDistance) { minDistance = distance; nearestPoint = point }
        }
        return nearestPoint
    }, [snappingEnabled, drawnPoints])

    const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
        if (!isEditing) return
        if (drawnPoints.length === 0) onClearSaved()
        const { lng, lat } = e.lngLat
        const snappedPoint = snapToNearestPoint(lng, lat)
        if (geometriType === 'titik') onPointsChange([snappedPoint])
        else onPointsChange([...drawnPoints, snappedPoint])
    }, [isEditing, geometriType, drawnPoints, onPointsChange, snapToNearestPoint, onClearSaved])

    const handleMapDblClick = useCallback((e: MapLayerMouseEvent) => {
        if (!isEditing || geometriType === 'titik') return
        e.preventDefault()
        if (drawnPoints.length >= 2) onSave()
    }, [isEditing, geometriType, drawnPoints, onSave])

    const handleMouseMove = useCallback((e: MapLayerMouseEvent) => { if (isEditing) setCursorPosition([e.lngLat.lng, e.lngLat.lat]) }, [isEditing])

    const currentDrawingGeoJson: FeatureCollection = { type: 'FeatureCollection', features: [] }
    if (drawnPoints.length > 0) {
        drawnPoints.forEach((point, idx) => { currentDrawingGeoJson.features.push({ type: 'Feature', properties: { id: idx }, geometry: { type: 'Point', coordinates: point } }) })
        if (geometriType === 'garis' && drawnPoints.length >= 2) {
            const lineCoords = cursorPosition ? [...drawnPoints, cursorPosition] : drawnPoints
            currentDrawingGeoJson.features.push({ type: 'Feature', properties: { type: 'line' }, geometry: { type: 'LineString', coordinates: lineCoords } })
        } else if (geometriType === 'area' && drawnPoints.length >= 2) {
            const polygonCoords = cursorPosition ? [...drawnPoints, cursorPosition, drawnPoints[0]] : [...drawnPoints, drawnPoints[0]]
            currentDrawingGeoJson.features.push({ type: 'Feature', properties: { type: 'polygon' }, geometry: { type: 'Polygon', coordinates: [polygonCoords] } })
        }
    }

    return (
        <div className="w-full h-full relative">
            <Map {...viewState} ref={mapRef} style={{ width: '100%', height: '100%' }} mapStyle={mapStyle.src} onMove={e => setViewState(e.viewState)} onClick={handleMapClick} onDblClick={handleMapDblClick} onMouseMove={handleMouseMove} cursor={isEditing ? 'crosshair' : 'grab'} maxBounds={[[92, -12], [142, 7]]}>
                {savedGeometry && (<>
                    <Source id="saved-geometry" type="geojson" data={savedGeometry}>
                        <Layer id="saved-polygon-fill" type="fill" filter={['==', ['geometry-type'], 'Polygon']} paint={{ 'fill-color': '#10b981', 'fill-opacity': 0.3 }} />
                        <Layer id="saved-line" type="line" filter={['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'Polygon']]} paint={{ 'line-color': '#10b981', 'line-width': 2 }} />
                    </Source>
                    {savedGeometry.features.filter(f => f.geometry.type === 'Point').map((feature, idx) => {
                        const rawCoords = (feature.geometry as Point).coordinates as [number, number]
                        const [lng, lat] = getSafeCoords(rawCoords);
                        return <Marker key={`saved-point-${idx}`} longitude={lng} latitude={lat} anchor="bottom"><IoLocationSharp className='text-3xl text-blue-600 drop-shadow-lg' /></Marker>
                    })}
                </>)}
                {isEditing && currentDrawingGeoJson.features.length > 0 && (<>
                    <Source id="current-drawing" type="geojson" data={currentDrawingGeoJson}>
                        <Layer id="drawing-polygon-fill" type="fill" filter={['==', ['geometry-type'], 'Polygon']} paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.2 }} />
                        <Layer id="drawing-line" type="line" filter={['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'Polygon']]} paint={{ 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [2, 2] }} />
                        {geometriType !== 'titik' && <Layer id="drawing-points" type="circle" filter={['==', ['geometry-type'], 'Point']} paint={{ 'circle-radius': 6, 'circle-color': '#3b82f6', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' }} />}
                    </Source>
                    {geometriType === 'titik' && drawnPoints.map((point, idx) => <Marker key={`drawing-point-${idx}`} longitude={point[0]} latitude={point[1]} anchor="bottom"><IoLocationSharp className='text-3xl text-blue-600 drop-shadow-lg opacity-90' /></Marker>)}
                </>)}
            </Map>
            {isEditing && <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2"><CircleDot size={16} className="text-blue-600" /><span className="text-sm font-medium">Mode: {geometriType === 'titik' ? 'Titik' : geometriType === 'garis' ? 'Garis' : 'Area'}{snappingEnabled && ' (Snapping ON)'}</span></div>}
            {isEditing && <div className="absolute bottom-20 left-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-[200px]">{geometriType === 'titik' ? <p>Klik pada peta untuk menempatkan titik</p> : <p>Klik untuk menambah titik, double-click untuk selesai</p>}</div>}
            <div className="absolute bottom-12 right-4 flex flex-col gap-2">
                <div className="relative">
                    <Button size="icon" variant="ghost" className="bg-white shadow-lg" onClick={() => setShowLayerMenu(!showLayerMenu)}><Layers size={18} /></Button>
                    {showLayerMenu && <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[150px]">{MapStyles.map((style) => <button key={style.label} className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${mapStyle.label === style.label ? 'bg-blue-100 text-blue-700' : ''}`} onClick={() => { setMapStyle(style); setShowLayerMenu(false) }}>{style.label}</button>)}</div>}
                </div>
                <Button size="icon" variant="ghost" className="bg-white shadow-lg" onClick={handleZoomIn}><Plus size={18} /></Button>
                <Button size="icon" variant="ghost" className="bg-white shadow-lg" onClick={handleZoomOut}><Minus size={18} /></Button>
            </div>
        </div>
    )
}

const EditToponimContent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const toponymId = searchParams.get('id')
    const { token } = useAuth()
    const [loading, setLoading] = useState(true)
    const [openSpasial, setOpenSpasial] = useState(true)
    const [openAtribut, setOpenAtribut] = useState(true)
    const [isEditingDraft, setIsEditingDraft] = useState(false)
    const [geometriType, setGeometriType] = useState<'titik' | 'garis' | 'area'>('titik')
    const [fiturSnapping, setFiturSnapping] = useState(false)
    const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([])
    const [savedGeometry, setSavedGeometry] = useState<FeatureCollection | null>(null)
    const [historyStack, setHistoryStack] = useState<[number, number][][]>([])

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
    const [provinceCode, setProvinceCode] = useState('')
    const [regencyCode, setRegencyCode] = useState('')
    const [districtCode, setDistrictCode] = useState('')
    const [villageCode, setVillageCode] = useState('')

    const [provinces, setProvinces] = useState<Province[]>([])
    const [loadingProvinces, setLoadingProvinces] = useState(true)
    const [regencies, setRegencies] = useState<Region[]>([])
    const [loadingRegencies, setLoadingRegencies] = useState(false)
    const [districts, setDistricts] = useState<Region[]>([])
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [villages, setVillages] = useState<Region[]>([])
    const [loadingVillages, setLoadingVillages] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<{ file: File, previewUrl: string }[]>([])
    const [existingPhotos, setExistingPhotos] = useState<{ url: string, filename: string }[]>([])
    const [elements, setElements] = useState<Element[]>([])
    const [loadingElements, setLoadingElements] = useState(true)
    const [openElementCombobox, setOpenElementCombobox] = useState(false)
    const [openProvincePopover, setOpenProvincePopover] = useState(false)
    const [openRegencyPopover, setOpenRegencyPopover] = useState(false)
    const [openDistrictPopover, setOpenDistrictPopover] = useState(false)
    const [openVillagePopover, setOpenVillagePopover] = useState(false)

    // Fetch existing toponym data
    useEffect(() => {
        if (!toponymId) return
        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${API_URL}/survey/toponyms/${toponymId}`, { headers: { 'Authorization': `Bearer ${token}` } })
                const result = await res.json()
                if (!result.error && result.data) {
                    const d = result.data
                    setLocalName(d.local_name || '')
                    setMapName(d.map_name || '')
                    setOtherName(d.other_name || '')
                    setLanguageOrigin(d.language_origin || '')
                    setNameMeaning(d.name_meaning || '')
                    setNameHistory(d.name_history || '')
                    setPronounciation(d.pronounciation || '')
                    setSpelling(d.spelling || '')
                    setElementCode(d.element?.code || '')
                    setSurveyAt(d.survey_at ? d.survey_at.split('T')[0] : '')
                    setProvinceCode(d.province_id || '')
                    setRegencyCode(d.regency_id || '')
                    setDistrictCode(d.district_id || '')
                    setVillageCode(d.village_id || '')
                    if (d.photos) setExistingPhotos(d.photos.map((p: any) => ({ url: p.url, filename: p.filename || p.original_name })))
                    if (d.location_point?.coordinates) {
                        setSavedGeometry({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: d.location_point.coordinates } }] })
                    }
                }
            } catch (err) { console.error('Failed to fetch toponym:', err) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [toponymId, token])

    useEffect(() => {
        fetch(`${API_URL}/regions?level=PROVINCE&limit=100`).then(r => r.json()).then(result => { if (!result.error && result.data) setProvinces(result.data) }).finally(() => setLoadingProvinces(false))
        fetch(`${API_URL}/classification/elements?sort_by=name&sort_order=asc`).then(r => r.json()).then(result => { if (!result.error && result.data) setElements(result.data) }).finally(() => setLoadingElements(false))
    }, [])

    useEffect(() => {
        if (!provinceCode) { setRegencies([]); setRegencyCode(''); setDistricts([]); setDistrictCode(''); setVillages([]); setVillageCode(''); return }
        const selectedProvince = provinces.find(p => p.code === provinceCode)
        if (!selectedProvince) return
        setLoadingRegencies(true)
        fetch(`${API_URL}/regions?level=CITY&parent=${selectedProvince.path}&limit=100`).then(r => r.json()).then(result => { if (!result.error && result.data) setRegencies(result.data) }).finally(() => setLoadingRegencies(false))
    }, [provinceCode, provinces])

    useEffect(() => {
        if (!regencyCode) { setDistricts([]); setDistrictCode(''); setVillages([]); setVillageCode(''); return }
        const selectedRegency = regencies.find(r => r.code === regencyCode)
        if (!selectedRegency) return
        setLoadingDistricts(true)
        fetch(`${API_URL}/regions?level=DISTRICT&parent=${selectedRegency.path}&limit=100`).then(r => r.json()).then(result => { if (!result.error && result.data) setDistricts(result.data) }).finally(() => setLoadingDistricts(false))
    }, [regencyCode, regencies])

    useEffect(() => {
        if (!districtCode) { setVillages([]); setVillageCode(''); return }
        const selectedDistrict = districts.find(d => d.code === districtCode)
        if (!selectedDistrict) return
        setLoadingVillages(true)
        fetch(`${API_URL}/regions?level=DISTRICT&parent=${selectedDistrict.path}&limit=100`).then(r => r.json()).then(result => { if (!result.error && result.data) setVillages(result.data) }).finally(() => setLoadingVillages(false))
    }, [districtCode, districts])

    const getGeometry = (): { type: string, coordinates: number[] | number[][] } | null => {
        if (savedGeometry?.features.length) {
            const geom = savedGeometry.features[0].geometry as { type: string, coordinates: number[] | number[][] }
            if (geom.type === 'Point') return { type: 'Point', coordinates: [geom.coordinates[0] as number, geom.coordinates[1] as number] }
            return geom
        }
        if (drawnPoints.length > 0) return { type: 'Point', coordinates: [drawnPoints[0][0], drawnPoints[0][1]] }
        return null
    }

    const handlePointsChange = useCallback((points: [number, number][]) => { setHistoryStack(prev => [...prev, drawnPoints]); setDrawnPoints(points) }, [drawnPoints])
    const handleSaveGeometry = useCallback(() => {
        if (drawnPoints.length === 0) return
        const features: Feature[] = []
        if (geometriType === 'titik' && drawnPoints.length >= 1) features.push({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: drawnPoints[0] } })
        else if (geometriType === 'garis' && drawnPoints.length >= 2) features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: drawnPoints } })
        else if (geometriType === 'area' && drawnPoints.length >= 3) features.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...drawnPoints, drawnPoints[0]]] } })
        if (features.length > 0) { setSavedGeometry({ type: 'FeatureCollection', features }); setDrawnPoints([]); setHistoryStack([]); setIsEditingDraft(false) }
    }, [drawnPoints, geometriType])
    const handleUndoGeometry = useCallback(() => { if (historyStack.length > 0) { setDrawnPoints(historyStack[historyStack.length - 1]); setHistoryStack(prev => prev.slice(0, -1)) } else setDrawnPoints([]) }, [historyStack])
    const handleClearGeometry = useCallback(() => { setDrawnPoints([]); setSavedGeometry(null); setHistoryStack([]) }, [])
    const handleClearSavedGeometry = useCallback(() => { setSavedGeometry(null) }, [])

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const MAX_SIZE = 3 * 1024 * 1024
        const validFiles: { file: File, previewUrl: string }[] = []
        for (const file of Array.from(files)) { if (file.size <= MAX_SIZE) validFiles.push({ file, previewUrl: URL.createObjectURL(file) }) }
        if (validFiles.length > 0) setSelectedFiles(prev => [...prev, ...validFiles])
        e.target.value = ''
    }
    const handleRemovePhoto = (index: number) => { setSelectedFiles(prev => { URL.revokeObjectURL(prev[index].previewUrl); return prev.filter((_, i) => i !== index) }) }
    const handleRemoveExistingPhoto = (index: number) => { setExistingPhotos(prev => prev.filter((_, i) => i !== index)) }

    const uploadPhotos = async (): Promise<{ url: string, filename: string }[]> => {
        const uploaded: { url: string, filename: string }[] = []
        for (const { file } of selectedFiles) {
            const formData = new FormData(); formData.append('file', file)
            const res = await fetch(`${API_URL}/media/upload/image`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
            const result = await res.json()
            if (!result.error && result.data) uploaded.push({ url: result.data.url, filename: file.name })
        }
        return uploaded
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const geometry = getGeometry()
        if (!geometry) { alert('Silakan gambar lokasi titik terlebih dahulu'); return }
        setIsSubmitting(true)
        try {
            let uploadedPhotos: { url: string, filename: string }[] = []
            if (selectedFiles.length > 0) uploadedPhotos = await uploadPhotos()
            const allPhotos = [...existingPhotos, ...uploadedPhotos]
            const payload: Record<string, unknown> = { local_name: localName, geometry }
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
            if (allPhotos.length > 0) payload.photos = allPhotos

            const res = await fetch(`${API_URL}/survey/toponyms/${toponymId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) })
            const result = await res.json()
            if (!result.error) { alert('Toponim berhasil diperbarui!'); router.push('/survey?tab=my-data') }
            else alert(`Gagal: ${result.message}`)
        } catch (err) { console.error('Failed to submit:', err); alert('Terjadi kesalahan saat menyimpan') }
        finally { setIsSubmitting(false) }
    }

    if (loading) return <SurveyorLayout><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><p className="ml-2">Memuat data...</p></div></SurveyorLayout>

    return (
        <SurveyorLayout>
            <div className="flex h-full pt-20">
                <div className="w-2/5 p-6 overflow-y-auto border-r">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/survey?tab=my-data"><Button size='icon-sm' variant="ghost"><ChevronLeft /></Button></Link>
                        <h1 className="text-xl font-bold">Edit Data Toponim</h1>
                    </div>
                    <div className="space-y-4">
                        <Collapsible open={openSpasial} onOpenChange={setOpenSpasial}>
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg"><ChevronDown className={`transition-transform ${openSpasial ? '' : '-rotate-90'}`} size={20} />Penggambaran Lokasi</CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                {!isEditingDraft ? (
                                    <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => setIsEditingDraft(true)}>{savedGeometry ? 'Edit Lokasi di Peta' : 'Tambah Lokasi di Peta'}</Button>
                                ) : (<>
                                    <div className="space-y-2"><Label>Tipe Geometri</Label><RadioGroup value={geometriType} onValueChange={(v) => setGeometriType(v as 'titik' | 'garis' | 'area')} className="flex gap-6"><div className="flex items-center space-x-2"><RadioGroupItem value="titik" id="titik" /><Label htmlFor="titik" className="font-normal">Titik</Label></div></RadioGroup></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="snapping" checked={fiturSnapping} onCheckedChange={(c) => setFiturSnapping(c as boolean)} /><Label htmlFor="snapping" className="font-normal">Fitur Snapping</Label></div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" className="border-red-400 text-red-500 hover:bg-red-50" onClick={handleClearGeometry}><Trash2 size={16} className="mr-2" />Bersihkan Penggambaran</Button>
                                        <Button variant="outline" className="border-orange-400 text-orange-500 hover:bg-orange-50" onClick={handleUndoGeometry}><RotateCcw size={16} className="mr-2" />Kembali ke sebelumnya</Button>
                                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveGeometry}><Save size={16} className="mr-2" />Simpan Lokasi</Button>
                                        <Button variant="outline" className="border-gray-400 text-gray-600 hover:bg-gray-50" onClick={() => setIsEditingDraft(false)}>Batalkan</Button>
                                    </div>
                                    {(drawnPoints.length > 0 || savedGeometry) && <div className="mt-4 p-3 bg-blue-50 rounded-lg"><Label className="text-sm font-medium mb-2 block">Koordinat Titik</Label>{drawnPoints.length > 0 && <div className="space-y-1 text-sm"><p className="text-gray-500 text-xs mb-1">Titik yang sedang digambar:</p>{drawnPoints.map((point, idx) => <p key={idx} className="font-mono text-blue-600 font-bold">Lng: {point[0].toFixed(6)}, Lat:{point[1].toFixed(6)}</p>)}</div>}</div>}
                                </>)}
                                {!isEditingDraft && savedGeometry?.features.length && <div className="p-3 bg-green-50 rounded-lg"><Label className="text-sm font-medium mb-2 block text-green-700">Lokasi Tersimpan</Label>{savedGeometry.features.map((feature, idx) => { if (feature.geometry.type === 'Point') { const coords = (feature.geometry as Point).coordinates; return <p key={idx} className="font-mono text-green-600 font-bold text-sm">Lng: {coords[0].toFixed(6)}, Lat: {coords[1].toFixed(6)}</p> } return null })}</div>}
                            </CollapsibleContent>
                        </Collapsible>
                        <Collapsible open={openAtribut} onOpenChange={setOpenAtribut}>
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg"><ChevronDown className={`transition-transform ${openAtribut ? '' : '-rotate-90'}`} size={20} />Informasi Toponim</CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2"><Label>Nama Lokal <span className="text-red-500">*</span></Label><Input value={localName} onChange={(e) => setLocalName(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Nama Peta <span className="text-red-500">*</span></Label><Input value={mapName} onChange={(e) => setMapName(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Nama Lain <span className="text-red-500">*</span></Label><Input value={otherName} onChange={(e) => setOtherName(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Asal Bahasa <span className="text-red-500">*</span></Label><Input value={languageOrigin} onChange={(e) => setLanguageOrigin(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Arti Nama <span className="text-red-500">*</span></Label><Input value={nameMeaning} onChange={(e) => setNameMeaning(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Sejarah Nama <span className="text-red-500">*</span></Label><Input value={nameHistory} onChange={(e) => setNameHistory(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Pelafalan <span className="text-red-500">*</span></Label><Input value={pronounciation} onChange={(e) => setPronounciation(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Ejaan <span className="text-red-500">*</span></Label><Input value={spelling} onChange={(e) => setSpelling(e.target.value)} required /></div>
                                    <div className="space-y-2"><Label>Elemen <span className="text-red-500">*</span></Label><Popover open={openElementCombobox} onOpenChange={setOpenElementCombobox}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between font-normal" disabled={loadingElements}>{loadingElements ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Memuat...</> : elementCode ? elements.find(e => e.code === elementCode)?.name : "Pilih Elemen"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-full p-0" align="start"><Command><CommandInput placeholder="Cari elemen..." /><CommandList><CommandEmpty>Tidak ditemukan.</CommandEmpty><CommandGroup>{elements.map(el => <CommandItem key={el.code} value={el.name} onSelect={() => { setElementCode(el.code); setOpenElementCombobox(false) }}><Check className={cn("mr-2 h-4 w-4", elementCode === el.code ? "opacity-100" : "opacity-0")} />{el.name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover></div>
                                    <div className="space-y-2"><Label>Provinsi <span className="text-red-500">*</span></Label><Popover open={openProvincePopover} onOpenChange={setOpenProvincePopover}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between font-normal" disabled={loadingProvinces}>{loadingProvinces ? "Memuat..." : provinceCode ? provinces.find(p => p.code === provinceCode)?.name : "Pilih Provinsi"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-full p-0" align="start"><Command><CommandInput placeholder="Cari..." /><CommandList><CommandEmpty>Tidak ditemukan.</CommandEmpty><CommandGroup>{provinces.map(p => <CommandItem key={p.code} value={p.name} onSelect={() => { setProvinceCode(p.code); setOpenProvincePopover(false) }}><Check className={cn("mr-2 h-4 w-4", provinceCode === p.code ? "opacity-100" : "opacity-0")} />{p.name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover></div>
                                    <div className="space-y-2"><Label>Kabupaten/Kota <span className="text-red-500">*</span></Label><Popover open={openRegencyPopover} onOpenChange={setOpenRegencyPopover}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between font-normal" disabled={loadingRegencies || !provinceCode}>{loadingRegencies ? "Memuat..." : regencyCode ? regencies.find(r => r.code === regencyCode)?.name : provinceCode ? "Pilih Kabupaten/Kota" : "Pilih Provinsi dulu"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-full p-0" align="start"><Command><CommandInput placeholder="Cari..." /><CommandList><CommandEmpty>Tidak ditemukan.</CommandEmpty><CommandGroup>{regencies.map(r => <CommandItem key={r.code} value={r.name} onSelect={() => { setRegencyCode(r.code); setOpenRegencyPopover(false) }}><Check className={cn("mr-2 h-4 w-4", regencyCode === r.code ? "opacity-100" : "opacity-0")} />{r.name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover></div>
                                    <div className="space-y-2"><Label>Kecamatan <span className="text-red-500">*</span></Label><Popover open={openDistrictPopover} onOpenChange={setOpenDistrictPopover}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between font-normal" disabled={loadingDistricts || !regencyCode}>{loadingDistricts ? "Memuat..." : districtCode ? districts.find(d => d.code === districtCode)?.name : regencyCode ? "Pilih Kecamatan" : "Pilih Kab/Kota dulu"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-full p-0" align="start"><Command><CommandInput placeholder="Cari..." /><CommandList><CommandEmpty>Tidak ditemukan.</CommandEmpty><CommandGroup>{districts.map(d => <CommandItem key={d.code} value={d.name} onSelect={() => { setDistrictCode(d.code); setOpenDistrictPopover(false) }}><Check className={cn("mr-2 h-4 w-4", districtCode === d.code ? "opacity-100" : "opacity-0")} />{d.name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover></div>
                                    <div className="space-y-2"><Label>Desa/Kelurahan</Label><Popover open={openVillagePopover} onOpenChange={setOpenVillagePopover}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between font-normal" disabled={loadingVillages || !districtCode}>{loadingVillages ? "Memuat..." : villageCode ? villages.find(v => v.code === villageCode)?.name : districtCode ? "Pilih Desa/Kelurahan" : "Pilih Kecamatan dulu"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-full p-0" align="start"><Command><CommandInput placeholder="Cari..." /><CommandList><CommandEmpty>Tidak ditemukan.</CommandEmpty><CommandGroup>{villages.map(v => <CommandItem key={v.code} value={v.name} onSelect={() => { setVillageCode(v.code); setOpenVillagePopover(false) }}><Check className={cn("mr-2 h-4 w-4", villageCode === v.code ? "opacity-100" : "opacity-0")} />{v.name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover></div>
                                    <div className="space-y-2"><Label>Tanggal Survei</Label><Input type="date" value={surveyAt} onChange={(e) => setSurveyAt(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Foto Pendukung (Maks 3MB)</Label><div className="border-2 border-dashed border-gray-300 rounded-lg p-4"><input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" id="photo-upload" /><label htmlFor="photo-upload" className="flex flex-col items-center cursor-pointer"><Camera className="h-8 w-8 text-gray-400 mb-2" /><span className="text-sm text-gray-500">Klik untuk pilih foto</span></label></div>{existingPhotos.length > 0 && <div className="grid grid-cols-3 gap-2 mt-3">{existingPhotos.map((photo, i) => <div key={`existing-${i}`} className="relative group"><img src={photo.url} alt={photo.filename} className="w-full h-24 object-cover rounded-lg" /><button type="button" onClick={() => handleRemoveExistingPhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={14} /></button></div>)}</div>}{selectedFiles.length > 0 && <div className="grid grid-cols-3 gap-2 mt-3">{selectedFiles.map((photo, i) => <div key={i} className="relative group"><img src={photo.previewUrl} alt={photo.file.name} className="w-full h-24 object-cover rounded-lg" /><button type="button" onClick={() => handleRemovePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={14} /></button></div>)}</div>}</div>
                                    <div className="flex gap-4 pt-4"><Link href="/survey?tab=my-data" className="flex-1"><Button type="button" variant="outline" className="w-full">Batal</Button></Link><Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : 'Simpan Perubahan'}</Button></div>
                                </form>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
                <div className="flex-1"><PreviewMap isEditing={isEditingDraft} geometriType={geometriType} snappingEnabled={fiturSnapping} drawnPoints={drawnPoints} onPointsChange={handlePointsChange} savedGeometry={savedGeometry} onClearSaved={handleClearSavedGeometry} onSave={handleSaveGeometry} onUndo={handleUndoGeometry} /></div>
            </div>
        </SurveyorLayout>
    )
}

const Page = () => <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}><EditToponimContent /></Suspense>
export default Page
