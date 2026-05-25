"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ButtonComponent from "@/components/v2/buttons/ButtonComponent"
import { ChevronLeft, Loader2, Upload, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useBeritaAcaraData, useSubmitBeritaAcara } from "@/hooks/useBeritaAcara"
import { API_URL } from "@/lib/config"
import dynamic from "next/dynamic"
import BeritaAcaraPDF, { TableRow } from "../pdf/BeritaAcaraPDF"

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    { ssr: false }
)

interface FormData {
    news_number: string
    news_opener_name: string
    news_opener_position: string
    involved_agencies: string
}

interface HTMLPreviewProps {
    formData: FormData
    tableData: TableRow[]
    totalData: number
    handledData: number
    elements: string[]
}

const HTMLPreview = ({
    formData,
    tableData,
    totalData,
    handledData,
    elements
}: HTMLPreviewProps) => {
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
                <p>NOMOR: {formData.news_number?.toUpperCase() || '.......................'}</p>
                <p>PENELAAHAN NAMA RUPABUMI TINGKAT PUSAT</p>
                <p>TAHUN 2026</p>
            </div>

            {/* Content */}
            <div className="space-y-4 text-justify text-[10pt]" style={{ lineHeight: 1.5 }}>
                <p><span className="font-bold">I.</span> Pada hari Senin sampai dengan Jumat, tanggal Dua Puluh sampai dengan Dua Puluh Empat bulan Januari tahun Dua Ribu Dua Puluh Lima, telah dilaksanakan kegiatan Penelaahan Nama Rupabumi Tingkat Pusat di Cibinong.</p>
                <p><span className="font-bold">II.</span> Acara secara resmi dibuka oleh {formData.news_opener_name || '.......................'} selaku {formData.news_opener_position || '.......................'}, Badan Informasi Geospasial (BIG). Acara dihadiri oleh perwakilan dari Badan Informasi Geospasial{formData.involved_agencies ? ' dan ' + formData.involved_agencies : ''}.</p>
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

interface CetakBeritaAcaraFormProps {
    backPath: string
    redirectAfterSubmit: string
}

const CetakBeritaAcaraForm = ({ backPath, redirectAfterSubmit }: CetakBeritaAcaraFormProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const transactionId = searchParams.get('transactionId')
    const { token } = useAuth()

    const { register, handleSubmit, watch, reset, formState: { isValid } } = useForm<FormData>({
        mode: 'onChange',
        defaultValues: {
            news_number: '',
            news_opener_name: '',
            news_opener_position: '',
            involved_agencies: ''
        }
    })

    const watchAllFields = watch()
    const [showFullPreview, setShowFullPreview] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [isAlreadySent, setIsAlreadySent] = useState(false)

    // Data Fetching
    const { data: beritaAcaraData, isLoading: loadingData } = useBeritaAcaraData(token, transactionId)
    const submitMutation = useSubmitBeritaAcara()

    useEffect(() => {
        if (beritaAcaraData?.news) {
            setIsAlreadySent(true)
            reset({
                news_number: beritaAcaraData.news.news_number,
                news_opener_name: beritaAcaraData.news.news_opener_name,
                news_opener_position: beritaAcaraData.news.news_opener_position,
                involved_agencies: beritaAcaraData.news.involved_agencies || ''
            })
        }
    }, [beritaAcaraData, reset])

    const tableData: TableRow[] = useMemo(() => {
        if (!beritaAcaraData?.province_data) return []
        return beritaAcaraData.province_data.map((item, index) => ({
            no: index + 1,
            wilayah: item.name,
            dataAwal: item.total_data,
            ditelaah: item.handled_data,
            diterima: item.accepted_data,
            ditolak: item.rejected_data
        }))
    }, [beritaAcaraData])

    const onSubmit = async (data: FormData) => {
        if (!transactionId) return
        setSubmitting(true)
        try {
            // 1. Generate PDF
            const { generatePDF } = await import('../pdf/PDFGenerator')
            const pdfBlob = await generatePDF({
                nomorBeritaAcara: data.news_number,
                namaPembukaAcara: data.news_opener_name,
                jabatanPembukaAcara: data.news_opener_position,
                instansiTerlibat: data.involved_agencies,
                tableData,
                totalData: beritaAcaraData?.transaction?.total_data || 0,
                handledData: beritaAcaraData?.transaction?.handled_data || 0,
                elements: beritaAcaraData?.elements || []
            })

            // 2. Upload PDF
            const formData = new FormData()
            const safeNomor = data.news_number.replace(/\//g, '-')
            formData.append('file', pdfBlob, `berita-acara-${safeNomor}.pdf`)

            const uploadResponse = await fetch(`${API_URL}/media/upload/docs`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })
            const uploadResult = await uploadResponse.json()

            if (uploadResult.error || !uploadResult.data?.url) {
                throw new Error(uploadResult.message || 'Gagal upload PDF')
            }

            // 3. Submit Berita Acara Data
            await submitMutation.mutateAsync({
                token,
                transactionId,
                data: {
                    news_number: data.news_number,
                    news_opener_name: data.news_opener_name,
                    news_opener_position: data.news_opener_position,
                    file_url: uploadResult.data.url
                }
            })

            alert('Berita acara berhasil dikirim!')
            router.push(redirectAfterSubmit)
        } catch (err) {
            console.error(err)
            alert('Gagal mengirim berita acara: ' + (err instanceof Error ? err.message : 'Terjadi kesalahan'))
        } finally {
            setSubmitting(false)
        }
    }

    const memoizedPDF = useMemo(() => (
        <BeritaAcaraPDF
            nomorBeritaAcara={watchAllFields.news_number}
            namaPembukaAcara={watchAllFields.news_opener_name}
            jabatanPembukaAcara={watchAllFields.news_opener_position}
            instansiTerlibat={watchAllFields.involved_agencies}
            tableData={tableData}
            totalData={beritaAcaraData?.transaction?.total_data || 0}
            handledData={beritaAcaraData?.transaction?.handled_data || 0}
            elements={beritaAcaraData?.elements || []}
        />
    ), [watchAllFields, tableData, beritaAcaraData])

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs Placeholder */}
            <div className="text-sm text-gray-500 flex items-center gap-2">
                <Link href={backPath.includes('verifikator-provinsi') ? '/v2/verifikator-provinsi' : '/v2/verifikator-kota'} className="hover: transition-colors">Dashboard</Link>
                <span>/</span>
                <Link href={backPath} className="hover: transition-colors">Data Penelaahan</Link>
                <span>/</span>
                <span className=" font-bold">Cetak Berita Acara</span>
            </div>

            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold ">Cetak Berita Acara</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side - Form */}
                <Card className="lg:col-span-5 rounded-2xl shadow-sm border-gray-100">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="news_number" className="text-sm font-semibold text-gray-700">No. Berita Acara</Label>
                                <Input
                                    id="news_number"
                                    placeholder="Masukkan No. Berita Acara"
                                    {...register('news_number', { required: true })}
                                    className="rounded-xl border-gray-200 h-12"
                                    disabled={submitting || isAlreadySent}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="news_opener_name" className="text-sm font-semibold text-gray-700">Nama Pembuka Acara</Label>
                                <Input
                                    id="news_opener_name"
                                    placeholder="Masukkan Nama Pembuka Acara"
                                    {...register('news_opener_name', { required: true })}
                                    className="rounded-xl border-gray-200 h-12"
                                    disabled={submitting || isAlreadySent}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="news_opener_position" className="text-sm font-semibold text-gray-700">Jabatan Pembuka Acara</Label>
                                <Input
                                    id="news_opener_position"
                                    placeholder="Masukkan Jabatan Pembuka Acara"
                                    {...register('news_opener_position', { required: true })}
                                    className="rounded-xl border-gray-200 h-12"
                                    disabled={submitting || isAlreadySent}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="involved_agencies" className="text-sm font-semibold text-gray-700">K/L/P atau instansi lain yang terlibat</Label>
                                <Input
                                    id="involved_agencies"
                                    placeholder="Masukkan K/L/P atau instansi lain yang terlibat"
                                    {...register('involved_agencies')}
                                    className="rounded-xl border-gray-200 h-12"
                                    disabled={submitting || isAlreadySent}
                                />
                            </div>

                            <ButtonComponent
                                type="submit"
                                label={submitting ? "Mengirim..." : isAlreadySent ? "Sudah Terkirim" : "Kirim"}
                                disabled={!isValid || submitting || isAlreadySent}
                                className="w-full h-12 rounded-xl mt-4"
                                icon={submitting ? <Loader2 className="animate-spin" size={18} /> : null}
                            />
                        </form>
                    </CardContent>
                </Card>

                {/* Right Side - Preview */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold ">Pratinjau Dokumen</h2>
                        <button
                            onClick={() => setShowFullPreview(true)}
                            className="text-sm font-bold text-navy-600 flex items-center gap-2 hover:underline"
                        >
                            <Upload size={16} /> Lihat Dokumen PDF yang akan dicetak
                        </button>
                    </div>

                    <div className="bg-gray-100 rounded-2xl p-8 overflow-hidden min-h-150 border border-gray-200 relative">
                        {loadingData ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50 backdrop-blur-sm">
                                <Loader2 className="animate-spin text-navy-500" size={32} />
                                <p className="text-gray-500 font-medium">Memuat data...</p>
                            </div>
                        ) : (
                            <div className="transform scale-[0.55] md:scale-[0.65] origin-top">
                                <HTMLPreview
                                    formData={watchAllFields}
                                    tableData={tableData}
                                    totalData={beritaAcaraData?.transaction?.total_data || 0}
                                    handledData={beritaAcaraData?.transaction?.handled_data || 0}
                                    elements={beritaAcaraData?.elements || []}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full PDF Preview Modal */}
            {showFullPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 md:p-8">
                    <Card className="relative w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border-none">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-bold text-lg ">Pratinjau Berita Acara</h3>
                            <button onClick={() => setShowFullPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-500">
                            <PDFViewer width="100%" height="100%" className="border-none">
                                {memoizedPDF}
                            </PDFViewer>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default CetakBeritaAcaraForm
