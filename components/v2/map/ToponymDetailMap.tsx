import { useState, useRef, useEffect, Fragment } from "react";
import { Map, Marker, Source, Layer, type MapRef, type ViewState, type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Compass, LocateFixed, Plus, Minus, Layers, X } from "lucide-react";

const center_indonesia_coord = {
    longitude: 118.0149,
    latitude: -2.5489,
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

type ToponymDetailMapProps = {
    isDrawingMode: boolean;
    drawType: string;
    drawnPoint: {lat: number, lng: number} | null;
    setDrawnPoint: (point: {lat: number, lng: number} | null) => void;
    drawnLine?: {lat: number, lng: number}[];
    setDrawnLine?: React.Dispatch<React.SetStateAction<{lat: number, lng: number}[]>>;
    drawnPolygon?: {lat: number, lng: number}[][];
    setDrawnPolygon?: React.Dispatch<React.SetStateAction<{lat: number, lng: number}[][]>>;
    onSave?: () => void;
}

const ToponymDetailMap = ({ isDrawingMode, drawType, drawnPoint, setDrawnPoint, drawnLine, setDrawnLine, drawnPolygon, setDrawnPolygon, onSave }: ToponymDetailMapProps) => {
    const mapRef = useRef<MapRef>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const initialViewState: ViewState = {
        longitude: center_indonesia_coord.longitude,
        latitude: center_indonesia_coord.latitude,
        zoom: 3.5,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0, top: 0, left: 0, right: 0 }
    };

    const [viewState, setViewState] = useState(initialViewState);
    const [mapStyle, setMapStyle] = useState(MapStyles[0]);
    const [isStylesOpen, setIsStylesOpen] = useState(false);

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

    const clickTimer = useRef<NodeJS.Timeout | null>(null);

    const handleMapClick = (e: MapLayerMouseEvent) => {
        if (!isDrawingMode) return;
        
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }

        clickTimer.current = setTimeout(() => {
            if (drawType === "Point") {
                setDrawnPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
            } else if (drawType === "Line" && setDrawnLine) {
                setDrawnLine(prev => [...prev, { lat: e.lngLat.lat, lng: e.lngLat.lng }]);
            } else if (drawType === "Polygon" && setDrawnPolygon) {
                setDrawnPolygon(prev => {
                    if (prev.length === 0) return [[{ lat: e.lngLat.lat, lng: e.lngLat.lng }]];
                    const next = [...prev];
                    const lastIdx = next.length - 1;
                    next[lastIdx] = [...next[lastIdx], { lat: e.lngLat.lat, lng: e.lngLat.lng }];
                    return next;
                });
            }
        }, 250);
    };

    const handleMapDblClick = (e: MapLayerMouseEvent) => {
        if (!isDrawingMode) return;
        
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }

        if (onSave) onSave();
    };

    return (
        <div className="w-full h-full overflow-hidden relative">
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
                                    className="rounded-full transition text-gray-500 hover:text-gray-600"
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
                onMove={e => setViewState(e.viewState)}
                maxBounds={[
                    [91, -12],
                    [142, 12]
                ]}
                onClick={handleMapClick}
                onDblClick={handleMapDblClick}
                doubleClickZoom={!isDrawingMode}
                cursor={isDrawingMode ? 'crosshair' : 'grab'}
            >
                {drawnPoint && drawType === 'Point' && (
                    <Marker 
                        longitude={drawnPoint.lng} 
                        latitude={drawnPoint.lat} 
                        anchor="bottom"
                        draggable={isDrawingMode}
                        onDrag={e => {
                            if (isDrawingMode) {
                                setDrawnPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
                            }
                        }}
                        onDragEnd={e => {
                            if (isDrawingMode) {
                                setDrawnPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
                            }
                        }}
                    >
                        <MapPin size={32} className={`drop-shadow-md transition-transform ${isDrawingMode ? 'cursor-grab active:cursor-grabbing hover:scale-110' : ''} ${mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? 'text-white' : 'text-navy-500'}`} />
                    </Marker>
                )}

                {/* Line String Drawing */}
                {drawType === 'Line' && drawnLine && drawnLine.length > 0 && (
                    <Source
                        id="drawn-line-source"
                        type="geojson"
                        data={{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: drawnLine.map(pt => [pt.lng, pt.lat])
                            }
                        }}
                    >
                        <Layer
                            id="drawn-line-layer"
                            type="line"
                            paint={{
                                'line-color': mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? '#ffffff' : '#053378',
                                'line-width': 4
                            }}
                        />
                    </Source>
                )}
                {drawType === 'Line' && drawnLine && viewState.zoom > 12 && drawnLine.map((pt, i) => (
                    <Marker 
                        key={i} 
                        longitude={pt.lng} 
                        latitude={pt.lat} 
                        anchor="center"
                        draggable={isDrawingMode}
                        onDrag={e => {
                            if (isDrawingMode && setDrawnLine) {
                                setDrawnLine(prev => {
                                    const next = [...prev];
                                    next[i] = { lat: e.lngLat.lat, lng: e.lngLat.lng };
                                    return next;
                                });
                            }
                        }}
                        onDragEnd={e => {
                            if (isDrawingMode && setDrawnLine) {
                                setDrawnLine(prev => {
                                    const next = [...prev];
                                    next[i] = { lat: e.lngLat.lat, lng: e.lngLat.lng };
                                    return next;
                                });
                            }
                        }}
                    >
                        <div className={`w-4 h-4 flex items-center justify-center rounded-full drop-shadow-md border-2 text-[10px] font-bold ${isDrawingMode ? 'cursor-grab active:cursor-grabbing hover:scale-125' : 'cursor-pointer'} transition-transform ${mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? 'bg-navy-500 border-white text-white' : 'bg-white border-navy-500 text-navy-600'}`}>
                            {i + 1}
                        </div>
                    </Marker>
                ))}

                {/* Polygon Drawing */}
                {drawType === 'Polygon' && drawnPolygon && drawnPolygon.length > 0 && (
                    <>
                        {drawnPolygon.map((poly, pIdx) => {
                            if (poly.length === 0) return null;
                            const isComplete = poly.length >= 3;
                            return (
                                <Fragment key={pIdx}>
                                    {isComplete && (
                                        <Source
                                            id={`drawn-polygon-source-${pIdx}`}
                                            type="geojson"
                                            data={{
                                                type: 'Feature',
                                                properties: {},
                                                geometry: {
                                                    type: 'Polygon',
                                                    coordinates: [[...poly.map(pt => [pt.lng, pt.lat] as [number, number]), [poly[0].lng, poly[0].lat] as [number, number]]]
                                                }
                                            }}
                                        >
                                            <Layer
                                                id={`drawn-polygon-fill-layer-${pIdx}`}
                                                type="fill"
                                                paint={{
                                                    'fill-color': mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? '#ffffff' : '#053378',
                                                    'fill-opacity': 0.2
                                                }}
                                            />
                                            <Layer
                                                id={`drawn-polygon-stroke-layer-${pIdx}`}
                                                type="line"
                                                paint={{
                                                    'line-color': mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? '#ffffff' : '#053378',
                                                    'line-width': 2
                                                }}
                                            />
                                        </Source>
                                    )}
                                    
                                    {!isComplete && poly.length > 1 && (
                                        <Source
                                            id={`drawn-polygon-line-source-${pIdx}`}
                                            type="geojson"
                                            data={{
                                                type: 'Feature',
                                                properties: {},
                                                geometry: {
                                                    type: 'LineString',
                                                    coordinates: poly.map(pt => [pt.lng, pt.lat])
                                                }
                                            }}
                                        >
                                            <Layer
                                                id={`drawn-polygon-line-fallback-layer-${pIdx}`}
                                                type="line"
                                                paint={{
                                                    'line-color': mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? '#ffffff' : '#053378',
                                                    'line-width': 2,
                                                    'line-dasharray': [2, 2]
                                                }}
                                            />
                                        </Source>
                                    )}

                                    {viewState.zoom > 12 && poly.map((pt, i) => (
                                        <Marker 
                                            key={`pt-${pIdx}-${i}`} 
                                            longitude={pt.lng} 
                                            latitude={pt.lat} 
                                            anchor="center"
                                            draggable={isDrawingMode}
                                            onDrag={e => {
                                                if (isDrawingMode && setDrawnPolygon) {
                                                    setDrawnPolygon(prev => {
                                                        const next = [...prev];
                                                        const nextPoly = [...next[pIdx]];
                                                        nextPoly[i] = { lat: e.lngLat.lat, lng: e.lngLat.lng };
                                                        next[pIdx] = nextPoly;
                                                        return next;
                                                    });
                                                }
                                            }}
                                            onDragEnd={e => {
                                                if (isDrawingMode && setDrawnPolygon) {
                                                    setDrawnPolygon(prev => {
                                                        const next = [...prev];
                                                        const nextPoly = [...next[pIdx]];
                                                        nextPoly[i] = { lat: e.lngLat.lat, lng: e.lngLat.lng };
                                                        next[pIdx] = nextPoly;
                                                        return next;
                                                    });
                                                }
                                            }}
                                        >
                                            <div className={`w-4 h-4 flex items-center justify-center rounded-full drop-shadow-md border-2 text-[10px] font-bold ${isDrawingMode ? 'cursor-grab active:cursor-grabbing hover:scale-125' : 'cursor-pointer'} transition-transform ${mapStyle.id === 'satellite' || mapStyle.id === 'aerial' ? 'bg-navy-500 border-white text-white' : 'bg-white border-navy-500 text-navy-600'}`}>
                                                {i + 1}
                                            </div>
                                        </Marker>
                                    ))}
                                </Fragment>
                            );
                        })}
                    </>
                )}
            </Map>
        </div>
    )
}

export default ToponymDetailMap;
