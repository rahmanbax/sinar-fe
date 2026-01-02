"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Check, X } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { Map, type MapRef, type ViewState } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map"

// Sample data untuk tabel preview
const sampleData = [
    { no: 1, wilayah: 'Aceh', dataAwal: 27, ditelaah: 19, diterima: 10, ditolak: 0 },
    { no: 2, wilayah: 'Bali', dataAwal: 13, ditelaah: 10, diterima: 10, ditolak: 0 },
    { no: 3, wilayah: 'Banten', dataAwal: 12, ditelaah: 4, diterima: 4, ditolak: 0 },
    { no: 4, wilayah: 'Bengkulu', dataAwal: 7, ditelaah: 1, diterima: 1, ditolak: 0 },
    { no: 5, wilayah: 'Daerah Istimewa Yogyakarta', dataAwal: 3, ditelaah: 0, diterima: 0, ditolak: 0 },
    { no: 6, wilayah: 'DKI Jakarta', dataAwal: 9, ditelaah: 6, diterima: 6, ditolak: 0 },
    { no: 7, wilayah: 'Gorontalo', dataAwal: 9, ditelaah: 5, diterima: 5, ditolak: 0 },
    { no: 8, wilayah: 'Jambi', dataAwal: 16, ditelaah: 4, diterima: 4, ditolak: 0 },
    { no: 9, wilayah: 'Jawa Barat', dataAwal: 26, ditelaah: 10, diterima: 10, ditolak: 0 },
    { no: 10, wilayah: 'Jawa Tengah', dataAwal: 51, ditelaah: 22, diterima: 22, ditolak: 0 },
    { no: 11, wilayah: 'Jawa Timur', dataAwal: 56, ditelaah: 30, diterima: 29, ditolak: 1 },
]

const PDFPreview = () => {
    return (
        <div className="text-[10px] leading-relaxed">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6 border-b-2 border-black pb-4">
                <div className="w-16 h-16 bg-gray-300 flex items-center justify-center text-[8px] text-center">
                    LOGO BIG
                </div>
                <div className="flex-1 text-center">
                    <h1 className="font-bold text-sm">BADAN INFORMASI GEOSPASIAL</h1>
                    <h2 className="font-bold text-sm">( B I G )</h2>
                    <p className="text-[8px]">Jalan Raya Bogor KM 46, Kawasan Sains dan Teknologi Dr. (H.C.) Ir. H. Soekarno</p>
                    <p className="text-[8px]">Cibinong, Bogor, Jawa Barat 16911</p>
                    <p className="text-[8px]">Telepon: (021) 875 2062 2064; Faksimile: (021) 875 2084</p>
                    <p className="text-[8px]">Situs Web: http://www.big.go.id; e-mail: info@big.go.id</p>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
                <h2 className="font-bold underline">BERITA ACARA</h2>
                <p className="text-[9px]">NOMOR: 24.BPNRR-BIG/SD.02.14/1/2025</p>
                <p className="font-bold text-[9px]">PENELAAHAN NAMA RUPABUMI TINGKAT PUSAT</p>
                <p className="text-[9px]">TAHUN 2025</p>
            </div>

            {/* Content */}
            <div className="space-y-4 text-justify">
                <p>
                    <span className="font-bold">I.</span> Pada hari Senin sampai dengan Jumat, tanggal Dua Puluh sampai dengan Dua Puluh
                    Empat bulan Januari tahun Dua Ribu Dua Puluh Lima, telah dilaksanakan kegiatan
                    Penelaahan Nama Rupabumi Tingkat Pusat di Cibinong.
                </p>

                <p>
                    <span className="font-bold">II.</span> Acara secara resmi dibuka oleh Harry Ferdiansyah selaku Ketua Tim Pembakuan Nama
                    Rupabumi, Badan Informasi Geospasial (BIG). Acara dihadiri oleh perwakilan dari Badan
                    Informasi Geospasial dan Pusat Data dan Teknologi Informasi, Kementerian
                    Perhubungan.
                </p>

                <p>
                    <span className="font-bold">III.</span> Pembahasan dilakukan terhadap 472 (empat ratus tujuh puluh dua) dari 1.015 (seribu
                    lima belas) data nama rupabumi unsur pelabuhan laut, pelabuhan penyeberangan,
                    pelabuhan sungai & danau, dan terminal bus/angkutan kendaraan lainnya yang sudah
                    mencapai status penelaahan Pusat.
                </p>

                <p>
                    <span className="font-bold">IV.</span> Data yang telah ditelaah adalah sebagai berikut:
                </p>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[8px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1" rowSpan={2}>No.</th>
                            <th className="border border-black p-1" rowSpan={2}>Keterangan Wilayah</th>
                            <th className="border border-black p-1" rowSpan={2}>Jumlah Data Awal</th>
                            <th className="border border-black p-1" rowSpan={2}>Jumlah Data yang Ditelaah</th>
                            <th className="border border-black p-1" colSpan={2}>Hasil Telaah</th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1">Diterima</th>
                            <th className="border border-black p-1">Ditolak</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sampleData.map((row) => (
                            <tr key={row.no}>
                                <td className="border border-black p-1 text-center">{row.no}</td>
                                <td className="border border-black p-1">{row.wilayah}</td>
                                <td className="border border-black p-1 text-center">{row.dataAwal}</td>
                                <td className="border border-black p-1 text-center">{row.ditelaah}</td>
                                <td className="border border-black p-1 text-center">{row.diterima}</td>
                                <td className="border border-black p-1 text-center">{row.ditolak}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const PreviewMap = () => {
    const mapRef = useRef<MapRef>(null)
    const [bearing, setBearing] = useState(0)

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

    return (
        <div className="w-full h-full">
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
            ></Map>
        </div>
    )
}

const Page = () => {
    return (
        <ReviewerLayout>
            <div className="flex h-full pt-20">
                {/* Left Side - PDF Preview */}
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link href="/penelaahan/buat-berita-acara">
                                <Button size='icon-sm' variant="ghost">
                                    <ChevronLeft />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-bold">Approval Berita Acara</h1>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-4">
                        <Button className="bg-red-600 hover:bg-red-800">
                            <X size={16} className="mr-2" /> Tolak
                        </Button>
                        <Button className="bg-green-700 hover:bg-green-800">
                            <Check size={16} className="mr-2" /> Setujui Berita Acara
                        </Button>
                    </div>

                    {/* PDF Preview */}
                    <div className="mx-auto">
                        <div
                            className="bg-white shadow-lg"
                            style={{
                                width: '210mm',
                                minHeight: '297mm',
                                padding: '40mm 40mm 30mm 30mm'
                            }}
                        >
                            <PDFPreview />
                        </div>
                    </div>
                </div>

                {/* Right Side - Map */}
                <div className="w-1/2 border-l">
                    <PreviewMap />
                </div>
            </div>
        </ReviewerLayout>
    )
}

export default Page
