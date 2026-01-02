"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronLeft, Layers, Minus, Plus, RotateCcw, Save } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { Map, type MapRef, type ViewState } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const PreviewMap = () => {
    const mapRef = useRef<MapRef>(null)
    const [showLayerMenu, setShowLayerMenu] = useState(false)

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

    return (
        <div className="w-full h-full relative">
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle.src}
                onMove={e => {
                    setViewState(e.viewState)
                }}
                maxBounds={[
                    [92, -12],
                    [142, 7]
                ]}
            ></Map>

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
    const [geometriType, setGeometriType] = useState('titik')
    const [fiturSnapping, setFiturSnapping] = useState(false)

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
                                            <RadioGroup value={geometriType} onValueChange={setGeometriType} className="flex gap-6">
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
                                            <Button variant="outline" className="border-orange-400 text-orange-500 hover:bg-orange-50">
                                                <RotateCcw size={16} className="mr-2" />
                                                Kembali ke penggambaran sebelumnya
                                            </Button>
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <Save size={16} className="mr-2" />
                                                Simpan penggambaran
                                            </Button>
                                        </div>
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
                                    <Select value={jenisUnsur} onValueChange={setJenisUnsur}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Jenis Unsur" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pendidikan-menengah-umum">Pendidikan Menengah Umum</SelectItem>
                                            <SelectItem value="pendidikan-tinggi">Pendidikan Tinggi</SelectItem>
                                            <SelectItem value="pelabuhan">Pelabuhan</SelectItem>
                                            <SelectItem value="bandara">Bandara</SelectItem>
                                            <SelectItem value="terminal">Terminal</SelectItem>
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
                    <PreviewMap />
                </div>
            </div>
        </ReviewerLayout>
    )
}

export default Page
