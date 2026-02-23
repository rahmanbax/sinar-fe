import { useState, useRef, useEffect } from "react";
import { Map, type MapRef, type ViewState, Marker } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { IoLocationSharp } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { getToponymsByBoundingBox } from "@/api/toponym";

export const StatMap = () => {
    const mapRef = useRef<MapRef>(null);

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
    const [toponyms, setToponyms] = useState<any[]>([])

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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchToponyms();
        }, 500); // Debounce API calls

        return () => clearTimeout(timeoutId);
    }, [viewState]);

    return (
        <div className="w-full h-full overflow-hidden rounded-lg">
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle.src}
                onMove={e => {
                    setViewState(e.viewState)
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
                        >
                            <IoLocationSharp
                                className={`text-3xl drop-shadow-md transition-colors ${toponym.status === 'baku' ? 'text-blue-500' : 'text-yellow-500'
                                    }`}
                            />

                            <AnimatePresence>
                                {onHover === toponym.id && (
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
        </div>
    )
}
