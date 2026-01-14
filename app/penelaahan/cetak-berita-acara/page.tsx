"use client"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronLeft, Upload, Loader2 } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { API_URL } from "@/lib/config"
import dynamic from "next/dynamic"
import BeritaAcaraPDF from "./BeritaAcaraPDF"

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    { ssr: false }
)

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



const Page = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const transactionId = searchParams.get('transactionId')

    const [nomorBeritaAcara, setNomorBeritaAcara] = useState('')
    const [namaPembukaAcara, setNamaPembukaAcara] = useState('')
    const [jabatanPembukaAcara, setJabatanPembukaAcara] = useState('')
    const [instansiTerlibat, setInstansiTerlibat] = useState('')

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
        }, 500) // 500ms delay

        return () => clearTimeout(timer)
    }, [nomorBeritaAcara, namaPembukaAcara, jabatanPembukaAcara, instansiTerlibat])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setKopSurat(e.target.files[0])
        }
    }

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
            formData.append('file', pdfBlob, `berita-acara-${nomorBeritaAcara}.pdf`)

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
            router.push('/penelaahan')
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
                <div className="w-1/2 p-6 overflow-y-auto border-r">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/penelaahan">
                            <Button size='icon-sm' variant="ghost">
                                <ChevronLeft />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Buat Berita Acara</h1>
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
                                onClick={() => router.push('/penelaahan')}
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

                {/* Right Side - PDF Preview */}
                <div className="w-1/2 bg-gray-100 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Pratinjau Berita Acara</h2>
                        <div className="flex gap-2">
                            <Button size="icon-sm" variant="ghost">100%</Button>
                        </div>
                    </div>
                    <div className="mx-auto w-full h-[800px] border rounded-lg overflow-hidden bg-white shadow-xl">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-gray-500">Memuat pratinjau...</p>
                                </div>
                            </div>
                        ) : (
                            <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
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
                            </PDFViewer>
                        )}
                    </div>
                </div>
            </div>
        </ReviewerLayout>
    )
}

export default Page
