import { MultiSelect, Option } from "@/components/MultiSelect";
import SinarParameterizedTable, { ColumnConfig } from "@/components/SinarParameterizedTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, CircleUserRound, FileText, LayoutGrid, List, MapPin, Plus, Search, SlidersVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/config";

import { Chart as ChartJS, ChartData, ArcElement, Tooltip, Legend, Plugin } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Progress } from "@/components/ui/progress";
import dayjs from "dayjs";

ChartJS.register(ArcElement, Tooltip, Legend);

// API Response Type
interface VerificationTransaction {
    id: string;
    title: string;
    due_at: string;
    status: string;
    total_data: number;
    handled_data: number;
    accepted_data: number;
    rejected_data: number;
    accepted_rate: number;
    rejected_rate: number;
    element_count: number;
    district_count: number;
    verificator_count: number;
}

// Toponym API Response Type
interface ToponymData {
    id: string;
    element_id: string;
    map_name: string;
    local_name: string;
    other_name: string;
    name_meaning: string | null;
    language_origin: string;
    created_at: string;
    review_transaction_data: {
        transaction_id: string;
        toponym_id: string;
        accepted: boolean | null;
        user: string | null;
        handledts: string | null;
        notes: string | null;
    }[];
    location_point: {
        type: string;
        coordinates: [number, number];
    };
    utm_zone: string;
    element: {
        code: string;
        name: string;
        subcategory_id: string;
        type: string | null;
    };
}

const CenterTextPlugin: Plugin = {
    id: "centerText",
    afterDraw(chart) {
        const {
            ctx,
            chartArea: { width, height },
        } = chart;
        const dataset = chart.data.datasets[0];
        const value = dataset.data[0] as number;

        ctx.save();
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${Math.round(value)}%`, width / 2, height / 2);
        ctx.restore();
    },
};

const DoughnutPerformance: React.FC<{ data: number[]; type: "accepted" | "rejected" }> = ({ data, type }) => {
    const chartData: ChartData<"doughnut"> = {
        labels: [type, ""],
        datasets: [
            {
                label: "Dataset 1",
                data: data,
                backgroundColor: type === "accepted" ? ["rgba(21, 72, 30, 1)", "rgba(21, 72, 30, 0.2)"] : ["rgba(179, 0, 3, 1)", "rgba(179, 0, 3, 0.2)"],
            },
        ],
    };

    return (
        <Doughnut
            data={chartData}
            plugins={[CenterTextPlugin]}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "85%",
                plugins: {
                    legend: { display: false },
                },
            }}
        />
    );
};

interface IReviewCard {
    id: string;
    title: string;
    reviewerCnt?: number;
    elementTypeCnt?: number;
    reviewedCnt?: number;
    districtCnt?: number;
    acceptedCnt?: number;
    rejectedCnt?: number;
    acceptedRate?: number;
    rejectedRate?: number;
    reviewEndTs?: Date;
    totalData?: number;
    handledData?: number;
    status?: string;
    onRefresh?: () => void;
    onClick?: () => void;
}

const ReviewCard: React.FC<IReviewCard> = ({
    id,
    title,
    reviewedCnt = 0,
    elementTypeCnt = 0,
    reviewerCnt = 0,
    districtCnt = 0,
    acceptedCnt = 0,
    rejectedCnt = 0,
    acceptedRate = 0,
    rejectedRate = 0,
    reviewEndTs,
    totalData = 0,
    handledData = 0,
    status,
    onRefresh,
    onClick,
}) => {
    const router = useRouter();
    const isVerificationDone = totalData > 0 && totalData === handledData;
    const isCompleted = status === "completed";
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinishTransaction = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/verifications/transaction/${id}/finish`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const result = await response.json();
            if (!result.error) {
                setShowConfirmModal(false);
                if (onRefresh) onRefresh();
                // router.push(`/penelaahan/cetak-berita-acara?transactionId=${id}`)
            } else {
                alert(result.message || "Gagal menyelesaikan penelaahan");
            }
        } catch (err) {
            console.error("Error finishing transaction:", err);
            alert("Terjadi kesalahan koneksi");
        }
    };

    return (
        <Card className="p-4 rounded-none border border-black shadow-none sm:w-full cursor-pointer hover:bg-gray-50 transition-colors" onClick={onClick}>
            {/* <CardHeader className="flex justify-end px-0">
          <CardTitle>ID Penelaahan #{id}</CardTitle>
          <div className="border border-blue-600 text-blue-600 flex items-center justify-center text-center p-1 text-sm">
            {status}
          </div>
        </CardHeader> */}
            <CardContent className="px-0">
                <div className="flex gap-2 mb-4">
                    <h3 className="text-xl mb-3 w-full">{title}</h3>
                    <div
                        className={cn(
                            "flex px-2 py-1 border w-fit h-fit",
                            status === "completed" ? "bg-green-50 border-green-600 text-green-600" : status === "issued" ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-gray-50 border-gray-200 text-gray-600",
                        )}
                    >
                        {status === "completed" ? "Selesai" : status === "issued" ? "Proses Penelaahan" : ""}
                    </div>
                </div>
                <div className="flex justify-between">
                    <div className="text-start">
                        <h5 className="mb-3">
                            <span className="text-xl">{reviewerCnt}</span> Verifikator
                        </h5>
                        <h5 className="mb-3">
                            <span className="text-xl">{totalData}</span> Data yang ditelaah
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
                        <DoughnutPerformance data={[acceptedRate, 100 - acceptedRate]} type="accepted" />
                        <h5>{acceptedCnt}</h5>
                        <p>Data Diterima</p>
                    </div>

                    <div className="text-center w-30 h-20">
                        <DoughnutPerformance data={[rejectedRate, 100 - rejectedRate]} type="rejected" />
                        <h5>{rejectedCnt}</h5>
                        <p>Data Ditolak</p>
                    </div>
                </div>
                <div className="text-center">
                    <Progress value={(handledData / totalData) * 100} className="[&>*]:bg-[#0088FF]" />
                    {/* <p>Penelaahan akan berakhir dalam 20 hari lagi</p> */}
                </div>

                {isVerificationDone && (
                    <div className="mt-4">
                        <Button
                            className={`w-full  text-white ${isCompleted ? "disabled bg-gray-300 hover:bg-gray-300" : "cursor-pointer bg-green-500 hover:bg-green-600"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isCompleted) setShowConfirmModal(true);
                            }}
                        >
                            {isCompleted ? (
                                "Selesai"
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Check size={18} /> Tandai Selesai
                                </div>
                            )}
                        </Button>
                    </div>
                )}

                {isCompleted && (
                    <div className="mt-4">
                        <Link href={`/penelaahan/cetak-berita-acara?transactionId=${id}`} onClick={(e) => e.stopPropagation()}>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                                <FileText />
                                Cetak Berita Acara
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Confirmation Modal */}
                <Dialog
                    open={showConfirmModal}
                    onOpenChange={(open) => {
                        setShowConfirmModal(open);
                    }}
                >
                    <DialogContent className="sm:max-w-[700px]" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">Konfirmasi Penyelesaian</DialogTitle>
                            <DialogDescription className="text-gray-600 mt-2 text-md">
                                Apakah Anda yakin ingin menandai penelaahan ini sebagai <strong>selesai</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-md">
                                    <strong>Perhatian:</strong> Setelah ditandai selesai, seluruh data toponim yang sudah ditelaah <strong>tidak dapat dilakukan perubahan lagi</strong>.
                                </p>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                <p>
                                    <strong>Judul:</strong> {title}
                                </p>
                                <p>
                                    <strong>Total Data:</strong> {totalData} toponim
                                </p>
                                <p>
                                    <strong>Diterima:</strong> {acceptedCnt} | <strong>Ditolak:</strong> {rejectedCnt}
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                                Batal
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleFinishTransaction}>
                                Ya, Tandai Selesai
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

const ReviewDataTab: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get view mode and transaction from URL params
    const viewFromUrl = searchParams.get("view") as "card" | "table" | "all-koordinat" | null;
    const transactionFromUrl = searchParams.get("transactionId");

    const validViews = ["card", "table", "all-koordinat"];
    const viewMode = viewFromUrl && validViews.includes(viewFromUrl) ? viewFromUrl : "card";
    const showKoordinatTable = !!transactionFromUrl;
    const selectedTransactionId = transactionFromUrl || null;

    // Helper to update URL params
    const updateUrlParams = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (value === null) {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });
            // Use replace instead of push for smoother experience
            router.replace(`/penelaahan?${newParams.toString()}`, { scroll: false });
        },
        [searchParams, router],
    );

    const handleViewModeChange = (mode: "card" | "table" | "all-koordinat") => {
        updateUrlParams({ view: mode, transactionId: null });
    };

    const handleSelectTransaction = (transactionId: string) => {
        updateUrlParams({ transactionId });
    };

    const handleBackToReview = () => {
        updateUrlParams({ transactionId: null });
        setToponymPage(1);
    };

    // API State
    const [reviewData, setReviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toponymData, setToponymData] = useState<any[]>([]);
    const [loadingToponyms, setLoadingToponyms] = useState(false);

    // All toponyms state
    const [allToponymsData, setAllToponymsData] = useState<any[]>([]);
    const [loadingAllToponyms, setLoadingAllToponyms] = useState(false);

    // Pagination state for individual transaction toponyms
    const [toponymPage, setToponymPage] = useState(1);
    const [toponymTotalPages, setToponymTotalPages] = useState(1);
    const [toponymLimit, setToponymLimit] = useState(10);

    // Pagination state for all toponyms
    const [allToponymsPage, setAllToponymsPage] = useState(1);
    const [allToponymsTotalPages, setAllToponymsTotalPages] = useState(1);
    const [allToponymsLimit, setAllToponymsLimit] = useState(10);

    // Fetch data from API
    const fetchReviewData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/verifications/transaction`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();

            if (!result.error && result.data) {
                // Transform API data to match component structure
                const transformedData = result.data.map((item: VerificationTransaction) => ({
                    id: item.id,
                    title: item.title,
                    startDate: null, // Not provided by API
                    endDate: item.due_at,
                    reviewerCnt: item.verificator_count,
                    elementTypeCnt: item.element_count,
                    districtCnt: item.district_count,
                    acceptedCnt: item.accepted_data,
                    rejectedCnt: item.rejected_data,
                    acceptedRate: Math.round(item.accepted_rate ?? 0),
                    rejectedRate: Math.round(item.rejected_rate ?? 0),
                    reviewedCnt: item.total_data,
                    status: item.status,
                    totalData: item.total_data,
                    handledData: item.handled_data,
                }));
                setReviewData(transformedData);
            }
        } catch (error) {
            console.error("Failed to fetch review data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviewData();
    }, [fetchReviewData]);

    // Fetch all toponyms data
    useEffect(() => {
        if (viewMode !== "all-koordinat") return;

        const fetchAllToponyms = async () => {
            setLoadingAllToponyms(true);
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_URL}/verifications/transaction/toponyms?page=${allToponymsPage}&per_page=${allToponymsLimit}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const result = await response.json();

                if (!result.error && result.data) {
                    // Transform API data to match table structure
                    const transformedData = result.data.map((item: ToponymData, index: number) => {
                        // Determine status from accepted field
                        const accepted = item.review_transaction_data?.[0]?.accepted;
                        let status = "Belum Ditelaah";
                        if (accepted === true) {
                            status = "Disetujui";
                        } else if (accepted === false) {
                            status = "Ditolak";
                        }

                        return {
                            no: (allToponymsPage - 1) * allToponymsLimit + index + 1,
                            tanggalDibuat: item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY") : "-",
                            idToponim: item.id,
                            jenisUnsur: item.element?.name || "-",
                            namaRupabumi: item.map_name,
                            namaLain: item.other_name || "-",
                            artiNama: item.name_meaning || "-",
                            asalBahasa: item.language_origin || "-",
                            reviewTransaction: item.review_transaction_data?.[0],
                            koordinat: item.location_point ? `${item.location_point.coordinates[0].toFixed(3)}, ${item.location_point.coordinates[1].toFixed(3)}` : "-",
                            status: status,
                        };
                    });
                    setAllToponymsData(transformedData);

                    // Set pagination info
                    if (result.pagination) {
                        setAllToponymsTotalPages(result.pagination.last_page);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch all toponyms:", error);
            } finally {
                setLoadingAllToponyms(false);
            }
        };

        fetchAllToponyms();
    }, [viewMode, allToponymsPage, allToponymsLimit]);

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
            issued: { bg: "bg-blue-100", text: "text-blue-800", label: "issued" },
            completed: { bg: "bg-green-100", text: "text-green-800", label: "completed" },
            Disetujui: { bg: "bg-green-100", text: "text-green-800", label: "Disetujui" },
            Ditolak: { bg: "bg-red-100", text: "text-red-800", label: "Ditolak" },
            "Belum Ditelaah": { bg: "bg-gray-100", text: "text-gray-800", label: "Belum Ditelaah" },
        };

        const style = statusStyles[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };

        return <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>{style.label}</span>;
    };

    // Fetch toponym data when transaction is selected
    useEffect(() => {
        if (!selectedTransactionId) return;

        const fetchToponymData = async () => {
            setLoadingToponyms(true);
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_URL}/verifications/transaction/${selectedTransactionId}/toponyms?page=${toponymPage}&per_page=${toponymLimit}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const result = await response.json();

                if (!result.error && result.data) {
                    // Transform API data to match table structure
                    const transformedData = result.data.map((item: ToponymData, index: number) => {
                        // Determine status from accepted field
                        const accepted = item.review_transaction_data?.[0]?.accepted;
                        let status = "Belum Ditelaah";
                        if (accepted === true) {
                            status = "Disetujui";
                        } else if (accepted === false) {
                            status = "Ditolak";
                        }

                        return {
                            no: (toponymPage - 1) * toponymLimit + index + 1,
                            tanggalDibuat: item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY") : "-",
                            idToponim: item.id,
                            jenisUnsur: item.element?.name || "-",
                            namaRupabumi: item.map_name,
                            namaLain: item.other_name || "-",
                            artiNama: item.name_meaning || "-",
                            asalBahasa: item.language_origin || "-",
                            koordinat: item.location_point ? `${item.location_point.coordinates[0].toFixed(3)}, ${item.location_point.coordinates[1].toFixed(3)}` : "-",
                            status: status,
                        };
                    });
                    setToponymData(transformedData);

                    // Set pagination info
                    if (result.pagination) {
                        setToponymTotalPages(result.pagination.last_page);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch toponym data:", error);
            } finally {
                setLoadingToponyms(false);
            }
        };

        fetchToponymData();
    }, [selectedTransactionId, toponymPage, toponymLimit]);

    const columns: ColumnConfig = {
        no: { label: "No." },
        dateRange: { label: "Rentang Penelaahan" },
        title: { label: "Judul Penelaahan" },
        reviewedCnt: { label: "Jumlah Data Ditelaah" },
        acceptedCnt: { label: "Jumlah Diterima" },
        rejectedCnt: { label: "Jumlah Ditolak" },
        status: { label: "Progres Penelaahan", render: (value: string) => getStatusBadge(value) },
    };

    // Columns for koordinat view
    const koordinatColumns: ColumnConfig = {
        no: { label: "No." },
        tanggalDibuat: { label: "Tanggal Diajukan" },
        jenisUnsur: { label: "Jenis Unsur" },
        namaRupabumi: { label: "Nama Rupabumi" },
        namaLain: { label: "Nama Lain" },
        artiNama: { label: "Arti Nama" },
        asalBahasa: { label: "Asal Bahasa" },
        koordinat: { label: "Koordinat" },
        status: { label: "Status", render: (value: string) => getStatusBadge(value) },
    };

    // Transform data for table view with dateRange field
    const tableData = reviewData.map((item, index) => ({
        ...item,
        no: index + 1,
        // dateRange: `${dayjs(item.startDate).format('DD/MM/YYYY')} s.d ${dayjs(item.endDate).format('DD/MM/YYYY')}`
        dateRange: `s.d ${dayjs(item.endDate).format("DD/MM/YYYY")}`,
    }));

    const options: Option[] = Object.keys(columns).map((c) => ({
        value: c,
        label: columns[c].label,
    }));

    const koordinatOptions: Option[] = Object.keys(koordinatColumns).map((c) => ({
        value: c,
        label: koordinatColumns[c].label,
    }));

    const [showCols, setShowCols] = useState<Option[]>(options);
    const [showKoordinatCols, setShowKoordinatCols] = useState<Option[]>(koordinatOptions);

    // Pagination helper function
    const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
        const pageNumbers: (number | string)[] = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        // Always show first page
        pageNumbers.push(1);

        // Show ellipsis or pages before current
        if (showEllipsisStart) {
            pageNumbers.push("...");
            if (currentPage - 1 > 1) pageNumbers.push(currentPage - 1);
        } else {
            for (let i = 2; i < currentPage; i++) {
                pageNumbers.push(i);
            }
        }

        // Show current page (if not first or last)
        if (currentPage !== 1 && currentPage !== totalPages) {
            pageNumbers.push(currentPage);
        }

        // Show ellipsis or pages after current
        if (showEllipsisEnd) {
            if (currentPage + 1 < totalPages) pageNumbers.push(currentPage + 1);
            pageNumbers.push("...");
        } else {
            for (let i = currentPage + 1; i < totalPages; i++) {
                pageNumbers.push(i);
            }
        }

        // Always show last page (if more than 1 page)
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }

        return (
            <div className="flex items-center justify-center gap-1 p-1">
                <Button size="icon-sm" disabled={currentPage === 1} variant="ghost" onClick={() => onPageChange(currentPage - 1)}>
                    <ChevronLeft />
                </Button>
                {pageNumbers.map((p, idx) => {
                    if (p === "...") {
                        return (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        );
                    }
                    return (
                        <Button key={p} variant="ghost" size="sm" onClick={() => onPageChange(p as number)} className={cn("text-sm transition-all", currentPage === p ? "font-bold text-black" : "font-normal text-muted-foreground")}>
                            {p}
                        </Button>
                    );
                })}
                <Button size="icon-sm" disabled={currentPage === totalPages} variant="ghost" onClick={() => onPageChange(currentPage + 1)}>
                    <ChevronRight />
                </Button>
            </div>
        );
    };

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
                            variant={viewMode === "card" ? "default" : "ghost"}
                            className={cn("rounded-md", viewMode === "card" ? "bg-white text-black shadow-sm hover:bg-gray-50" : "hover:bg-white")}
                            onClick={() => handleViewModeChange("card")}
                            title="Tampilan Kartu"
                        >
                            <LayoutGrid size={18} />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewMode === "table" ? "default" : "ghost"}
                            className={cn("rounded-md", viewMode === "table" ? "bg-white text-black shadow-sm hover:bg-gray-50" : "hover:bg-white")}
                            onClick={() => handleViewModeChange("table")}
                            title="Tampilan Tabel Penelaahan"
                        >
                            <List size={18} />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewMode === "all-koordinat" ? "default" : "ghost"}
                            className={cn("rounded-md", viewMode === "all-koordinat" ? "bg-white text-black shadow-sm hover:bg-gray-50" : "hover:bg-white")}
                            onClick={() => handleViewModeChange("all-koordinat")}
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
                        <Button size="icon-sm" variant="outline" onClick={handleBackToReview}>
                            <ChevronLeft />
                        </Button>
                        <CardTitle>
                            {reviewData.find((item) => item.id === selectedTransactionId)?.title || "Data Toponim"} - ID Transaksi: {selectedTransactionId}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadingToponyms ? (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-500">Memuat data toponim...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-end items-center mb-4 gap-2">
                                    <Select
                                        value={toponymLimit.toString()}
                                        onValueChange={(v) => {
                                            setToponymLimit(parseInt(v));
                                            setToponymPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="5">5 Baris</SelectItem>
                                                <SelectItem value="10">10 Baris</SelectItem>
                                                <SelectItem value="20">20 Baris</SelectItem>
                                                <SelectItem value="50">50 Baris</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {renderPagination(toponymPage, toponymTotalPages, setToponymPage)}
                                </div>
                                <SinarParameterizedTable
                                    data={toponymData}
                                    columns={koordinatColumns}
                                    showCols={showKoordinatCols}
                                    actHandler={(item) => {
                                        router.push(`/penelaahan/detail-toponim?transactionId=${selectedTransactionId}&toponymId=${item.idToponim}`);
                                    }}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : viewMode === "all-koordinat" ? (
                <Card className="mt-4 gap-1">
                    {/* <CardHeader>
                        <CardTitle>Semua Data Toponim</CardTitle>
                    </CardHeader> */}
                    <CardContent className="p-6">
                        {loadingAllToponyms ? (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-500">Memuat semua data toponim...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-end items-center mb-4 gap-2">
                                    <Select
                                        value={allToponymsLimit.toString()}
                                        onValueChange={(v) => {
                                            setAllToponymsLimit(parseInt(v));
                                            setAllToponymsPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="5">5 Baris</SelectItem>
                                                <SelectItem value="10">10 Baris</SelectItem>
                                                <SelectItem value="20">20 Baris</SelectItem>
                                                <SelectItem value="50">50 Baris</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {renderPagination(allToponymsPage, allToponymsTotalPages, setAllToponymsPage)}
                                </div>
                                <SinarParameterizedTable
                                    data={allToponymsData}
                                    columns={koordinatColumns}
                                    showCols={showKoordinatCols}
                                    actHandler={(item) => {
                                        router.push(`/penelaahan/detail-toponim?transactionId=${item.reviewTransaction?.transaction_id || ""}&toponymId=${item.idToponim}`);
                                    }}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : viewMode === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4 gap-5">
                    {reviewData.map((item) => (
                        <ReviewCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            reviewerCnt={item.reviewerCnt}
                            elementTypeCnt={item.elementTypeCnt}
                            districtCnt={item.districtCnt}
                            acceptedCnt={item.acceptedCnt}
                            rejectedCnt={item.rejectedCnt}
                            acceptedRate={item.acceptedRate}
                            rejectedRate={item.rejectedRate}
                            totalData={item.totalData}
                            handledData={item.handledData}
                            status={item.status}
                            onRefresh={fetchReviewData}
                            onClick={() => handleSelectTransaction(item.id)}
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
                                handleSelectTransaction(item.id);
                            }}
                            documentHandler={(item) => {
                                router.push(`/penelaahan/cetak-berita-acara?transactionId=${item.id}`);
                            }}
                            documentCondition={(item) => item.status === "completed"}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ReviewDataTab;
