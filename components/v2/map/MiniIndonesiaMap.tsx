import { useState } from "react";
import { Map, Marker, type ViewState } from '@vis.gl/react-maplibre';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

const center_indonesia_coord = {
    longitude: 118.0149,
    latitude: -2.5489,
}

const mapStyleUrl = 'https://api.maptiler.com/maps/streets-v4/style.json?key=LKoyDpZYXFZFev1xFoUc';

export interface MiniMapMarker {
    longitude: number;
    latitude: number;
    color?: string;
    label?: string;
}

interface MiniIndonesiaMapProps {
    markers?: MiniMapMarker[];
}

const MiniIndonesiaMap = ({ markers = [] }: MiniIndonesiaMapProps) => {
    const initialViewState: ViewState = {
        longitude: center_indonesia_coord.longitude,
        latitude: center_indonesia_coord.latitude,
        zoom: 3.5,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0, top: 0, left: 0, right: 0 }
    };

    const [viewState, setViewState] = useState(initialViewState);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="w-full h-full overflow-hidden relative">
            <Map
                {...viewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyleUrl}
                onMove={e => setViewState(e.viewState)}
                maxBounds={[
                    [91, -12],
                    [142, 12]
                ]}
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        longitude={marker.longitude}
                        latitude={marker.latitude}
                    >
                        <div
                            className="relative cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {hoveredIndex === index && marker.label && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-white text-gray-800 text-xs font-bold rounded shadow-lg whitespace-nowrap border border-gray-200 pointer-events-none z-50">
                                    {marker.label}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                                </div>
                            )}
                            <MapPin
                                size={24}
                                fill={marker.color || "#053378"}
                                color={marker.color || "#053378"}
                                strokeWidth={1.5}
                            />
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    )
}

export default MiniIndonesiaMap;
