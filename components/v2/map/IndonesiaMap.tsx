import { useState, useRef, useEffect, useMemo } from "react";
import { Map, Marker, type MapRef, type ViewState } from '@vis.gl/react-maplibre'
import { Search, SlidersHorizontal, Plus, Minus, LocateFixed, Compass, Layers, X, MapPin } from "lucide-react";
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSpatialToponyms, usePublicToponyms, type SpatialToponym } from "@/hooks/useToponyms";
import ToponymSidebar from "./ToponymSidebar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { capitalizeFirstLetter } from "@/utils/formatters";
import FilterModal, { type FilterState } from "@/components/v2/modals/FilterModal";
import { useProvinces, useCities, useElements } from "@/hooks/useRegions";
import { useAuth } from "@/contexts/AuthContext";

const big_office_coord = {
    longitude: 106.8467944,
    latitude: -6.4908661,
}

const MapStyles = [
    {
        id: 'street-v4',
        label: 'Street',
        abbrv: 'Street',
        src: 'https://api.maptiler.com/maps/streets-v4/style.json?key=LKoyDpZYXFZFev1xFoUc',
        preview: 'https://cloud.maptiler.com/static/img/maps/streets-v4.png?t=1760544391'
    },
    {
        id: 'satellite',
        label: 'Satellite',
        abbrv: 'Sat-Img',
        src: 'https://api.maptiler.com/maps/satellite/style.json?key=LKoyDpZYXFZFev1xFoUc',
        preview: 'https://cloud.maptiler.com/static/img/maps/satellite.png?t=1755757107'
    },
    {
        id: 'openstreetmap',
        label: 'Open Street Map',
        abbrv: 'OSM',
        src: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=LKoyDpZYXFZFev1xFoUc',
        preview: 'https://cloud.maptiler.com/static/img/maps/openstreetmap.png?t=1755757107'
    },
    {
        id: 'aerial',
        label: 'Aerial',
        abbrv: 'Aerial',
        src: 'https://api.maptiler.com/maps/hybrid/style.json?key=LKoyDpZYXFZFev1xFoUc',
        preview: 'https://media.maptiler.com/img/xlarge_port_59a30dff58.webp'
    },
    {
        id: 'topo-v2',
        label: 'Topografi',
        abbrv: 'Topo',
        src: 'https://api.maptiler.com/maps/topo-v2/style.json?key=LKoyDpZYXFZFev1xFoUc',
        preview: 'https://cloud.maptiler.com/static/img/maps/topo-v2.png?t=1755757107'
    }
]

interface IndonesiaMapProps {
    onMarkerClick?: (marker: SpatialToponym) => void;
}

const IndonesiaMap = ({
    onMarkerClick
}: IndonesiaMapProps) => {
    const mapRef = useRef<MapRef>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const initialZoomDone = useRef(false);

    const initialViewState: ViewState = {
        longitude: big_office_coord.longitude,
        latitude: big_office_coord.latitude,
        zoom: 5,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0 }
    };

    const [viewState, setViewState] = useState(initialViewState);
    const [mapStyle, setMapStyle] = useState(MapStyles[0])
    const [isStylesOpen, setIsStylesOpen] = useState(false);
    const [selectedToponymId, setSelectedToponymId] = useState<string | null>(searchParams.get('id') || null);

    // Search state
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Filter Modal States
    const { token } = useAuth();
    const resolvedToken = token || "public";
    
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>({});
    const [activeProvinceForFilter, setActiveProvinceForFilter] = useState<string>("");

    const { data: elementsData } = useElements(resolvedToken);
    const { data: provincesData } = useProvinces();

    const provinces = useMemo(() =>
        (provincesData?.data ?? []).map((p: any) => ({
            label: p.name,
            value: p.code,
            path: p.path,
        })),
        [provincesData]
    );

    const selectedProvinceId = activeProvinceForFilter || filterState.province_id || null;
    const selectedProvincePath = useMemo(() => {
        if (!selectedProvinceId) return null;
        return provinces.find((p) => p.value === selectedProvinceId)?.path ?? null;
    }, [selectedProvinceId, provinces]);

    const { data: citiesData } = useCities(selectedProvincePath, resolvedToken);

    const cities = useMemo(() =>
        (citiesData?.data ?? []).map((c: any) => ({
            label: c.name,
            value: c.code,
        })),
        [citiesData]
    );

    const filterFields = useMemo(() => [
        {
            id: "element_id",
            label: "Jenis Unsur",
            options: elementsData?.data?.map((e: any) => ({ 
                label: e.name, 
                value: e.code 
            })) || [],
            searchable: true,
            placeholder: "Jenis Unsur",
        },
        {
            id: "province_id",
            label: "Provinsi",
            options: provinces,
            searchable: true,
            placeholder: "Provinsi",
        },
        {
            id: "regency_id",
            label: "Kabupaten/Kota",
            options: cities,
            searchable: true,
            placeholder: !selectedProvinceId ? "Kabupaten/Kota" : "Kabupaten/ Kota",
        }
    ], [elementsData, provinces, cities, selectedProvinceId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    const { data: searchData, isLoading: isSearchLoading } = usePublicToponyms({
        page: "1",
        limit: "5",
        ...(debouncedSearch ? { search: debouncedSearch } : {})
    });

    // Click outside for search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        if (showSearchResults) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSearchResults]);

    // State for bounding box to trigger TanStack Query
    const [bounds, setBounds] = useState({
        min_lat: "",
        max_lat: "",
        min_lng: "",
        max_lng: ""
    });

    const { data, isLoading, error } = useSpatialToponyms({
        ...bounds,
        limit: "20",
        ...(filterState.province_id ? { province_id: filterState.province_id } : {}),
        ...(filterState.regency_id ? { regency_id: filterState.regency_id } : {}),
        ...(filterState.element_id ? { element_id: filterState.element_id } : {})
    });

    const markers = useMemo<SpatialToponym[]>(() => data?.data?.results || [], [data]);

    const handleZoomIn = () => {
        mapRef.current?.getMap().zoomIn();
    }

    const handleZoomOut = () => {
        mapRef.current?.getMap().zoomOut();
    }

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { longitude, latitude } = position.coords;
                mapRef.current?.getMap().flyTo({
                    center: [longitude, latitude],
                    zoom: 14,
                    essential: true
                });
            });
        }
    }

    const handleResetNorth = () => {
        mapRef.current?.getMap().easeTo({
            bearing: 0,
            pitch: 0,
            essential: true
        });
    }

    const updateBounds = useMemo(() => {
        let timer: NodeJS.Timeout;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const map = mapRef.current?.getMap();
                if (!map) return;

                const mapBounds = map.getBounds();
                setBounds({
                    min_lat: mapBounds.getSouth().toString(),
                    max_lat: mapBounds.getNorth().toString(),
                    min_lng: mapBounds.getWest().toString(),
                    max_lng: mapBounds.getEast().toString()
                });
            }, 500); // 500ms debounce
        };
    }, []);

    const handleMarkerClick = (longitude: number, latitude: number, marker: SpatialToponym) => {
        const currentZoom = mapRef.current?.getMap().getZoom() || 4.55;
        const targetZoom = Math.max(currentZoom, 15);

        mapRef.current?.getMap().easeTo({
            center: [longitude, latitude],
            zoom: targetZoom,
            essential: true,
            duration: 1000
        });
        setSelectedToponymId(marker.id);

        // Sync to URL
        const params = new URLSearchParams(searchParams.toString());
        params.set('id', marker.id);
        router.push(`${pathname}?${params.toString()}`);

        if (onMarkerClick) onMarkerClick(marker);
    }

    const handleCloseSidebar = () => {
        setSelectedToponymId(null);

        // Remove from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');
        router.push(`${pathname}?${params.toString()}`);
    }

    // Zoom to marker on initial load if ID is in URL
    useEffect(() => {
        if (initialZoomDone.current) return;

        const id = searchParams.get('id');
        if (id && markers.length > 0) {
            const marker = markers.find((m: SpatialToponym) => m.id === id);
            if (marker) {
                const currentZoom = mapRef.current?.getMap().getZoom() || 4.55;
                const targetZoom = Math.max(currentZoom, 15);

                mapRef.current?.getMap().easeTo({
                    center: [marker.lng, marker.lat],
                    zoom: targetZoom,
                    essential: true,
                    duration: 500
                });
                initialZoomDone.current = true;
            }
        } else if (markers.length > 0) {
            // If markers have loaded but there's no ID, or we couldn't find the marker, mark initial load as done
            initialZoomDone.current = true;
        }
    }, [searchParams, markers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsStylesOpen(false);
            }
        };

        if (isStylesOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isStylesOpen]);

    return (
        <div className="w-full h-full overflow-hidden relative">
            <div className="flex gap-2 absolute z-20 top-5 left-5 right-5 md:left-auto">
                {/* search */}
                <div ref={searchContainerRef} className="relative flex-1 md:flex-initial">
                    <div className="flex gap-2 items-center w-full md:w-96 p-3 bg-white rounded-lg shadow-sm">
                        <Search size={16} className="text-gray-500 shrink-0" />
                        <input
                            type="text"
                            className="w-full text-sm outline-none"
                            placeholder="Cari Nama Rupabumi"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setShowSearchResults(true);
                            }}
                            onFocus={() => setShowSearchResults(true)}
                        />
                        {searchText && (
                            <button className="text-gray-500 hover:text-gray-700 cursor-pointer transition-all" onClick={() => setSearchText("")}>
                                <X size={16}/>
                            </button>
                        )}
                    </div>
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchText && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden max-h-80 overflow-y-auto">
                            {isSearchLoading ? (
                                <div className="p-4 text-center text-sm text-gray-500">Mencari...</div>
                            ) : searchData?.data && searchData.data.length > 0 ? (
                                <div className="p-3">
                                    <h3 className="text-sm font-bold">Hasil Pencarian</h3>
                                    <ul className="flex flex-col mt-2">
                                        {searchData.data.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    className="w-full rounded-lg text-left p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        // Move map to location
                                                        if (item.location_point) {
                                                            mapRef.current?.getMap().flyTo({
                                                                center: [item.location_point.coordinates[0], item.location_point.coordinates[1]],
                                                                zoom: 15,
                                                                duration: 1000
                                                            });
                                                        }
                                                        setSearchText(item.local_name || item.map_name);
                                                        setShowSearchResults(false);
                                                        setSelectedToponymId(item.id);
                                                        router.push(`/v2?id=${item.id}`);
                                                    }}
                                                >
                                                    <div className="font-medium text-sm text-gray-800">{item.local_name || item.map_name}</div>
                                                    <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                                        <span className="">{capitalizeFirstLetter(item.regency?.name)}, {capitalizeFirstLetter(item.province?.name)}</span>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">Tidak ada hasil yang ditemukan</div>
                            )}
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`flex items-center gap-2 text-sm rounded-lg p-2 px-3 font-medium shadow-sm transition drop-shadow-sm cursor-pointer whitespace-nowrap ${Object.values(filterState).some(val => val) ? 'bg-navy-50 border border-navy-300 text-navy-500 hover:bg-navy-100' : 'bg-white hover:bg-gray-100'}`}
                >
                    <SlidersHorizontal size={18} />
                    <span className="hidden sm:inline">Filter</span>
                </button>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-10 right-5 flex flex-col gap-3 z-20">
                {/* Reset North / Compass */}
                <button
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                    onClick={handleResetNorth}
                    title="Reset ke Utara"
                >
                    <div
                        className="transition-transform duration-300"
                        style={{ transform: `rotate(${-viewState.bearing}deg)` }}
                    >
                        <Compass size={20} className="text-gray-700" />
                    </div>
                </button>

                {/* Locate Me */}
                <button
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                    onClick={handleLocateMe}
                    title="Lokasi Saya"
                >
                    <LocateFixed size={20} className="text-gray-700" />
                </button>

                {/* Zoom Controls */}
                <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        onClick={handleZoomIn}
                        className="p-2.5 hover:bg-gray-50 transition border-b border-gray-100 cursor-pointer"
                        title="Zoom In"
                    >
                        <Plus size={20} className="text-gray-700" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2.5 hover:bg-gray-50 transition cursor-pointer"
                        title="Zoom Out"
                    >
                        <Minus size={20} className="text-gray-700" />
                    </button>
                </div>

                {/* View Options */}
                <div className="relative">
                    <button
                        className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-sm border transition cursor-pointer ${isStylesOpen ? 'bg-navy-50 border-navy-500 text-navy-500' : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                            }`}
                        onClick={() => setIsStylesOpen(!isStylesOpen)}
                        title="Opsi Tampilan"
                    >
                        <Layers size={20} />
                    </button>

                    {isStylesOpen && (
                        <div
                            ref={popupRef}
                            className="absolute bottom-0 right-14 w-64 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-2xl p-3 z-30 animate-in fade-in slide-in-from-right-2 duration-200"
                        >
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Gaya Peta
                                </h3>
                                <button
                                    onClick={() => setIsStylesOpen(false)}
                                    className="rounded-full transition text-gray-500 hover:text-gray-600 cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {MapStyles.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setMapStyle(item);
                                            setIsStylesOpen(false);
                                        }}
                                        className={`group w-full flex items-center gap-3 p-2 rounded-lg transition border-2 ${mapStyle.id === item.id
                                            ? 'bg-navy-50 border-navy-200 text-navy-700'
                                            : 'bg-transparent border-transparent hover:bg-gray-100 text-gray-600 hover:border-gray-100'
                                            }`}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-md shadow-inner border border-gray-200 shrink-0 overflow-hidden"
                                            style={{
                                                backgroundImage: `url(${item.preview})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <div className="w-full h-full bg-black/5" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-semibold">{item.label}</span>
                                            {/* <span className="text-[10px] text-gray-400">{item.abbrv}</span> */}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle.src}
                onMove={e => {
                    setViewState(e.viewState)
                }}
                onMoveEnd={updateBounds}
                onLoad={updateBounds}
                maxBounds={[
                    [91, -12],
                    [142, 12]
                ]}
                onClick={(e) => {
                    if (selectedToponymId) {
                        handleCloseSidebar();
                    }
                }}
            >
                {markers.map((marker: SpatialToponym) => (
                    <Marker
                        key={marker.id}
                        longitude={marker.lng}
                        latitude={marker.lat}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            handleMarkerClick(
                                marker.lng,
                                marker.lat,
                                marker
                            );
                        }}
                    >
                        <div className="group relative cursor-pointer">
                            {/* Label on Hover or Active */}
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-md text-xs font-bold whitespace-nowrap transition-opacity pointer-events-none z-50 ${selectedToponymId === marker.id
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100 border-gray-100'
                                }`}>
                                {marker.local_name || marker.map_name}
                            </div>

                            {/* Marker Icon */}
                            <div className={`transition drop-shadow-sm ${mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? 'text-white drop-shadow-sm' : 'text-navy-500'
                                } ${selectedToponymId === marker.id
                                    ? 'scale-125'
                                    : 'hover:scale-125'
                                }`}>
                                <MapPin size={24} />
                            </div>
                        </div>
                    </Marker>
                ))}

                {isLoading && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm z-30">
                        <span className="text-xs font-bold text-navy-500 animate-pulse text-center">Memuat Data Rupabumi...</span>
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm z-30">
                        <span className="text-xs font-semibold text-red-500 text-center flex justify-center">Gagal memuat data. Silahkan muat ulang halaman.</span>
                    </div>
                )}
            </Map>

            {/* Toponym Detail Sidebar */}
            <ToponymSidebar
                toponymId={selectedToponymId}
                onClose={handleCloseSidebar}
            />

            {/* Filter Modal */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => {
                    setIsFilterModalOpen(false);
                    setActiveProvinceForFilter("");
                }}
                fields={filterFields}
                initialFilters={filterState}
                onFieldChange={(id, value) => {
                    if (id === 'province_id') {
                        setActiveProvinceForFilter(value);
                    }
                }}
                onApply={(filters) => {
                    setFilterState(filters);
                    setIsFilterModalOpen(false);
                }}
            />
        </div>
    );
}

export default IndonesiaMap;