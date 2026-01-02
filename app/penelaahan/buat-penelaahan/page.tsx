"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Page = () => {
    const [tanggalAwal, setTanggalAwal] = useState('')
    const [tanggalAkhir, setTanggalAkhir] = useState('')
    const [jenisUnsur, setJenisUnsur] = useState('')
    const [wilayahAdministrasi, setWilayahAdministrasi] = useState('')
    const [verifikator, setVerifikator] = useState('')

    const handleSubmit = () => {
        // TODO: Submit form
        console.log({
            tanggalAwal,
            tanggalAkhir,
            jenisUnsur,
            wilayahAdministrasi,
            verifikator
        })
    }

    return (
        <ReviewerLayout>
            <div className="pt-20 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/penelaahan">
                        <Button size='icon-sm' variant="ghost">
                            <ChevronLeft />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Buat Penelaahan</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Form Penelaahan Baru</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Tanggal Awal & Akhir */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tanggal-awal">Tanggal Awal</Label>
                                <Input
                                    id="tanggal-awal"
                                    type="date"
                                    value={tanggalAwal}
                                    onChange={(e) => setTanggalAwal(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tanggal-akhir">Tanggal Akhir</Label>
                                <Input
                                    id="tanggal-akhir"
                                    type="date"
                                    value={tanggalAkhir}
                                    onChange={(e) => setTanggalAkhir(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Jenis Unsur */}
                        <div className="space-y-2">
                            <Label>Jenis Unsur</Label>
                            <Select value={jenisUnsur} onValueChange={setJenisUnsur}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Jenis Unsur" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pelabuhan-laut">Pelabuhan Laut</SelectItem>
                                    <SelectItem value="pelabuhan-penyeberangan">Pelabuhan Penyeberangan</SelectItem>
                                    <SelectItem value="pelabuhan-sungai">Pelabuhan Sungai & Danau</SelectItem>
                                    <SelectItem value="terminal-bus">Terminal Bus</SelectItem>
                                    <SelectItem value="bandara">Bandara</SelectItem>
                                    <SelectItem value="stasiun-kereta">Stasiun Kereta Api</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Wilayah Administrasi */}
                        <div className="space-y-2">
                            <Label>Wilayah Administrasi</Label>
                            <Select value={wilayahAdministrasi} onValueChange={setWilayahAdministrasi}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Wilayah Administrasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aceh">Aceh</SelectItem>
                                    <SelectItem value="sumatera-utara">Sumatera Utara</SelectItem>
                                    <SelectItem value="sumatera-barat">Sumatera Barat</SelectItem>
                                    <SelectItem value="riau">Riau</SelectItem>
                                    <SelectItem value="jambi">Jambi</SelectItem>
                                    <SelectItem value="sumatera-selatan">Sumatera Selatan</SelectItem>
                                    <SelectItem value="bengkulu">Bengkulu</SelectItem>
                                    <SelectItem value="lampung">Lampung</SelectItem>
                                    <SelectItem value="dki-jakarta">DKI Jakarta</SelectItem>
                                    <SelectItem value="jawa-barat">Jawa Barat</SelectItem>
                                    <SelectItem value="jawa-tengah">Jawa Tengah</SelectItem>
                                    <SelectItem value="jawa-timur">Jawa Timur</SelectItem>
                                    <SelectItem value="banten">Banten</SelectItem>
                                    <SelectItem value="bali">Bali</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Verifikator */}
                        <div className="space-y-2">
                            <Label>Verifikator</Label>
                            <Select value={verifikator} onValueChange={setVerifikator}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Verifikator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tim-1">Tim Verifikator 1</SelectItem>
                                    <SelectItem value="tim-2">Tim Verifikator 2</SelectItem>
                                    <SelectItem value="tim-3">Tim Verifikator 3</SelectItem>
                                    <SelectItem value="tim-4">Tim Verifikator 4</SelectItem>
                                    <SelectItem value="tim-5">Tim Verifikator 5</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Link href="/penelaahan" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={handleSubmit}
                            >
                                Buat Penelaahan
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ReviewerLayout>
    )
}

export default Page
