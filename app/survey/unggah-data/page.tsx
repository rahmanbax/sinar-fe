"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import SurveyorLayout from "@/layouts/SurveryorLayout";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { uploadShpZip } from "@/api/media";
import { FileArchive, Loader2, X } from "lucide-react";

export default function UnggahData() {
    const router = useRouter();
    const { token } = useAuth();
    
    // Step state
    const [step, setStep] = useState<1 | 2>(1);

    // Form states Step 1
    const [sumber, setSumber] = useState("");
    const [waktuMulai, setWaktuMulai] = useState("");
    const [waktuHingga, setWaktuHingga] = useState("");
    const [jenisPerolehan, setJenisPerolehan] = useState("");
    const [metode, setMetode] = useState("");

    // Form states Step 2
    const [jenisGeometri, setJenisGeometri] = useState("Titik");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        if (fileExt !== 'zip' && fileExt !== 'rar') {
            alert("File harus dalam format .zip atau .rar");
            e.target.value = '';
            return;
        }

        setFile(selectedFile);
        e.target.value = '';
    };

    const handleNext = () => {
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Silakan pilih file terlebih dahulu");
            return;
        }
        if (!token) {
            alert("Autentikasi bermasalah, silakan login kembali.");
            return;
        }

        setIsUploading(true);
        try {
            // Include extra data in real app here if backend supports it
            const res = await uploadShpZip(file, token);
            if (res.error) {
                alert(`Upload gagal: ${res.message}`);
            } else {
                alert("Upload berhasil!");
                router.push('/survey?tab=data-delivery');
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Terjadi kesalahan saat mengunggah file.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <SurveyorLayout>
            <div className="flex flex-col flex-1 h-full bg-white p-8 pt-[100px] overflow-hidden">
                <div className="w-full border border-gray-200 rounded-lg p-10">
                    {step === 1 && (
                        <div>
                            <h1 className="text-2xl font-semibold mb-10 text-black">Form Pengisian Transaksi Penyampaian Data</h1>
                            
                            <div className="space-y-6">
                                {/* Nama Kegiatan */}
                                <div>
                                    <Label className="font-bold text-sm mb-3 block text-black">Nama Kegiatan (Sumber)</Label>
                                    <Input 
                                        placeholder="Sumber" 
                                        value={sumber}
                                        onChange={(e) => setSumber(e.target.value)}
                                        className="w-full max-w-[500px] border-gray-300 placeholder:text-gray-400 text-left placeholder:text-left px-4"
                                    />
                                </div>

                                {/* Waktu Akuisisi */}
                                <div>
                                    <Label className="font-bold text-sm mb-3 block text-black">Waktu Akuisisi</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-600 text-sm whitespace-nowrap">Mulai dari</span>
                                            <Input 
                                                type="date" 
                                                value={waktuMulai}
                                                onChange={(e) => setWaktuMulai(e.target.value)}
                                                className="w-64 border-gray-300 text-gray-500 justify-center text-center flex"
                                            />
                                        </div>
                                        <span className="text-gray-600 text-sm whitespace-nowrap">hingga</span>
                                        <div className="flex items-center gap-4">
                                            <Input 
                                                type="date" 
                                                value={waktuHingga}
                                                onChange={(e) => setWaktuHingga(e.target.value)}
                                                className="w-64 border-gray-300 text-gray-500 justify-center text-center flex"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Jenis Perolehan Data */}
                                <div>
                                    <Label className="font-bold text-sm mb-3 block text-black">Jenis Perolehan Data</Label>
                                    <Select value={jenisPerolehan} onValueChange={setJenisPerolehan}>
                                        <SelectTrigger className="w-full max-w-[500px] border-gray-300">
                                            <SelectValue placeholder="Pilih Salah Satu" className="placeholder:text-center flex justify-center w-full" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Partisipatif">Partisipatif</SelectItem>
                                            <SelectItem value="Urun Daya">Urun Daya</SelectItem>
                                            <SelectItem value="Data Sekunder">Data Sekunder</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Metode */}
                                <div>
                                    <Label className="font-bold text-sm mb-3 block text-black">Metode</Label>
                                    <Input 
                                        placeholder="Metode" 
                                        value={metode}
                                        onChange={(e) => setMetode(e.target.value)}
                                        className="w-full max-w-[500px] border-gray-300 placeholder:text-gray-400 text-left placeholder:text-left px-4"
                                    />
                                </div>
                            </div>
                            
                            {/* Buttons */}
                            <div className="mt-16 flex gap-3">
                                <Link href="/survey?tab=data-delivery">
                                    <Button variant="outline" className="bg-[#9A9A9A] text-white hover:bg-[#858585] hover:text-white border-none min-w-[100px] h-10 px-6 rounded-md shadow-sm">
                                        Batal
                                    </Button>
                                </Link>
                                <Button className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white min-w-[100px] h-10 px-6 rounded-md shadow-sm" onClick={handleNext}>
                                    Lanjut
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h1 className="text-2xl font-semibold mb-10 text-black">Unggah Data</h1>

                            <div className="space-y-8">
                                {/* Jenis Geometri SHP */}
                                <div>
                                    <Label className="font-bold text-sm mb-4 block text-black">Jenis Geometri SHP</Label>
                                    <RadioGroup 
                                        value={jenisGeometri} 
                                        onValueChange={setJenisGeometri}
                                        className="flex gap-8 items-center"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Titik" id="titik" className="w-5 h-5 border-2 border-gray-400 text-[#5CB85C] data-[state=checked]:border-[#5CB85C] [&_svg]:!fill-[#5CB85C]" />
                                            <Label htmlFor="titik" className="text-sm text-gray-700 font-medium cursor-pointer">Titik</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Garis" id="garis" className="w-5 h-5 border-2 border-gray-400 text-[#5CB85C] data-[state=checked]:border-[#5CB85C] [&_svg]:!fill-[#5CB85C]" />
                                            <Label htmlFor="garis" className="text-sm text-gray-700 font-medium cursor-pointer">Garis</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Area" id="area" className="w-5 h-5 border-2 border-gray-400 text-[#5CB85C] data-[state=checked]:border-[#5CB85C] [&_svg]:!fill-[#5CB85C]" />
                                            <Label htmlFor="area" className="text-sm text-gray-700 font-medium cursor-pointer">Area</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Unggah SHP */}
                                <div>
                                    <Label className="font-bold text-sm mb-3 block text-black">Unggah SHP</Label>
                                    {!file ? (
                                        <div className="relative w-full max-w-[500px] border border-gray-300 rounded-md overflow-hidden bg-white hover:bg-gray-50 transition-colors h-10">
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".zip,.rar,application/zip,application/x-zip-compressed"
                                                onChange={handleFileChange}
                                            />
                                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                                Pilih Berkas (.zip/.rar)
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border border-green-300 bg-green-50 rounded-md p-2 flex items-center justify-between w-full max-w-[500px] h-10">
                                            <div className="flex items-center gap-2 truncate pl-2">
                                                <FileArchive className="h-4 w-4 text-green-600 shrink-0" />
                                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 mr-1"
                                                onClick={() => setFile(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-16 flex gap-3">
                                <Button variant="outline" className="bg-[#9A9A9A] text-white hover:bg-[#858585] hover:text-white border-none min-w-[100px] h-10 px-6 rounded-md shadow-sm" onClick={handleBack} disabled={isUploading}>
                                    Batal
                                </Button>
                                <Button className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white min-w-[100px] h-10 px-6 rounded-md shadow-sm flex items-center justify-center gap-2" onClick={handleUpload} disabled={!file || isUploading}>
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Unggah"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SurveyorLayout>
    );
}
