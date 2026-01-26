"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BigLayout from "@/layouts/BigLayout"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useApiHandler } from "@/utils/apiHandler"
import { API_URL } from "@/lib/config"

const GazeterFormPage: React.FC = () => {
    const router = useRouter()
    const { token } = useAuth()
    const [judul, setJudul] = useState('')
    const [edisi, setEdisi] = useState('')
    const [cover, setCover] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const apiHandler = useApiHandler({
        setLoading,
        shouldHandleError: false
    })

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCover(file)
            setCoverPreview(URL.createObjectURL(file))
        }
    }

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch(`${API_URL}/media/upload/image`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        const result = await res.json()
        if (result.error) {
            throw new Error(result.message || "Gagal mengunggah gambar")
        }
        return result.data.url
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!judul || !edisi || !cover) {
            alert("Harap isi semua field dan pilih gambar sampul.")
            return
        }

        try {
            setLoading(true)

            // 1. Upload image
            const coverUrl = await uploadImage(cover)

            // 2. Submit gazetteer
            await apiHandler('POST', '/big/gazetteer', {
                title: judul,
                edition: edisi,
                cover_img: coverUrl
            })

            alert("Berhasil menambahkan gazetteer")
            router.push('/big?tab=pembuatan-gri')
        } catch (err: any) {
            console.error(err)
            alert(err.message || "Terjadi kesalahan saat menyimpan data")
        } finally {
            setLoading(false)
        }
    }

    return (
        <BigLayout>
            <div className="p-6 pt-24 min-h-[calc(100vh-60px)]">
                <Card>
                    <CardTitle className="sr-only">Form Pembuatan Gazeter</CardTitle>
                    <CardContent className="px-8 py-6">
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" onClick={() => router.back()}>
                                <ChevronLeft className="" />
                            </Button>
                            <h2 className="text-xl font-semibold">Form Pembuatan Gazeter</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                            <div className="space-y-2">
                                <Label htmlFor="judul">Judul</Label>
                                <Input
                                    id="judul"
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    placeholder="Masukkan judul"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edisi">Edisi</Label>
                                <Input
                                    id="edisi"
                                    value={edisi}
                                    onChange={(e) => setEdisi(e.target.value)}
                                    placeholder="Masukkan edisi"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cover">Cover (Gambar)</Label>
                                <Input
                                    id="cover"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                />
                                {coverPreview && (
                                    <div className="mt-2 relative w-40 h-56 border rounded-md overflow-hidden">
                                        <img
                                            src={coverPreview}
                                            alt="Cover Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="bg-green-500 hover:bg-green-700" disabled={loading}>
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </BigLayout>
    )
}

export default GazeterFormPage
