"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, Printer, MapPin, Clock, Save } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useContactSetting, useUpdateContactSettingMutation } from "@/hooks/useCms";

interface FieldProps {
    icon: React.ReactNode;
    label: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
}

const ContactField = ({ icon, label, id, value, onChange, placeholder, multiline }: FieldProps) => (
    <div className="flex gap-4 items-start">
        <div className="mt-2 shrink-0 w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center text-navy-500">
            {icon}
        </div>
        <div className="flex-1">
            <label htmlFor={id} className="block text-sm font-semibold text-black mb-1.5">
                {label}
            </label>
            {multiline ? (
                <textarea
                    id={id}
                    rows={3}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm resize-none"
                />
            ) : (
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                />
            )}
        </div>
    </div>
);

const KontakKamiPage = () => {
    const { token } = useAuth();
    const { data: response, isLoading, isError } = useContactSetting(token);

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [fax, setFax] = useState("");
    const [address, setAddress] = useState("");
    const [operationalHours, setOperationalHours] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (response?.data) {
            setEmail(response.data.email ?? "");
            setPhone(response.data.phone ?? "");
            setFax(response.data.fax ?? "");
            setAddress(response.data.address ?? "");
            setOperationalHours(response.data.operational_hours ?? "");
        }
    }, [response]);

    const updateMutation = useUpdateContactSettingMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        updateMutation.mutate(
            {
                token,
                data: {
                    email,
                    phone,
                    fax,
                    address,
                    operational_hours: operationalHours,
                },
            },
            {
                onSuccess: () => setSuccess(true),
                onError: (err) => setError(err.message),
            }
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Kontak Kami</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola informasi kontak yang ditampilkan di website</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Memuat data...</div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-40 text-red-400 text-sm">
                        Gagal memuat data. Pastikan migration sudah dijalankan.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-6">
                        <ContactField
                            icon={<Mail size={18} />}
                            label="Email"
                            id="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="nna-ina@big.go.id"
                        />

                        <ContactField
                            icon={<Phone size={18} />}
                            label="WA / Telepon"
                            id="phone"
                            value={phone}
                            onChange={setPhone}
                            placeholder="0898-3163-030"
                        />

                        <ContactField
                            icon={<Printer size={18} />}
                            label="Fax"
                            id="fax"
                            value={fax}
                            onChange={setFax}
                            placeholder="021 8752064; 021 87901254"
                        />

                        <ContactField
                            icon={<MapPin size={18} />}
                            label="Alamat"
                            id="address"
                            value={address}
                            onChange={setAddress}
                            placeholder="Jalan Raya Jakarta-Bogor KM 46..."
                            multiline
                        />

                        <ContactField
                            icon={<Clock size={18} />}
                            label="Waktu Operasional"
                            id="operational_hours"
                            value={operationalHours}
                            onChange={setOperationalHours}
                            placeholder="Senin - Jumat, Pukul 09.00 - 15.00 WIB"
                        />

                        {success && (
                            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                                Data kontak berhasil disimpan.
                            </p>
                        )}

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 px-5 py-2.5 bg-navy-500 text-white text-sm font-semibold rounded-lg hover:bg-navy-600 disabled:opacity-60 transition-colors"
                            >
                                <Save size={16} />
                                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default KontakKamiPage;
