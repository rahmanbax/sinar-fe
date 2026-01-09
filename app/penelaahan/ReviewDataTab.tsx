import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CircleUserRound, LayoutGrid, List, MapPin, Plus, Search, SlidersVertical } from "lucide-react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/config"

import { Chart as ChartJS, ChartData, ArcElement, Tooltip, Legend, Plugin } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Progress } from "@/components/ui/progress"
import dayjs from "dayjs"

ChartJS.register(ArcElement, Tooltip, Legend);

// API Response Type
interface VerificationTransaction {
    id: string
    title: string
    due_at: string
    status: string
    total_data: number
    handled_data: number
    accepted_data: number
    rejected_data: number
    element_count: number
    district_count: number
    verificator_count: number
}

// Toponym API Response Type
interface ToponymData {
    id: string
    element_id: string
    map_name: string
    local_name: string
    other_name: string
    name_meaning: string | null
    language_origin: string
    review_transaction_data: {
        transaction_id: string
        toponym_id: string
        accepted: boolean | null
        user: string | null
        handledts: string | null
        notes: string | null
    }[]
    location_point: {
        type: string
        coordinates: [number, number]
    }
    utm_zone: string
    element: {
        code: string
        name: string
        subcategory_id: string
        type: string | null
    }
}

const CenterTextPlugin: Plugin = {
    id: "centerText",
    afterDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        const dataset = chart.data.datasets[0];
        const value = dataset.data[0] as number;

        ctx.save();
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${value}%`, width / 2, height / 2);
        ctx.restore();
    }
};

const DoughnutPerformance: React.FC<{ data: number[], type: 'accepted' | 'rejected' }> = ({ data, type }) => {
    const chartData: ChartData<'doughnut'> = {
        labels: [type, ''],
        datasets: [
            {
                label: 'Dataset 1',
                data: data,
                backgroundColor: type === 'accepted' ? [
                    'rgba(21, 72, 30, 1)',
                    'rgba(21, 72, 30, 0.2)'
                ] : [
                    'rgba(179, 0, 3, 1)',
                    'rgba(179, 0, 3, 0.2)'
                ]
            },
        ],
    };

    return <Doughnut data={chartData} plugins={[CenterTextPlugin]} options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "85%",
        plugins: {
            legend: { display: false }
        }
    }} />
}

interface IReviewCard {
    id: number
    title: string
    reviewerCnt?: number
    elementTypeCnt?: number
    reviewedCnt?: number
    districtCnt?: number
    acceptedCnt?: number
    rejectedCnt?: number
    reviewEndTs?: Date
}

const ReviewCard:
    React.FC<IReviewCard> = ({
        id,
        title,
        reviewedCnt = 0,
        elementTypeCnt = 0,
        reviewerCnt = 0,
        districtCnt = 0,
        acceptedCnt = 0,
        rejectedCnt = 0,
        reviewEndTs
    }) => {
        return (
            <Card className="p-4 rounded-none border border-black shadow-none sm:w-full">
                <CardHeader className="flex justify-between px-0">
                    <CardTitle>ID Penelaahan #{id}</CardTitle>
                    <div className="border border-blue-600 text-blue-600 flex items-center justify-center text-center p-1 text-sm">
                        Proses Penelaahan
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <h3 className="text-xl mb-3">
                        {title}
                    </h3>
                    <div className="flex justify-between">
                        <div className="text-start">
                            <h5 className="mb-3">
                                <span className="text-xl">{reviewerCnt}</span> Verifikator
                            </h5>
                            <h5 className="mb-3">
                                <span className="text-xl">{reviewedCnt}</span> Data yang ditelaah
                            </h5>
                        </div>
                        <div className="text-end">
                            <h5 className="mb-3">
                                <span className="text-xl">{elementTypeCnt}</span> Jenis Unsur Rupabumi
                            </h5>
                            <h5 className="mb-3">
                                <span className="text-xl">{districtCnt}</span> Kecamatan
                            </h5>
                        </div>
                    </div>
                    <div className="flex gap-x-2 justify-center w-full h-30 mb-4">
                        <div className="text-center w-30 h-20">
                            <DoughnutPerformance data={[acceptedCnt, reviewedCnt - acceptedCnt]} type='accepted' />
                            <h5>{acceptedCnt}</h5>
                            <p>Data Diterima</p>
                        </div>

                        <div className="text-center w-30 h-20">
                            <DoughnutPerformance data={[acceptedCnt, reviewedCnt - rejectedCnt]} type='rejected' />
                            <h5>{rejectedCnt}</h5>
                            <p>Data Ditolak</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <Progress value={30} className="[&>*]:bg-[#0088FF]" />
                        <p>Penelaahan akan berakhir dalam 20 hari lagi</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

const ReviewDataTab: React.FC = () => {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<'card' | 'table' | 'all-koordinat'>('card')
    const [showKoordinatTable, setShowKoordinatTable] = useState(false)

    // API State
    const [reviewData, setReviewData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Koordinat view state (per transaction)
    const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
    const [toponymData, setToponymData] = useState<any[]>([])
    const [loadingToponyms, setLoadingToponyms] = useState(false)

    // All toponyms state
    const [allToponymsData, setAllToponymsData] = useState<any[]>([])
    const [loadingAllToponyms, setLoadingAllToponyms] = useState(false)

    // Fetch data from API
    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_URL}/verifications/transaction`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result = await response.json()

                if (!result.error && result.data) {
                    // Transform API data to match component structure
                    const transformedData = result.data.map((item: VerificationTransaction) => ({
                        id: item.id,
                        title: item.title,
                        startDate: null, // Not provided by API
                        endDate: item.due_at,
                        reviewerCnt: item.verificator_count,
                        reviewedCnt: item.total_data,
                        elementTypeCnt: item.element_count,
                        districtCnt: item.district_count,
                        acceptedCnt: item.accepted_data,
                        rejectedCnt: item.rejected_data,
                        status: item.status
                    }))
                    setReviewData(transformedData)
                }
            } catch (error) {
                console.error('Failed to fetch review data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchReviewData()
    }, [])

    // Fetch all toponyms data
    useEffect(() => {
        if (viewMode !== 'all-koordinat') return

        const fetchAllToponyms = async () => {
            setLoadingAllToponyms(true)
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_URL}/verifications/transaction/toponyms`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result = await response.json()

                if (!result.error && result.data) {
                    // Transform API data to match table structure
                    const transformedData = result.data.map((item: ToponymData) => {
                        // Determine status from accepted field
                        const accepted = item.review_transaction_data?.[0]?.accepted
                        let status = 'Proses Penelaahan'
                        if (accepted === true) {
                            status = 'Disetujui'
                        } else if (accepted === false) {
                            status = 'Ditolak'
                        }

                        return {
                            idToponim: item.id,
                            jenisUnsur: item.element?.name || '-',
                            namaRupabumi: item.map_name,
                            namaLain: item.other_name || '-',
                            artiNama: item.name_meaning || '-',
                            asalBahasa: item.language_origin || '-',
                            reviewTransaction: item.review_transaction_data?.[0],
                            koordinat: item.location_point ? `${item.location_point.coordinates[0]}, ${item.location_point.coordinates[1]}` : '-',
                            status: status
                        }
                    })
                    setAllToponymsData(transformedData)
                }
            } catch (error) {
                console.error('Failed to fetch all toponyms:', error)
            } finally {
                setLoadingAllToponyms(false)
            }
        }

        fetchAllToponyms()
    }, [viewMode])

    // Fetch toponym data when transaction is selected
    useEffect(() => {
        if (!selectedTransactionId) return

        const fetchToponymData = async () => {
            setLoadingToponyms(true)
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_URL}/verifications/transaction/${selectedTransactionId}/toponyms`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result = await response.json()

                if (!result.error && result.data) {
                    // Transform API data to match table structure
                    const transformedData = result.data.map((item: ToponymData) => {
                        // Determine status from accepted field
                        const accepted = item.review_transaction_data?.[0]?.accepted
                        let status = 'Proses Penelaahan'
                        if (accepted === true) {
                            status = 'Disetujui'
                        } else if (accepted === false) {
                            status = 'Ditolak'
                        }

                        return {
                            idToponim: item.id,
                            jenisUnsur: item.element?.name || '-',
                            namaRupabumi: item.map_name,
                            namaLain: item.other_name || '-',
                            artiNama: item.name_meaning || '-',
                            asalBahasa: item.language_origin || '-',
                            koordinat: item.location_point ? `${item.location_point.coordinates[0]}, ${item.location_point.coordinates[1]}` : '-',
                            status: status
                        }
                    })
                    setToponymData(transformedData)
                }
            } catch (error) {
                console.error('Failed to fetch toponym data:', error)
            } finally {
                setLoadingToponyms(false)
            }
        }

        fetchToponymData()
    }, [selectedTransactionId])

    const columns: ColumnConfig = {
        id: { label: 'ID Penelaahan' },
        dateRange: { label: 'Rentang Penelaahan' },
        title: { label: 'Judul Penelaahan' },
        reviewedCnt: { label: 'Jumlah Data Ditelaah' },
        acceptedCnt: { label: 'Jumlah Diterima' },
        rejectedCnt: { label: 'Jumlah Ditolak' },
        status: { label: 'Progres Penelaahan' },
        actions: { label: 'Aksi' },
    }

    // Columns for koordinat view
    const koordinatColumns: ColumnConfig = {
        idToponim: { label: 'ID Toponim' },
        jenisUnsur: { label: 'Jenis Unsur' },
        namaRupabumi: { label: 'Nama Rupabumi' },
        namaLain: { label: 'Nama Lain' },
        artiNama: { label: 'Arti Nama' },
        asalBahasa: { label: 'Asal Bahasa' },
        koordinat: { label: 'Koordinat' },
        status: { label: 'Status' },
    }

    // Transform data for table view with dateRange field
    const tableData = reviewData.map(item => ({
        ...item,
        dateRange: `${dayjs(item.startDate).format('DD/MM/YYYY')} s.d ${dayjs(item.endDate).format('DD/MM/YYYY')}`
    }))

    const options: Option[] = Object.keys(columns).map((c) => ({
        value: c,
        label: columns[c].label
    }))

    const koordinatOptions: Option[] = Object.keys(koordinatColumns).map((c) => ({
        value: c,
        label: koordinatColumns[c].label
    }))

    const [showCols, setShowCols] = useState<Option[]>(options)
    const [showKoordinatCols, setShowKoordinatCols] = useState<Option[]>(koordinatOptions)

    const handleBackToReview = () => {
        setShowKoordinatTable(false)
        setSelectedTransactionId(null)
    }

    return (
        <div className="block px-4">
            <div className="flex justify-end items-center mb-4 gap-2">
                <Button>
                    <Link href="/penelaahan/buat-penelaahan">
                        <div className="flex gap-1 items-center">
                            <Plus className="text-white" />
                            Buat penelaahan
                        </div>
                    </Link>
                </Button>

                {/* View Toggle - Only show if not in koordinat table */}
                {!showKoordinatTable && (
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        <Button
                            size="icon"
                            variant={viewMode === 'card' ? 'default' : 'ghost'}
                            className={cn(
                                "rounded-md",
                                viewMode === 'card' ? 'bg-white text-black shadow-sm hover:bg-gray-50' : 'hover:bg-white'
                            )}
                            onClick={() => setViewMode('card')}
                            title="Tampilan Kartu"
                        >
                            <LayoutGrid size={18} />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            className={cn(
                                "rounded-md",
                                viewMode === 'table' ? 'bg-white text-black shadow-sm hover:bg-gray-50' : 'hover:bg-white'
                            )}
                            onClick={() => setViewMode('table')}
                            title="Tampilan Tabel Penelaahan"
                        >
                            <List size={18} />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewMode === 'all-koordinat' ? 'default' : 'ghost'}
                            className={cn(
                                "rounded-md",
                                viewMode === 'all-koordinat' ? 'bg-white text-black shadow-sm hover:bg-gray-50' : 'hover:bg-white'
                            )}
                            onClick={() => setViewMode('all-koordinat')}
                            title="Tampilan Semua Koordinat"
                        >
                            <MapPin size={18} />
                        </Button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            ) : showKoordinatTable ? (
                <Card className="mt-4">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={handleBackToReview}
                        >
                            <ChevronLeft />
                        </Button>
                        <CardTitle>
                            {reviewData.find(item => item.id === selectedTransactionId)?.title || 'Data Toponim'} - ID Transaksi: {selectedTransactionId}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadingToponyms ? (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-500">Memuat data toponim...</p>
                            </div>
                        ) : (
                            <SinarParameterizedTable
                                data={toponymData}
                                columns={koordinatColumns}
                                showCols={showKoordinatCols}
                                actHandler={(item) => {
                                    router.push(`/penelaahan/detail-toponim?transactionId=${selectedTransactionId}&toponymId=${item.idToponim}`)
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            ) : viewMode === 'all-koordinat' ? (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Semua Data Toponim</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadingAllToponyms ? (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-500">Memuat semua data toponim...</p>
                            </div>
                        ) : (
                            <SinarParameterizedTable
                                data={allToponymsData}
                                columns={koordinatColumns}
                                showCols={showKoordinatCols}
                                actHandler={(item) => {
                                    // Navigate to detail without transactionId since this is all toponyms view
                                    router.push(`/penelaahan/detail-toponim?transactionId=${item.reviewTransaction?.transaction_id || ''}&toponymId=${item.idToponim}`)
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4 gap-5">
                    {reviewData.map((item) => (
                        <ReviewCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            reviewerCnt={item.reviewerCnt}
                            reviewedCnt={item.reviewedCnt}
                            elementTypeCnt={item.elementTypeCnt}
                            districtCnt={item.districtCnt}
                            acceptedCnt={item.acceptedCnt}
                            rejectedCnt={item.rejectedCnt}
                        />
                    ))}
                </div>
            ) : (
                <Card className="mt-4">
                    <CardContent className="p-6">
                        <SinarParameterizedTable
                            data={tableData}
                            columns={columns}
                            showCols={showCols}
                            actHandler={(item) => {
                                setSelectedTransactionId(item.id)
                                setShowKoordinatTable(true)
                            }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default ReviewDataTab