'use client'
import ButtonComponent from '@/components/v2/buttons/ButtonComponent'
import VerifikatorKotaLayout from '@/components/v2/nav/VerifikatorKotaLayout'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const DataRekomendasiPage = () => {
    const router = useRouter();
    return (
        <VerifikatorKotaLayout>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Data Rekomendasi</h1>
                <ButtonComponent label="Buat Rekomendasi" icon={<Plus size={18} />} onClick={() => router.push('/v2/verifikator-kota/data-rekomendasi/buat')} />
            </div>
            {/* tabel */}
            <div className="mt-6">
                <DataTable columns={columns} data={data} />
            </div>
        </VerifikatorKotaLayout>
    )
}

export default DataRekomendasiPage