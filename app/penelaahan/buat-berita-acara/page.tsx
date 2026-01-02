"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronLeft, Upload } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"

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

const PDFPreview = ({ nomorBeritaAcara }: { nomorBeritaAcara: string }) => {
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
                <p className="text-[9px]">NOMOR: {nomorBeritaAcara || '24.BPNRR-BIG/SD.02.14/1/2025'}</p>
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
                    mencapai status penelaahan Pusat, yang merupakan bagian dari data Tim Kerja
                    Penyelenggaraan Nama Rupabumi Tingkat Pusat pada tanggal 15 Januari 2025.
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

const Page = () => {
    const [nomorBeritaAcara, setNomorBeritaAcara] = useState('')
    const [namaPembukaAcara, setNamaPembukaAcara] = useState('')
    const [jabatanPembukaAcara, setJabatanPembukaAcara] = useState('')
    const [instansiTerlibat, setInstansiTerlibat] = useState('')
    const [openPenandatangan, setOpenPenandatangan] = useState(false)
    const [kopSurat, setKopSurat] = useState<File | null>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setKopSurat(e.target.files[0])
        }
    }

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
                        <h1 className="text-xl font-bold">Buat Berita Acara</h1>
                    </div>

                    <div className="space-y-6">
                        {/* Upload Kop Surat */}
                        <div className="space-y-2">
                            <Label>Unggah Kop Surat</Label>
                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="kop-surat"
                                />
                                <label
                                    htmlFor="kop-surat"
                                    className="flex items-center justify-between w-full border rounded-md p-3 cursor-pointer hover:bg-gray-50"
                                >
                                    <span className="text-gray-500">
                                        {kopSurat ? kopSurat.name : 'Unggah Kop Surat'}
                                    </span>
                                    <Upload size={20} className="text-gray-400" />
                                </label>
                            </div>
                        </div>

                        {/* Nomor Berita Acara */}
                        <div className="space-y-2">
                            <Label htmlFor="nomor">Nomor Berita Acara</Label>
                            <Input
                                id="nomor"
                                placeholder="Nomor Berita Acara"
                                value={nomorBeritaAcara}
                                onChange={(e) => setNomorBeritaAcara(e.target.value)}
                            />
                        </div>

                        {/* Nama & Jabatan Pembuka Acara */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Pembuka Acara</Label>
                                <Input
                                    id="nama"
                                    placeholder="Nama Pembuka Acara"
                                    value={namaPembukaAcara}
                                    onChange={(e) => setNamaPembukaAcara(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jabatan">Jabatan Pembuka Acara</Label>
                                <Input
                                    id="jabatan"
                                    placeholder="Jabatan Pembuka Acara"
                                    value={jabatanPembukaAcara}
                                    onChange={(e) => setJabatanPembukaAcara(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Instansi Terlibat */}
                        <div className="space-y-2">
                            <Label htmlFor="instansi">K/L/P atau instansi lain yang terlibat</Label>
                            <Input
                                id="instansi"
                                placeholder="K/L/P atau instansi lain yang terlibat"
                                value={instansiTerlibat}
                                onChange={(e) => setInstansiTerlibat(e.target.value)}
                            />
                        </div>

                        {/* Penandatangan - Collapsible */}
                        <Collapsible open={openPenandatangan} onOpenChange={setOpenPenandatangan}>
                            <CollapsibleTrigger className="flex items-center justify-between w-full border rounded-md p-3 hover:bg-gray-50">
                                <span>Penandatangan</span>
                                <ChevronDown className={`transition-transform ${openPenandatangan ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-4 p-4 border rounded-md">
                                <div className="space-y-2">
                                    <Label>Nama Penandatangan</Label>
                                    <Input placeholder="Nama Penandatangan" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jabatan Penandatangan</Label>
                                    <Input placeholder="Jabatan Penandatangan" />
                                </div>
                                <div className="space-y-2">
                                    <Label>NIP</Label>
                                    <Input placeholder="NIP" />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" className="flex-1">
                                Batal
                            </Button>
                            <Link href="/penelaahan/approval-berita-acara" className="flex-1">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    Kirim ke Penandatangan
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side - PDF Preview */}
                <div className="w-1/2 bg-gray-100 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Pratinjau Berita Acara</h2>
                        <div className="flex gap-2">
                            <Button size="icon-sm" variant="ghost">100%</Button>
                        </div>
                    </div>
                    <div className="mx-auto">
                        {/* A4 paper: 210mm x 297mm, margins: 4cm top, 4cm right, 3cm bottom, 3cm left */}
                        <div
                            className="bg-white shadow-lg"
                            style={{
                                width: '210mm',
                                minHeight: '297mm',
                                padding: '40mm 40mm 30mm 30mm'
                            }}
                        >
                            <PDFPreview nomorBeritaAcara={nomorBeritaAcara} />
                        </div>
                    </div>
                </div>
            </div>
        </ReviewerLayout>
    )
}

export default Page
