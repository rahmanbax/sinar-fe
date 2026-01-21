"use client"
import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronLeft, Upload, Loader2, X } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { API_URL } from "@/lib/config"
import dynamic from "next/dynamic"
import BeritaAcaraPDF from "./BeritaAcaraPDF"

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    { ssr: false }
)

const HTMLPreview = ({
    nomor,
    nama,
    jabatan,
    instansi,
    tableData,
    loading,
    totalData,
    handledData,
    elements
}: {
    nomor: string
    nama: string
    jabatan: string
    instansi: string
    tableData: TableRow[]
    loading: boolean
    totalData: number
    handledData: number
    elements: string[]
}) => {
    const elementText = elements.join(', ').replace(/, ([^,]*)$/, ' dan $1');
    return (
        <div className="bg-white shadow-2xl mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 25mm 30mm 30mm', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-6 border-b-2 border-black pb-4" style={{ lineHeight: 1.25 }}>
                <Image src="/logo-wiki.png" alt="logo" width={88} height={100} className="object-contain" />
                <div className="flex-1 text-center">
                    <h1 className="font-bold text-lg">BADAN INFORMASI GEOSPASIAL</h1>
                    <h2 className="font-bold text-lg">( B I G )</h2>
                    <p className="text-[10pt]">Jalan Raya Bogor KM 46, Kawasan Sains dan Teknologi Dr. (H.C.) Ir. H. Soekarno</p>
                    <p className="text-[10pt]">Cibinong, Bogor, Jawa Barat 16911</p>
                    <p className="text-[10pt]">Telepon: (021) 875 2062-2063, Faksimile: (021) 875 2064</p>
                    <p className="text-[10pt]">Situs Web: http://www.big.go.id, e-mail: info@big.go.id</p>
                    <p className="text-[10pt]">Koordinat: 6o 29' 27.29" LS. 106o 50' 56.08" BT</p>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6 font-bold" style={{ lineHeight: 1.5 }}>
                <h2 className="">BERITA ACARA</h2>
                <p>NOMOR: {nomor?.toUpperCase() || '.......................'}</p>
                <p>PENELAAHAN NAMA RUPABUMI TINGKAT PUSAT</p>
                <p>TAHUN 2026</p>
            </div>

            {/* Content */}
            <div className="space-y-4 text-justify text-[10pt]" style={{ lineHeight: 1.5 }}>
                <p><span className="font-bold">I.</span> Pada hari Senin sampai dengan Jumat, tanggal Dua Puluh sampai dengan Dua Puluh Empat bulan Januari tahun Dua Ribu Dua Puluh Lima, telah dilaksanakan kegiatan Penelaahan Nama Rupabumi Tingkat Pusat di Cibinong.</p>
                <p><span className="font-bold">II.</span> Acara secara resmi dibuka oleh {nama || '.......................'} selaku {jabatan || '.......................'}, Badan Informasi Geospasial (BIG). Acara dihadiri oleh perwakilan dari Badan Informasi Geospasial{instansi ? ' dan ' + instansi : ''}.</p>
                <p><span className="font-bold">III.</span> Pembahasan dilakukan terhadap {handledData || '...'} dari {totalData || '...'} data nama rupabumi {elements.length > 0 ? `unsur ${elementText}` : 'semua unsur'} yang sudah mencapai status penelaahan Pusat, yang merupakan bagian dari data Tim Kerja Penyelenggaraan Nama Rupabumi Tingkat Pusat pada tanggal 15 Januari 2025.</p>
                <p><span className="font-bold">IV.</span> Data yang telah ditelaah adalah sebagai berikut:</p>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-black mt-4 text-[9pt]">
                <thead>
                    <tr className="bg-gray-200 font-bold">
                        <th className="border border-black p-1 text-center" rowSpan={2}>No.</th>
                        <th className="border border-black p-1 text-left" rowSpan={2}>Keterangan Wilayah</th>
                        <th className="border border-black p-1 text-center" rowSpan={2}>Jumlah Data Awal</th>
                        <th className="border border-black p-1 text-center" rowSpan={2}>Jumlah Data yang Ditelaah</th>
                        <th className="border border-black p-1 text-center" colSpan={2}>Hasil Telaah</th>
                    </tr>
                    <tr className="bg-gray-200 font-bold">
                        <th className="border border-black p-1 text-center">Diterima</th>
                        <th className="border border-black p-1 text-center">Ditolak</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => (
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
    )
}

// API Response Type
interface ProvinceData {
    province_id: string
    name: string
    total_data: number
    handled_data: number
    accepted_data: number
    rejected_data: number
}

interface TableRow {
    no: number
    wilayah: string
    dataAwal: number
    ditelaah: number
    diterima: number
    ditolak: number
}



const CetakBeritaAcaraContent = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const transactionId = searchParams.get('transactionId')

    const [nomorBeritaAcara, setNomorBeritaAcara] = useState('')
    const [namaPembukaAcara, setNamaPembukaAcara] = useState('')
    const [jabatanPembukaAcara, setJabatanPembukaAcara] = useState('')
    const [instansiTerlibat, setInstansiTerlibat] = useState('')
    const [showFullPreview, setShowFullPreview] = useState(false)

    // Debounced states for PDF Preview
    const [debouncedValues, setDebouncedValues] = useState({
        nomor: '',
        nama: '',
        jabatan: '',
        instansi: ''
    })

    const [openPenandatangan, setOpenPenandatangan] = useState(false)
    const [kopSurat, setKopSurat] = useState<File | null>(null)

    // API State
    const [tableData, setTableData] = useState<TableRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [transactionMeta, setTransactionMeta] = useState<{ total_data: number; handled_data: number; elements: string[] }>({
        total_data: 0,
        handled_data: 0,
        elements: []
    })

    // Fetch data from API
    useEffect(() => {
        if (!transactionId) {
            setError('Transaction ID tidak ditemukan')
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/news`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result = await response.json()

                if (!result.error && result.data) {
                    // New API structure has nested data
                    const { province_data, transaction, elements } = result.data

                    // Transform province_data to table format
                    if (province_data && Array.isArray(province_data)) {
                        const transformedData: TableRow[] = province_data.map((item: ProvinceData, index: number) => ({
                            no: index + 1,
                            wilayah: item.name,
                            dataAwal: item.total_data,
                            ditelaah: item.handled_data,
                            diterima: item.accepted_data,
                            ditolak: item.rejected_data
                        }))
                        setTableData(transformedData)
                    }

                    // transaction.total_data, transaction.handled_data
                    // elements array
                    setTransactionMeta({
                        total_data: transaction?.total_data || 0,
                        handled_data: transaction?.handled_data || 0,
                        elements: elements || []
                    })
                } else {
                    setError(result.message || 'Gagal memuat data')
                }
            } catch (err) {
                console.error('Failed to fetch news data:', err)
                setError('Gagal memuat data dari server')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [transactionId])

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValues({
                nomor: nomorBeritaAcara,
                nama: namaPembukaAcara,
                jabatan: jabatanPembukaAcara,
                instansi: instansiTerlibat
            })
        }, 500) // Lower back to 500ms since HTML is fast

        return () => clearTimeout(timer)
    }, [nomorBeritaAcara, namaPembukaAcara, jabatanPembukaAcara, instansiTerlibat])

    const memoizedPDF = useMemo(() => (
        <BeritaAcaraPDF
            nomorBeritaAcara={debouncedValues.nomor}
            tableData={tableData}
            namaPembukaAcara={debouncedValues.nama}
            jabatanPembukaAcara={debouncedValues.jabatan}
            instansiTerlibat={debouncedValues.instansi}
            totalData={transactionMeta.total_data}
            handledData={transactionMeta.handled_data}
            elements={transactionMeta.elements}
        />
    ), [debouncedValues, tableData, transactionMeta])

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            // Ensure we're on client-side
            if (typeof window === 'undefined') {
                throw new Error('PDF generation only works on client-side')
            }

            // Import PDF generator
            const { generatePDF } = await import('./PDFGenerator')
            const pdfBlob = await generatePDF({
                nomorBeritaAcara,
                namaPembukaAcara,
                jabatanPembukaAcara,
                instansiTerlibat,
                tableData,
                totalData: transactionMeta.total_data,
                handledData: transactionMeta.handled_data,
                elements: transactionMeta.elements
            })

            // Step 2: Upload PDF to /api/media/upload/docs
            const formData = new FormData()
            const safeNomor = nomorBeritaAcara.replace(/\//g, '-')
            formData.append('file', pdfBlob, `berita-acara-${safeNomor}.pdf`)

            const token = localStorage.getItem('token')
            const uploadResponse = await fetch(`${API_URL}/media/upload/docs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const uploadResult = await uploadResponse.json()

            if (uploadResult.error || !uploadResult.data?.url) {
                throw new Error(uploadResult.message || 'Gagal upload PDF')
            }

            const fileUrl = uploadResult.data.url

            // Step 3: Submit form data to /api/verifications/transaction/{transactionId}/news
            const submitResponse = await fetch(`${API_URL}/verifications/transaction/${transactionId}/news`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    news_number: nomorBeritaAcara,
                    news_opener_name: namaPembukaAcara,
                    news_opener_position: jabatanPembukaAcara,
                    file_url: fileUrl
                })
            })

            const submitResult = await submitResponse.json()

            if (submitResult.error) {
                throw new Error(submitResult.message || 'Gagal mengirim berita acara')
            }

            alert('Berita acara berhasil dikirim!')
            router.push('/penelaahan?tab=review-data')
        } catch (err) {
            console.error('Failed to submit:', err)
            alert('Gagal mengirim berita acara: ' + (err instanceof Error ? err.message : 'Unknown error'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <ReviewerLayout>
            <div className="flex h-full pt-20">
                {/* Left Side - Form */}
                <div className="w-2/5 p-6 overflow-y-auto border-r">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/penelaahan?tab=review-data">
                            <Button size='icon-sm' variant="ghost">
                                <ChevronLeft />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Cetak Berita Acara</h1>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Nomor Berita Acara */}
                        <div className="space-y-2">
                            <Label htmlFor="nomor">Nomor Berita Acara <span className="text-red-500">*</span></Label>
                            <Input
                                id="nomor"
                                placeholder="Nomor Berita Acara"
                                value={nomorBeritaAcara}
                                onChange={(e) => setNomorBeritaAcara(e.target.value)}
                                disabled={submitting}
                                required
                            />
                        </div>

                        {/* Nama & Jabatan Pembuka Acara */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Pembuka Acara <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nama"
                                    placeholder="Nama Pembuka Acara"
                                    value={namaPembukaAcara}
                                    onChange={(e) => setNamaPembukaAcara(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jabatan">Jabatan Pembuka Acara <span className="text-red-500">*</span></Label>
                                <Input
                                    id="jabatan"
                                    placeholder="Jabatan Pembuka Acara"
                                    value={jabatanPembukaAcara}
                                    onChange={(e) => setJabatanPembukaAcara(e.target.value)}
                                    disabled={submitting}
                                    required
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
                                disabled={submitting}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={submitting}
                                onClick={() => router.push('/penelaahan?tab=review-data')}
                            >
                                Batal
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mengirim...
                                    </>
                                ) : 'Kirim'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - HTML Preview */}
                <div className="flex-1 bg-gray-200 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Pratinjau Dokumen</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white"
                                onClick={() => setShowFullPreview(true)}
                                disabled={loading}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Lihat Dokumen PDF yang akan dicetak
                            </Button>
                        </div>
                    </div>

                    <div className="transform scale-[0.65] origin-top">
                        {loading ? (
                            <div className="flex items-center justify-center h-[800px] bg-white rounded-lg shadow-xl">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-gray-500">Memuat pratinjau...</p>
                                </div>
                            </div>
                        ) : (
                            <HTMLPreview
                                nomor={nomorBeritaAcara}
                                nama={namaPembukaAcara}
                                jabatan={jabatanPembukaAcara}
                                instansi={instansiTerlibat}
                                tableData={tableData}
                                loading={loading}
                                totalData={transactionMeta.total_data}
                                handledData={transactionMeta.handled_data}
                                elements={transactionMeta.elements}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Real PDF Preview */}
            {showFullPreview && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-8">
                    <div className="relative w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-bold text-lg">Pratinjau Berita Acara</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowFullPreview(false)}>
                                <X className="w-6 h-6 rotate-180" />
                                Tutup
                            </Button>
                        </div>
                        <div className="flex-1">
                            <PDFViewer width="100%" height="100%" className="border-none">
                                {memoizedPDF}
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </ReviewerLayout>
    )
}

const Page = () => {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Memuat halaman...</p>
                </div>
            </div>
        }>
            <CetakBeritaAcaraContent />
        </Suspense>
    )
}

export default Page
