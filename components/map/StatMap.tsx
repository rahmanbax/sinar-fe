import { useState, useRef, useEffect, useCallback } from "react";
import { Map, type MapRef, type ViewState, Marker } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { IoLocationSharp } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { getToponymsByBoundingBox } from "@/api/toponym";
import { X, MapPin, Pencil, Tag, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToponymData = any;

const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase() || "";
    const statusMap: Record<string, { bg: string; text: string; border: string; label: string }> = {
        "data survei": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Data Survei" },
        "baku": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Baku" },
        "pengajuan": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pengajuan" },
        "penetapan": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Penetapan" },
        "penelaahan kabupaten/kota": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Penelaahan Kab/Kota" },
        "penelaahan provinsi": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Penelaahan Provinsi" },
        "penelaahan pusat": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Penelaahan Pusat" },
    };
    return statusMap[s] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status || "Tidak Diketahui" };
};

export const StatMap = () => {
    const mapRef = useRef<MapRef>(null);
    const router = useRouter();

    const initialViewState: ViewState = {
        longitude: big_office_coord.longitude,
        latitude: big_office_coord.latitude,
        zoom: 4.55,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0 }
    };

    const [viewState, setViewState] = useState(initialViewState);
    const [mapStyle] = useState(MapStyles[0])
    const [onHover, setOnHover] = useState<string | undefined>()
    const [toponyms, setToponyms] = useState<ToponymData[]>([])
    const [selectedToponym, setSelectedToponym] = useState<ToponymData | null>(null)

    const fetchToponyms = async () => {
        const token = localStorage.getItem("token");
        if (!token || !mapRef.current) return;

        const bounds = mapRef.current.getMap().getBounds();
        const params = {
            min_lat: bounds.getSouth(),
            max_lat: bounds.getNorth(),
            min_lng: bounds.getWest(),
            max_lng: bounds.getEast(),
        };

        try {
            const res = await getToponymsByBoundingBox(token, params);
            if (!res.error && res.data) {
                setToponyms(res.data.results || []);
            }
        } catch (error) {
            console.error("Error fetching toponyms:", error);
        }
    };

    const handleMarkerClick = useCallback((toponym: ToponymData) => {
        setSelectedToponym(toponym);
        // Fly to the marker
        mapRef.current?.flyTo({
            center: [parseFloat(toponym.lng), parseFloat(toponym.lat)],
            zoom: Math.max(viewState.zoom, 10),
            duration: 800,
        });
    }, [viewState.zoom]);

    const handleClosePanel = useCallback(() => {
        setSelectedToponym(null);
    }, []);

    const handleEditData = useCallback(() => {
        if (selectedToponym) {
            router.push(`/survey/edit-toponim?id=${selectedToponym.id}`);
        }
    }, [selectedToponym, router]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchToponyms();
        }, 500); // Debounce API calls

        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewState]);

    const statusConfig = selectedToponym ? getStatusConfig(selectedToponym.status) : null;

    return (
        <div className="w-full h-full overflow-hidden rounded-lg relative">
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle.src}
                onMove={e => {
                    setViewState(e.viewState)
                }}
                onClick={() => {
                    // Close panel when clicking on the map (not on a marker)
                    // Marker clicks will stopPropagation
                }}
                maxBounds={[
                    [91, -12],
                    [142, 12]
                ]}
            >
                {toponyms.map((toponym) => (
                    <Marker
                        key={toponym.id}
                        longitude={toponym.lng}
                        latitude={toponym.lat}
                        anchor="bottom"
                    >
                        <motion.div
                            className="relative flex flex-col items-center cursor-pointer"
                            onMouseEnter={() => setOnHover(toponym.id)}
                            onMouseLeave={() => setOnHover(undefined)}
                            whileHover={{ scale: 1.2 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkerClick(toponym);
                            }}
                        >
                            <IoLocationSharp
                                className={`text-3xl drop-shadow-md transition-colors ${
                                    selectedToponym?.id === toponym.id
                                        ? 'text-red-500 scale-125'
                                        : toponym.status === 'baku'
                                            ? 'text-blue-500'
                                            : 'text-yellow-500'
                                }`}
                            />

                            <AnimatePresence>
                                {onHover === toponym.id && selectedToponym?.id !== toponym.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full mb-1 bg-white py-1 px-2 rounded-sm border whitespace-nowrap shadow text-[10px] font-bold z-10"
                                    >
                                        {toponym.local_name}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </Marker>
                ))}
            </Map>

            {/* Info Panel - slides in from bottom on mobile, from left on desktop */}
            <AnimatePresence>
                {selectedToponym && statusConfig && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 z-10 pointer-events-none"
                        />

                        {/* Info Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="absolute bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto sm:top-auto sm:w-[360px] z-20"
                        >
                            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                {/* Header with gradient */}
                                <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4">
                                    <button
                                        onClick={handleClosePanel}
                                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg shrink-0">
                                            <MapPin size={20} className="text-white" />
                                        </div>
                                        <div className="min-w-0 pr-6">
                                            <h3 className="text-white font-bold text-base leading-snug line-clamp-2">
                                                {selectedToponym.local_name || "Tanpa Nama"}
                                            </h3>
                                            <span className={`inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body info */}
                                <div className="px-5 py-4 space-y-3">
                                    {/* Category */}
                                    {selectedToponym.category_name && (
                                        <div className="flex items-start gap-3">
                                            <Tag size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Kategori</p>
                                                <p className="text-sm text-gray-800 font-medium">{selectedToponym.category_name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Subcategory / Element */}
                                    {(selectedToponym.subcategory_name || selectedToponym.element_name) && (
                                        <div className="flex items-start gap-3">
                                            <Globe size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Unsur</p>
                                                <p className="text-sm text-gray-800 font-medium">
                                                    {[selectedToponym.subcategory_name, selectedToponym.element_name].filter(Boolean).join(" · ")}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {(selectedToponym.province || selectedToponym.regency || selectedToponym.district || selectedToponym.village) && (
                                        <div className="flex items-start gap-3">
                                            <Building2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Lokasi</p>
                                                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                                    {[selectedToponym.village, selectedToponym.district, selectedToponym.regency, selectedToponym.province].filter(Boolean).join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Coordinates */}
                                    {(selectedToponym.lat && selectedToponym.lng) && (
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Koordinat</p>
                                                <p className="text-sm text-gray-800 font-mono">
                                                    {parseFloat(selectedToponym.lat).toFixed(6)}, {parseFloat(selectedToponym.lng).toFixed(6)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer with Edit button - hidden for penelaahan & baku statuses */}
                                {(() => {
                                    const s = (selectedToponym.status || "").toLowerCase();
                                    const isReadOnly = s === "baku" || s.startsWith("penelaahan");
                                    if (isReadOnly) return null;
                                    return (
                                        <div className="px-5 pb-5 pt-1">
                                            <Button
                                                onClick={handleEditData}
                                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <Pencil size={16} />
                                                Edit Data
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
