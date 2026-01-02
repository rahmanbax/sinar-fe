"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Upload, FileText, X, ArrowRight } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { Map, type MapRef, type ViewState } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

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

// Workflow Step Component
const WorkflowStep = ({ icon, label, isActive }: { icon: React.ReactNode, label: string, isActive?: boolean }) => (
    <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 flex items-center justify-center mb-2 rounded-full ${isActive ? ' bg-green-100' : ''}`}>
            {icon}
        </div>
        <p className={`text-sm max-w-[100px] ${isActive ? 'text-green-700 font-medium' : 'text-gray-600'}`}>{label}</p>
    </div>
)

const Page = () => {
    const router = useRouter()
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === 'application/pdf') {
                setUploadedFile(file)
            } else {
                alert('Hanya file PDF yang diperbolehkan')
            }
        }
    }

    const handleRemoveFile = () => {
        setUploadedFile(null)
    }

    const handleSubmit = () => {
        setIsSubmitted(true)
    }

    const handleFinish = () => {
        router.push('/penelaahan')
    }

    return (
        <ReviewerLayout>
            <div className="flex h-full pt-20">
                {/* Left Side */}
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
                    {!isSubmitted ? (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <Link href="/penelaahan">
                                    <Button size='icon-sm' variant="ghost">
                                        <ChevronLeft />
                                    </Button>
                                </Link>
                                <h1 className="text-xl font-bold">Unggah Surat Permohonan Rekomendasi</h1>
                            </div>

                            <Card className="max-w-screen">
                                <CardHeader>
                                    <CardTitle>Surat Permohonan Rekomendasi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* File Upload Area */}
                                    <div className="space-y-2">
                                        <Label>Unggah File PDF</Label>
                                        {!uploadedFile ? (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                                                <Input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    id="pdf-upload"
                                                />
                                                <label
                                                    htmlFor="pdf-upload"
                                                    className="cursor-pointer flex flex-col items-center gap-3"
                                                >
                                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Upload size={28} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-700">Klik untuk unggah atau drag & drop</p>
                                                        <p className="text-sm text-gray-500">Format: PDF (Maks. 10MB)</p>
                                                    </div>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="border rounded-lg p-4 border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                                            <FileText size={20} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={handleRemoveFile}
                                                        className="text-gray-500 hover:text-red-500 hover:bg-red-100"
                                                    >
                                                        <X size={18} />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" className="flex-1">
                                            Batal
                                        </Button>
                                        <Button
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                            disabled={!uploadedFile}
                                            onClick={handleSubmit}
                                        >
                                            Kirim Ke Provinsi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        /* Success View */
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-center mb-12">
                                <p className="text-lg text-gray-700">Anda telah mengunggah surat permohonan.</p>
                                <p className="text-lg text-gray-700">Saat ini adalah periode pemberian rekomendasi.</p>
                            </div>

                            {/* Workflow Diagram */}
                            <div className="flex items-center justify-center gap-4">
                                <WorkflowStep
                                    icon={<FileText size={28} className="text-green-600" />}
                                    label="Permohonan Rekomendasi"
                                    isActive={true}
                                />

                                <ArrowRight size={24} className="text-gray-400 mt-[-24px]" />

                                <WorkflowStep
                                    icon={<FileText size={28} className="text-gray-400" />}
                                    label="Pemberian Rekomendasi"
                                />

                                <ArrowRight size={24} className="text-gray-400 mt-[-24px]" />

                                <WorkflowStep
                                    icon={<FileText size={28} className="text-gray-400" />}
                                    label="Data di Pusat"
                                />
                            </div>

                            {/* Selesai Button */}
                            <Button
                                className="mt-12 bg-blue-600 hover:bg-blue-700 px-8"
                                onClick={handleFinish}
                            >
                                Selesai
                            </Button>
                        </div>
                    )}
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
