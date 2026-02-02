"use client";
import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { PiPencilSimpleLineDuotone } from "react-icons/pi";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    getVerificationToponymDetail,
    updateVerificationToponym,
    acceptVerificationToponym,
    rejectVerificationToponym
} from "@/api/verification";
import { getElements } from "@/api/classification";
import { getRegions } from "@/api/region";

import { Button } from "@/components/ui/button";
import { 
    Check, ChevronDown, ChevronLeft, ChevronsUpDown, X, Trash2, RotateCcw, Save, 
    CircleDot, ExternalLink, FileText, Mic, Video, FileImage, Maximize2,
    Layers, Minus, Plus, Loader2 
} from "lucide-react";
import { uploadImage, uploadAudio, uploadVideo, uploadDocs } from "@/api/media";
import ReviewerLayout from "@/layouts/ReviewerLayout";
import { Label } from "@/components/ui/label";
import { Map, type MapRef, type ViewState, Source, Layer } from "@vis.gl/react-maplibre";
import { big_office_coord, MapStyles } from "@/components/map/Map";
import "react-calendar-heatmap/dist/styles.css";
import Image from "next/image";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Marker } from "@vis.gl/react-maplibre";
import { IoLocationSharp } from "react-icons/io5";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FeatureCollection, Feature, Point, LineString, Polygon } from "geojson";
import type { MapLayerMouseEvent } from "maplibre-gl";

interface PreviewMapProps {
    isEditing: boolean;
    geometriType: "titik" | "garis" | "area";
    snappingEnabled: boolean;
    drawnPoints: [number, number][];
    onPointsChange: (points: [number, number][]) => void;
    savedGeometry: FeatureCollection | null;
    onClearSaved: () => void;
    onSave: () => void;
    onUndo: () => void;
    locationPointMarker: [number, number] | null;
    isEditMode: boolean;
}

interface Province {
    id: number;
    name: string;
    code: string;
    level: string;
    path: string;
}

interface Region {
    id: number;
    name: string;
    code: string;
    level: string;
    parent_id: number;
    path: string;
}

interface Element {
    id: number;
    code: string;
    name: string;
    subcategory_id: number;
}

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

const ddToDMS = (dd: number, isLat: boolean): string => {
    const absDd = Math.abs(dd);
    const deg = Math.floor(absDd);
    const min = Math.floor((absDd - deg) * 60);
    const sec = ((absDd - deg - min / 60) * 3600).toFixed(2);
    const direction = isLat ? (dd >= 0 ? "LU" : "LS") : dd >= 0 ? "BT" : "BB";
    return `${deg}° ${min}' ${sec}" ${direction}`;
};

const PreviewMap: React.FC<PreviewMapProps> = ({ isEditing, geometriType, snappingEnabled, drawnPoints, onPointsChange, savedGeometry, onClearSaved, onSave, onUndo, locationPointMarker, isEditMode }) => {
    const mapRef = useRef<MapRef>(null);
    const [showLayerMenu, setShowLayerMenu] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null);
    const initialViewState: ViewState = { longitude: big_office_coord.longitude, latitude: big_office_coord.latitude, zoom: 4.55, bearing: 0, pitch: 0, padding: { bottom: 0 } };
    const [viewState, setViewState] = useState(initialViewState);
    const [mapStyle, setMapStyle] = useState(MapStyles[0]);

    // Helper to validate and fix swapped Lng/Lat
    const getSafeCoords = (coords: [number, number]): [number, number] => {
        let [lng, lat] = coords;
        // If latitude is definitely a longitude (outside -90 to 90)
        // and longitude could be a latitude (inside -90 to 90), swap them
        if ((lat > 90 || lat < -90) && lng <= 90 && lng >= -90) {
            [lng, lat] = [lat, lng];
        }
        // Final safety clamp for MapLibre
        const safeLat = Math.max(-89.9, Math.min(89.9, lat));
        const safeLng = lng; // Longitude is more flexible but can be wrapped
        return [safeLng, safeLat];
    };

    // Auto zoom to saved geometry on load
    const hasZoomedRef = useRef(false);

    useEffect(() => {
        // Reset zoom flag when savedGeometry or locationPointMarker changes
        hasZoomedRef.current = false;
    }, [savedGeometry, locationPointMarker]);

    useEffect(() => {
        if (mapRef.current && !hasZoomedRef.current) {
            let rawCenter: [number, number] | null = null;

            // When not in edit mode, zoom to locationPointMarker
            if (!isEditMode && locationPointMarker) {
                rawCenter = locationPointMarker;
            }
            // When in edit mode, zoom to savedGeometry
            else if (isEditMode && savedGeometry?.features.length) {
                const feature = savedGeometry.features[0];

                if (feature.geometry.type === "Point") {
                    rawCenter = (feature.geometry as Point).coordinates as [number, number];
                } else if (feature.geometry.type === "LineString") {
                    const coords = (feature.geometry as LineString).coordinates as [number, number][];
                    rawCenter = coords[0];
                } else if (feature.geometry.type === "Polygon") {
                    const coords = (feature.geometry as Polygon).coordinates as [number, number][][];
                    rawCenter = coords[0][0];
                }
            }

            if (rawCenter) {
                const [lng, lat] = getSafeCoords(rawCenter);

                // Only zoom if coordinates are valid
                if (!isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat)) {
                    hasZoomedRef.current = true;

                    // Use setTimeout to ensure map is fully loaded
                    setTimeout(() => {
                        mapRef.current?.flyTo({
                            center: [lng, lat],
                            zoom: 15,
                            duration: 1500,
                        });
                    }, 100);
                }
            }
        }
    }, [savedGeometry, locationPointMarker, isEditMode]);

    const handleZoomIn = () => {
        if (mapRef.current) mapRef.current.flyTo({ zoom: Math.min(viewState.zoom + 1, 18), duration: 300 });
    };
    const handleZoomOut = () => {
        if (mapRef.current) mapRef.current.flyTo({ zoom: Math.max(viewState.zoom - 1, 1), duration: 300 });
    };

    const snapToNearestPoint = useCallback(
        (lng: number, lat: number): [number, number] => {
            if (!snappingEnabled || drawnPoints.length === 0) return [lng, lat];
            const threshold = 0.001;
            let nearestPoint: [number, number] = [lng, lat],
                minDistance = Infinity;
            for (const point of drawnPoints) {
                const distance = Math.sqrt(Math.pow(point[0] - lng, 2) + Math.pow(point[1] - lat, 2));
                if (distance < threshold && distance < minDistance) {
                    minDistance = distance;
                    nearestPoint = point;
                }
            }
            return nearestPoint;
        },
        [snappingEnabled, drawnPoints],
    );

    // Click delay to prevent double-click from adding extra point
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMapClick = useCallback(
        (e: MapLayerMouseEvent) => {
            if (!isEditing) return;

            // For line/polygon mode, delay the click to check if it's a double-click
            if (geometriType !== "titik") {
                if (clickTimeoutRef.current) {
                    clearTimeout(clickTimeoutRef.current);
                }

                clickTimeoutRef.current = setTimeout(() => {
                    const { lng, lat } = e.lngLat;
                    const snappedPoint = snapToNearestPoint(lng, lat);
                    onPointsChange([...drawnPoints, snappedPoint]);
                }, 200);
            } else {
                // Point mode - immediate response
                const { lng, lat } = e.lngLat;
                const snappedPoint = snapToNearestPoint(lng, lat);
                onPointsChange([snappedPoint]);
            }
        },
        [isEditing, geometriType, drawnPoints, onPointsChange, snapToNearestPoint, onClearSaved],
    );

    const handleMapDblClick = useCallback(
        (e: MapLayerMouseEvent) => {
            if (!isEditing || geometriType === "titik") return;
            e.preventDefault();

            // Cancel pending click
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }

            // Finish drawing with minimum point validation
            const minPoints = geometriType === "garis" ? 2 : 3;
            if (drawnPoints.length >= minPoints) onSave();
        },
        [isEditing, geometriType, drawnPoints, onSave],
    );

    const handleMouseMove = useCallback(
        (e: MapLayerMouseEvent) => {
            if (!isEditing) return;
            setCursorPosition([e.lngLat.lng, e.lngLat.lat]);
        },
        [isEditing],
    );

    // Build GeoJSON for current drawing
    const currentDrawingGeoJson: FeatureCollection = {
        type: "FeatureCollection",
        features: [],
    };

    // Add drawn points as features
    if (drawnPoints.length > 0) {
        // Points layer
        drawnPoints.forEach((point, idx) => {
            currentDrawingGeoJson.features.push({
                type: "Feature",
                properties: { id: idx },
                geometry: { type: "Point", coordinates: point },
            });
        });

        // Line/Polygon layer
        if (geometriType === "garis" && drawnPoints.length >= 2) {
            const lineCoords = cursorPosition ? [...drawnPoints, cursorPosition] : drawnPoints;
            currentDrawingGeoJson.features.push({
                type: "Feature",
                properties: { type: "line" },
                geometry: { type: "LineString", coordinates: lineCoords },
            });
        } else if (geometriType === "area" && drawnPoints.length >= 2) {
            const polygonCoords = cursorPosition ? [...drawnPoints, cursorPosition, drawnPoints[0]] : [...drawnPoints, drawnPoints[0]];
            currentDrawingGeoJson.features.push({
                type: "Feature",
                properties: { type: "polygon" },
                geometry: { type: "Polygon", coordinates: [polygonCoords] },
            });
        }
    }

    return (
        <div className="w-full h-full relative">
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: "100%", height: "100%" }}
                mapStyle={mapStyle.src}
                onMove={(e) => setViewState(e.viewState)}
                onClick={handleMapClick}
                onDblClick={handleMapDblClick}
                onMouseMove={handleMouseMove}
                cursor={isEditing ? "crosshair" : "grab"}
                maxBounds={[
                    [92, -12],
                    [142, 7],
                ]}
            >
                {/* Show location_point marker when NOT in edit mode */}
                {!isEditMode && locationPointMarker && (
                    <Marker
                        longitude={getSafeCoords(locationPointMarker)[0]}
                        latitude={getSafeCoords(locationPointMarker)[1]}
                        anchor="bottom"
                    >
                        <IoLocationSharp className="text-3xl text-blue-600 drop-shadow-lg" />
                    </Marker>
                )}
                {/* Show saved geometry (LineString/MultiPolygon) only when in edit mode */}
                {isEditMode && savedGeometry && (
                    <>
                        <Source id="saved-geometry" type="geojson" data={savedGeometry}>
                            <Layer id="saved-polygon-fill" type="fill" filter={["==", ["geometry-type"], "Polygon"]} paint={{ "fill-color": "#3b82f6", "fill-opacity": 0.3 }} />
                            <Layer id="saved-line" type="line" filter={["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "Polygon"]]} paint={{ "line-color": "#3b82f6", "line-width": 2 }} />
                        </Source>
                        {savedGeometry.features
                            .filter((f) => f.geometry.type === "Point")
                            .map((feature, idx) => {
                                const rawCoords = (feature.geometry as Point).coordinates as [number, number];
                                const [lng, lat] = getSafeCoords(rawCoords);
                                return (
                                    <Marker key={`saved-point-${idx}`} longitude={lng} latitude={lat} anchor="bottom">
                                        <IoLocationSharp className={cn("text-3xl text-blue-600 drop-shadow-lg", isEditing && "opacity-50")} />
                                    </Marker>
                                );
                            })}
                    </>
                )}
                {isEditing && currentDrawingGeoJson.features.length > 0 && (
                    <>
                        <Source id="current-drawing" type="geojson" data={currentDrawingGeoJson}>
                            <Layer id="drawing-polygon-fill" type="fill" filter={["==", ["geometry-type"], "Polygon"]} paint={{ "fill-color": "#10b981", "fill-opacity": 0.2 }} />
                            <Layer
                                id="drawing-line"
                                type="line"
                                filter={["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "Polygon"]]}
                                paint={{ "line-color": "#10b981", "line-width": 2, "line-dasharray": [2, 2] }}
                            />
                            {geometriType !== "titik" && (
                                <Layer id="drawing-points" type="circle" filter={["==", ["geometry-type"], "Point"]} paint={{ "circle-radius": 6, "circle-color": "#10b981", "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" }} />
                            )}
                        </Source>
                        {geometriType === "titik" &&
                            drawnPoints.map((point, idx) => (
                                <Marker key={`drawing-point-${idx}`} longitude={point[0]} latitude={point[1]} anchor="bottom">
                                    <IoLocationSharp className="text-3xl text-blue-600 drop-shadow-lg" />
                                </Marker>
                            ))}
                    </>
                )}
            </Map>
            {isEditing && (
                <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <CircleDot size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">
                        Mode: {geometriType === "titik" ? "Titik" : geometriType === "garis" ? "Garis" : "Area"}
                        {snappingEnabled && " (Snapping ON)"}
                    </span>
                </div>
            )}
            {isEditing && (
                <div className="absolute bottom-20 left-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-[200px]">
                    {geometriType === "titik" ? <p>Klik pada peta untuk menempatkan titik</p> : <p>Klik untuk menambah titik, double-click untuk selesai</p>}
                </div>
            )}
            <div className="absolute bottom-12 right-4 flex flex-col gap-2">
                <div className="relative">
                    <Button size="icon" variant="ghost" className="bg-white shadow-lg" onClick={() => setShowLayerMenu(!showLayerMenu)}>
                        <Layers size={18} />
                    </Button>
                    {showLayerMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[150px]">
                            {MapStyles.map((style) => (
                                <button
                                    key={style.label}
                                    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${mapStyle.label === style.label ? "bg-blue-100 text-blue-700" : ""}`}
                                    onClick={() => {
                                        setMapStyle(style);
                                        setShowLayerMenu(false);
                                    }}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button size="icon" variant="ghost" className="bg-white shadow-lg" onClick={handleZoomIn}>
                    <Plus size={18} />
                </Button>
                <Button size="icon" variant="ghost" className="bg-white shadow-lg" onClick={handleZoomOut}>
                    <Minus size={18} />
                </Button>
            </div>
        </div>
    );
};

// Toponym Detail API Response Type
interface ToponymDetail {
    id: string;
    element: {
        code: string;
        name: string;
    };
    generic_element: string;
    specific_element: string;
    local_name: string;
    map_name: string;
    other_name: string | null;
    language_origin: string;
    name_meaning: string | null;
    name_history: string | null;
    pronounciation: string | null;
    spelling: string | null;
    geometry_type: string;
    location_point: {
        type: string;
        coordinates: [number, number];
    } | null;
    location_line: {
        type: string;
        coordinates: [number, number][];
    } | null;
    location_area: {
        type: string;
        coordinates: any;
    } | null;
    elevation_value: string;
    country: string;
    province_id: string;
    regency_id: string;
    district_id: string;
    village_id: string | null;
    survey_at: string | null;
    source: string;
    notes: string | null;
    sketch: string | null;
    pronounciation_audio: string | null;
    video: string | null;
    support_document: string | null;
    photos: Array<{
        url: string;
        size: number;
        filename: string;
        uploaded_at: string;
        original_name: string;
    }>;
    utm_zone: string;
    status: string;
}

const DetailToponimContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const transactionId = searchParams.get("transactionId");
    const toponymId = searchParams.get("toponymId");
    const { token } = useAuth();

    const [fullTab, setFulltab] = useState(false);
    const navbarRef = useRef<HTMLDivElement>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [openCollapsible, setOpenCollapsible] = useState({ toponim: true, additional: true });

    // API State
    const [toponymData, setToponymData] = useState<ToponymDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState<Partial<ToponymDetail>>({});
    const [saving, setSaving] = useState(false);

    // Elements dropdown state
    const [elements, setElements] = useState<Element[]>([]);
    const [loadingElements, setLoadingElements] = useState(false);
    const [openElementCombobox, setOpenElementCombobox] = useState(false);

    // Regional data state
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [regencies, setRegencies] = useState<Region[]>([]);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [villages, setVillages] = useState<Region[]>([]);
    const [loadingVillages, setLoadingVillages] = useState(false);

    const [openProvincePopover, setOpenProvincePopover] = useState(false);
    const [openRegencyPopover, setOpenRegencyPopover] = useState(false);
    const [openDistrictPopover, setOpenDistrictPopover] = useState(false);
    const [openVillagePopover, setOpenVillagePopover] = useState(false);

    // Photo modal state
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    
    // Sketsa preview state
    const [previewSketch, setPreviewSketch] = useState<{ url: string; name: string } | null>(null);

    // Supporting Info Upload States
    const [sketsaLokasi, setSketsaLokasi] = useState<{ file: File; previewUrl: string } | null>(null);
    const [rekamanSuara, setRekamanSuara] = useState<{ file: File; previewUrl: string } | null>(null);
    const [rekamanAudioVisual, setRekamanAudioVisual] = useState<{ file: File; previewUrl: string } | null>(null);
    const [dokumenPendukung, setDokumenPendukung] = useState<{ file: File; previewUrl: string }[]>([]);
    const [selectedPhotoFiles, setSelectedPhotoFiles] = useState<{ file: File; previewUrl: string }[]>([]);

    const [openSpasial, setOpenSpasial] = useState(true);
    const [openAtribut, setOpenAtribut] = useState(true);

    // Geometri Editing State
    const [isEditingDraft, setIsEditingDraft] = useState(false);
    const [geometriType, setGeometriType] = useState<"titik" | "garis" | "area">("titik");
    const [fiturSnapping, setFiturSnapping] = useState(false);
    const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
    const [savedGeometry, setSavedGeometry] = useState<FeatureCollection | null>(null);
    const [historyStack, setHistoryStack] = useState<[number, number][][]>([]);

    // Store location_point separately for always displaying marker
    const [locationPointMarker, setLocationPointMarker] = useState<[number, number] | null>(null);
    const [savedGeometryBackup, setSavedGeometryBackup] = useState<FeatureCollection | null>(null);

    // Initial load geometry logic extracted to a reusable function
    const resetToInitialGeometry = useCallback(() => {
        if (!toponymData) return;

        // Always store location_point for marker display
        if (toponymData.location_point) {
            setLocationPointMarker(toponymData.location_point.coordinates);
        }

        let geometry: FeatureCollection | null = null;
        let geoType: "titik" | "garis" | "area" = "titik" as const;

        // Load geometry based on geometry_type for editing
        if (toponymData.geometry_type === "Point" && toponymData.location_point) {
            geometry = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Point",
                            coordinates: toponymData.location_point.coordinates,
                        },
                    },
                ],
            };
            geoType = "titik" as const;
        } else if (toponymData.geometry_type === "LineString" && toponymData.location_line) {
            geometry = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: toponymData.location_line.coordinates,
                        },
                    },
                ],
            };
            geoType = "garis" as const;
        } else if (toponymData.geometry_type === "MultiPolygon" && toponymData.location_area) {
            const multiPolygonCoords = toponymData.location_area.coordinates;
            const features: Feature[] = [];

            multiPolygonCoords.forEach((polygonCoords: any) => {
                features.push({
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Polygon",
                        coordinates: polygonCoords,
                    },
                });
            });

            geometry = {
                type: "FeatureCollection",
                features: features,
            };
            geoType = "area" as const;
        }

        setSavedGeometry(geometry);
        setGeometriType(geoType);
    }, [toponymData]);

    // Initial load geometry on data change
    useEffect(() => {
        resetToInitialGeometry();
    }, [resetToInitialGeometry]);

    const handlePointsChange = useCallback(
        (points: [number, number][]) => {
            setHistoryStack((prev) => [...prev, drawnPoints]);
            setDrawnPoints(points);
        },
        [drawnPoints],
    );

    const handleSaveGeometry = useCallback(() => {
        if (drawnPoints.length === 0) return;
        let newFeature: Feature | null = null;
        if (geometriType === "titik" && drawnPoints.length >= 1) {
            newFeature = { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: drawnPoints[0] } };
        } else if (geometriType === "garis" && drawnPoints.length >= 2) {
            newFeature = { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: drawnPoints } };
        } else if (geometriType === "area" && drawnPoints.length >= 3) {
            newFeature = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[...drawnPoints, drawnPoints[0]]] } };
        }

        if (newFeature) {
            setSavedGeometry((prev) => {
                const existingFeatures = prev?.features || [];

                // For titik and garis mode, replace existing features (only one allowed)
                if (geometriType === "titik" || geometriType === "garis") {
                    return {
                        type: "FeatureCollection",
                        features: [newFeature!],
                    };
                }

                // For area mode, filter existing polygons and append (supports MultiPolygon)
                const currentTypeFeatures = existingFeatures.filter((f) => {
                    return f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon";
                });

                return {
                    type: "FeatureCollection",
                    features: [...currentTypeFeatures, newFeature!],
                };
            });
            setDrawnPoints([]);
            setHistoryStack([]);
        }
    }, [drawnPoints, geometriType]);

    const handleUndoGeometry = useCallback(() => {
        if (historyStack.length > 0) {
            setDrawnPoints(historyStack[historyStack.length - 1]);
            setHistoryStack((prev) => prev.slice(0, -1));
        } else setDrawnPoints([]);
    }, [historyStack]);

    const handleClearGeometry = useCallback(() => {
        setDrawnPoints([]);
        setSavedGeometry(null);
        setHistoryStack([]);
    }, []);

    const handleClearSavedGeometry = useCallback(() => {
        setSavedGeometry(null);
    }, []);

    const getGeometry = (): { type: string; coordinates: any } | null => {
        // Filter features in savedGeometry that match current geometriType
        const matchingSaved = savedGeometry?.features.filter((f) => {
            if (geometriType === "titik") return f.geometry.type === "Point";
            if (geometriType === "garis") return f.geometry.type === "LineString";
            if (geometriType === "area") return f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon";
            return false;
        });

        if (!matchingSaved || matchingSaved.length === 0) return null;

        // For titik mode, return single point
        if (geometriType === "titik") {
            return { type: "Point", coordinates: (matchingSaved[0].geometry as Point).coordinates };
        }

        // For garis mode, return single line
        if (geometriType === "garis") {
            return { type: "LineString", coordinates: (matchingSaved[0].geometry as LineString).coordinates };
        }

        // For area mode, combine all polygons into MultiPolygon
        if (geometriType === "area") {
            const allPolygons: any[] = [];
            matchingSaved.forEach((f) => {
                if (f.geometry.type === "Polygon") {
                    allPolygons.push((f.geometry as Polygon).coordinates);
                } else if (f.geometry.type === "MultiPolygon") {
                    allPolygons.push(...(f.geometry as any).coordinates);
                }
            });
            return { type: "MultiPolygon", coordinates: allPolygons };
        }

        return null;
    };

    const handleOpenCollapsible = (key: keyof typeof openCollapsible) => {
        setOpenCollapsible({ ...openCollapsible, [key]: !openCollapsible[key] });
    };

    const handlePhotoClick = (index: number) => {
        setSelectedPhotoIndex(index);
        setIsPhotoModalOpen(true);
    };

    const handleNextPhoto = () => {
        if (selectedPhotoIndex !== null && toponymData?.photos) {
            setSelectedPhotoIndex((selectedPhotoIndex + 1) % toponymData.photos.length);
        }
    };

    const handlePrevPhoto = () => {
        if (selectedPhotoIndex !== null && toponymData?.photos) {
            setSelectedPhotoIndex((selectedPhotoIndex - 1 + toponymData.photos.length) % toponymData.photos.length);
        }
    };

    const handleEditClick = () => {
        if (toponymData) {
            setEditedData({
                local_name: toponymData.local_name,
                map_name: toponymData.map_name,
                element: toponymData.element,
                generic_element: toponymData.generic_element,
                specific_element: toponymData.specific_element,
                name_meaning: toponymData.name_meaning,
                other_name: toponymData.other_name,
                language_origin: toponymData.language_origin,
                name_history: toponymData.name_history,
                pronounciation: toponymData.pronounciation,
                spelling: toponymData.spelling,
                survey_at: toponymData.survey_at ? toponymData.survey_at.substring(0, 10) : "",
                province_id: toponymData.province_id,
                regency_id: toponymData.regency_id,
                district_id: toponymData.district_id,
                village_id: toponymData.village_id,
            });
            setIsEditMode(true);
            setIsEditingDraft(false);
            setDrawnPoints([]);
            // Fetch elements when entering edit mode
            fetchElements();
        }
    };

    const fetchElements = async () => {
        setLoadingElements(true);
        try {
            const result = await getElements(token);
            if (!result.error && result.data) {
                setElements(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch elements:", error);
        } finally {
            setLoadingElements(false);
        }
    };

    // Fetch toponym detail data - reusable function
    const fetchToponymDetail = useCallback(async () => {
        if (!transactionId || !toponymId) return;

        setLoading(true);
        try {
            const result = await getVerificationToponymDetail(token, transactionId, toponymId);

            if (!result.error && result.data) {
                setToponymData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch toponym detail:", error);
        } finally {
            setLoading(false);
        }
    }, [transactionId, toponymId, token]);

    const handleCancelDraft = useCallback(() => {
        // Restore from backup
        setSavedGeometry(savedGeometryBackup);
        setDrawnPoints([]);
        setHistoryStack([]);
        setIsEditingDraft(false);
    }, [savedGeometryBackup]);

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditedData({});
        setIsEditingDraft(false);
        setDrawnPoints([]);
        // Reset all new upload states
        setSelectedPhotoFiles([]);
        setSketsaLokasi(null);
        setRekamanSuara(null);
        setRekamanAudioVisual(null);
        setDokumenPendukung([]);
        // Reset geometry to initial state from server
        resetToInitialGeometry();
        // Reload original data to restore any removed existing media
        fetchToponymDetail();
    };

    // Regional Fetching
    useEffect(() => {
        if (!isEditMode && !toponymData) return;
        setLoadingProvinces(true);
        getRegions({ level: "PROVINCE", token, limit: 100 })
            .then((result) => {
                if (!result.error && result.data) setProvinces(result.data);
            })
            .finally(() => setLoadingProvinces(false));
    }, [isEditMode, toponymData, token]);

    useEffect(() => {
        const provCode = isEditMode ? editedData.province_id : toponymData?.province_id;
        if (!provCode) {
            setRegencies([]);
            return;
        }
        const selectedProvince = provinces.find((p) => p.code === provCode);
        if (!selectedProvince) return;
        setLoadingRegencies(true);
        getRegions({ level: "CITY", parent: selectedProvince.path, token, limit: 100 })
            .then((result) => {
                if (!result.error && result.data) setRegencies(result.data);
            })
            .finally(() => setLoadingRegencies(false));
    }, [isEditMode, editedData.province_id, toponymData?.province_id, provinces, token]);

    useEffect(() => {
        const provCode = isEditMode ? editedData.province_id : toponymData?.province_id;
        const regCode = isEditMode ? editedData.regency_id : toponymData?.regency_id;
        if (!provCode || !regCode) {
            setDistricts([]);
            return;
        }
        const selectedRegency = regencies.find((r) => r.code === regCode);
        if (!selectedRegency) return;
        setLoadingDistricts(true);
        getRegions({ level: "DISTRICT", parent: selectedRegency.path, token, limit: 100 })
            .then((result) => {
                if (!result.error && result.data) setDistricts(result.data);
            })
            .finally(() => setLoadingDistricts(false));
    }, [isEditMode, editedData.regency_id, toponymData?.regency_id, regencies, token]);

    useEffect(() => {
        const distCode = isEditMode ? editedData.district_id : toponymData?.district_id;
        if (!distCode) {
            setVillages([]);
            return;
        }
        const selectedDistrict = districts.find((d) => d.code === distCode);
        if (!selectedDistrict) return;
        setLoadingVillages(true);
        getRegions({ level: "VILLAGE", parent: selectedDistrict.path, token, limit: 100 })
            .then((result) => {
                if (!result.error && result.data) setVillages(result.data);
            })
            .finally(() => setLoadingVillages(false));
    }, [isEditMode, editedData.district_id, toponymData?.district_id, districts, token]);

    useEffect(() => {
        if (toponymData) {
            fetchElements();
        }
    }, [toponymData]);

    const handleInputChange = (field: keyof ToponymDetail, value: any) => {
        setEditedData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Supporting Info Handlers
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const MAX_SIZE = 5 * 1024 * 1024;
        const validFiles: { file: File; previewUrl: string }[] = [];
        for (const file of Array.from(files)) {
            if (file.size <= MAX_SIZE) {
                validFiles.push({ file, previewUrl: URL.createObjectURL(file) });
            } else {
                alert(`File ${file.name} melebihi ukuran maksimal 5MB`);
            }
        }
        if (validFiles.length > 0) {
            setSelectedPhotoFiles((prev) => [...prev, ...validFiles]);
        }
        e.target.value = "";
    };

    const handleRemovePhoto = (index: number) => {
        setSelectedPhotoFiles((prev) => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleRemoveExistingPhoto = (index: number) => {
        if (!toponymData) return;
        setToponymData({
            ...toponymData,
            photos: toponymData.photos.filter((_, i) => i !== index)
        });
    };

    const handleSketsaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert("File sketsa melebihi ukuran maksimal 5MB");
            return;
        }
        if (sketsaLokasi) URL.revokeObjectURL(sketsaLokasi.previewUrl);
        setSketsaLokasi({ file, previewUrl: URL.createObjectURL(file) });
        // Set editedData.sketch to null so it doesn't show up in preview while new file is selected
        setEditedData(prev => ({ ...prev, sketch: null }));
        e.target.value = "";
    };

    const handleRemoveSketsa = () => {
        if (sketsaLokasi) URL.revokeObjectURL(sketsaLokasi.previewUrl);
        setSketsaLokasi(null);
    };

    const handleRemoveExistingSketch = () => {
        if (!toponymData) return;
        setToponymData({ ...toponymData, sketch: null });
        setEditedData(prev => ({ ...prev, sketch: null }));
    };

    const handleRekamanSuaraSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert("File audio melebihi ukuran maksimal 10MB");
            return;
        }
        if (rekamanSuara) URL.revokeObjectURL(rekamanSuara.previewUrl);
        setRekamanSuara({ file, previewUrl: URL.createObjectURL(file) });
        setEditedData(prev => ({ ...prev, pronounciation_audio: null }));
        e.target.value = "";
    };

    const handleRemoveRekamanSuara = () => {
        if (rekamanSuara) URL.revokeObjectURL(rekamanSuara.previewUrl);
        setRekamanSuara(null);
    };

    const handleRemoveExistingAudio = () => {
        if (!toponymData) return;
        setToponymData({ ...toponymData, pronounciation_audio: null });
        setEditedData(prev => ({ ...prev, pronounciation_audio: null }));
    };

    const handleRekamanAudioVisualSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert("File video melebihi ukuran maksimal 50MB");
            return;
        }
        if (rekamanAudioVisual) URL.revokeObjectURL(rekamanAudioVisual.previewUrl);
        setRekamanAudioVisual({ file, previewUrl: URL.createObjectURL(file) });
        setEditedData(prev => ({ ...prev, video: null }));
        e.target.value = "";
    };

    const handleRemoveRekamanAudioVisual = () => {
        if (rekamanAudioVisual) URL.revokeObjectURL(rekamanAudioVisual.previewUrl);
        setRekamanAudioVisual(null);
    };

    const handleRemoveExistingVideo = () => {
        if (!toponymData) return;
        setToponymData({ ...toponymData, video: null });
        setEditedData(prev => ({ ...prev, video: null }));
    };

    const handleDokumenSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const MAX_SIZE = 10 * 1024 * 1024;
        const validFiles: { file: File; previewUrl: string }[] = [];
        for (const file of Array.from(files)) {
            if (file.size <= MAX_SIZE) {
                validFiles.push({ file, previewUrl: URL.createObjectURL(file) });
            } else {
                alert(`File ${file.name} melebihi ukuran maksimal 10MB`);
            }
        }
        if (validFiles.length > 0) {
            setDokumenPendukung((prev) => [...prev, ...validFiles]);
            setEditedData(prev => ({ ...prev, support_document: null }));
        }
        e.target.value = "";
    };

    const handleRemoveDokumen = (index: number) => {
        setDokumenPendukung((prev) => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleRemoveExistingDocs = () => {
        if (!toponymData) return;
        setToponymData({ ...toponymData, support_document: null });
        setEditedData(prev => ({ ...prev, support_document: null }));
    };

    const uploadPhotos = async (): Promise<{ url: string; filename: string }[]> => {
        const uploaded: { url: string; filename: string }[] = [];
        for (const fileData of selectedPhotoFiles) {
            try {
                const result = await uploadImage(fileData.file, token!);
                if (!result.error && result.data) {
                    uploaded.push({
                        url: result.data.url,
                        filename: result.data.filename || fileData.file.name,
                    });
                }
            } catch (err) {
                console.error("Failed to upload photo:", err);
            }
        }
        return uploaded;
    };


    const handleSaveChanges = async () => {
        if (!transactionId || !toponymId || !toponymData) return;

        setSaving(true);
        try {
            const token = localStorage.getItem("token");

            let uploadedPhotos: { url: string; filename: string }[] = [];
            if (selectedPhotoFiles.length > 0) uploadedPhotos = await uploadPhotos();
            // Combine existing (which might have been removed via UI) and new uploads
            const allPhotos = [...toponymData.photos, ...uploadedPhotos];

            // Upload sketsa lokasi if any new file
            let uploadedSketch: string | null = toponymData.sketch;
            if (sketsaLokasi) {
                try {
                    const result = await uploadImage(sketsaLokasi.file, token!);
                    if (!result.error && result.data) {
                        uploadedSketch = result.data.url;
                    }
                } catch (err) {
                    console.error("Failed to upload sketch:", err);
                }
            }

            // Upload rekaman suara if any new file
            let uploadedAudio: string | null = toponymData.pronounciation_audio;
            if (rekamanSuara) {
                try {
                    const result = await uploadAudio(rekamanSuara.file, token!);
                    if (!result.error && result.data) {
                        uploadedAudio = result.data.url;
                    }
                } catch (err) {
                    console.error("Failed to upload audio:", err);
                }
            }

            // Upload rekaman audio visual (video) if any new file
            let uploadedVideo: string | null = toponymData.video;
            if (rekamanAudioVisual) {
                try {
                    const result = await uploadVideo(rekamanAudioVisual.file, token!);
                    if (!result.error && result.data) {
                        uploadedVideo = result.data.url;
                    }
                } catch (err) {
                    console.error("Failed to upload video:", err);
                }
            }

            // Upload dokumen pendukung if any new file
            let uploadedDocs: string | null = toponymData.support_document;
            if (dokumenPendukung.length > 0) {
                try {
                    const result = await uploadDocs(dokumenPendukung[0].file, token!);
                    if (!result.error && result.data) {
                        uploadedDocs = result.data.url;
                    }
                } catch (err) {
                    console.error("Failed to upload docs:", err);
                }
            }

            // Build request body
            const requestBody: any = {
                local_name: editedData.local_name || toponymData.local_name,
                map_name: editedData.map_name || toponymData.map_name,
                other_name: editedData.other_name || toponymData.other_name,
                language_origin: editedData.language_origin || toponymData.language_origin,
                name_meaning: editedData.name_meaning || toponymData.name_meaning,
                name_history: editedData.name_history || toponymData.name_history,
                pronounciation: editedData.pronounciation || toponymData.pronounciation,
                spelling: editedData.spelling || toponymData.spelling,
                element: editedData.element?.code || toponymData.element.code,
                generic_element: editedData.generic_element || toponymData.generic_element,
                specific_element: editedData.specific_element || toponymData.specific_element,
                province_code: editedData.province_id || toponymData.province_id,
                regency_code: editedData.regency_id || toponymData.regency_id,
                district_code: editedData.district_id || toponymData.district_id,
                village_code: editedData.village_id || toponymData.village_id,
                survey_at: editedData.survey_at || toponymData.survey_at,
                notes: editedData.notes || toponymData.notes,
                sketch: uploadedSketch,
                photos: allPhotos,
                pronounciation_audio_url: uploadedAudio,
                video_url: uploadedVideo,
                support_document_url: uploadedDocs,
                geometry: getGeometry() || (toponymData.location_point
                    ? {
                        type: toponymData.geometry_type || toponymData.location_point.type,
                        coordinates: toponymData.location_point.coordinates,
                    }
                    : null),
                element_id: editedData.element?.code || toponymData.element.code,
            };

            const result = await updateVerificationToponym(token, transactionId, toponymId, requestBody);

            if (!result.error) {
                // Reload data from server to get updated geometry and all fields
                await fetchToponymDetail();
                setIsEditMode(false);
                setEditedData({});
                setIsEditingDraft(false);
                // Clear new file upload states
                setSelectedPhotoFiles([]);
                setSketsaLokasi(null);
                setRekamanSuara(null);
                setRekamanAudioVisual(null);
                setDokumenPendukung([]);
                alert("Perubahan berhasil disimpan!");
            } else {
                alert("Gagal menyimpan perubahan: " + result.message);
            }
        } catch (error) {
            console.error("Failed to save changes:", error);
            alert("Terjadi kesalahan saat menyimpan perubahan");
        } finally {
            setSaving(false);
        }
    };

    const handleAccept = async () => {
        if (!transactionId || !toponymId) return;

        if (!confirm("Apakah Anda yakin ingin menerima toponim ini?")) return;

        setSaving(true);
        try {
            const result = await acceptVerificationToponym(token, transactionId, toponymId);

            if (!result.error) {
                alert("Toponim berhasil diterima!");
                // redirect back to list
                router.push("/penelaahan?tab=review-data&view=table");
            } else {
                alert("Gagal menerima toponim: " + result.message);
            }
        } catch (error) {
            console.error("Failed to accept toponym:", error);
            alert("Terjadi kesalahan saat menerima toponim");
        } finally {
            setSaving(false);
        }
    };

    const handleReject = async () => {
        if (!transactionId || !toponymId) return;

        if (!confirm("Apakah Anda yakin ingin menolak toponim ini?")) return;

        setSaving(true);
        try {
            const result = await rejectVerificationToponym(token, transactionId, toponymId);

            if (!result.error) {
                alert("Toponim berhasil ditolak!");
                // router push to penelaahan
                router.push("/penelaahan?tab=review-data&view=table");
            } else {
                alert("Gagal menolak toponim: " + result.message);
            }
        } catch (error) {
            console.error("Failed to reject toponym:", error);
            alert("Terjadi kesalahan saat menolak toponim");
        } finally {
            setSaving(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchToponymDetail();
    }, [fetchToponymDetail]);

    useEffect(() => {
        if (!navbarRef.current) return;

        // Observe height changes of navbar
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setNavbarHeight(entry.contentRect.height);
            }
        });

        observer.observe(navbarRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <ReviewerLayout navbarRef={navbarRef}>
            <div className="flex flex-col overflow-hidden grow pt-23 h-full">
                <div className="flex grow">
                    <div className="block w-2/5 py-4 px-6 overflow-y-scroll max-h-[83vh]">
                        <div onClick={() => router.back()} className="flex items-center gap-3 mb-5 hover:opacity-70 transition-opacity cursor-pointer">
                            <Button size="icon-sm">
                                <ChevronLeft />
                            </Button>
                            <span className="font-medium text-gray-700">Kembali</span>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-500">Memuat data toponim...</p>
                            </div>
                        ) : toponymData ? (
                            <>
                                <h3 className="text-xl font-bold mb-3">ID Toponim: {toponymData.id}</h3>
                                <div className="flex gap-3 mb-3">
                                    {!isEditMode ? (
                                        <>
                                            <Button onClick={handleReject} disabled={saving} className="bg-red-600 hover:bg-red-800">
                                                <X /> Ditolak
                                            </Button>
                                            <Button onClick={handleAccept} disabled={saving} className="bg-green-700 hover:bg-green-800">
                                                <Check /> Diterima
                                            </Button>
                                            <Button onClick={handleEditClick} variant="outline">
                                                <PiPencilSimpleLineDuotone className="mr-2" /> Edit
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={handleSaveChanges} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                            </Button>
                                            <Button onClick={handleCancelEdit} variant="outline" disabled={saving}>
                                                Batalkan
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-6">
                                    {/* Informasi Spasial Section (Map Controls) */}
                                    {isEditMode && (
                                        <Collapsible open={openSpasial} onOpenChange={setOpenSpasial}>
                                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                                <ChevronDown className={`transition-transform ${openSpasial ? "" : "-rotate-90"}`} size={20} />
                                                Penggambaran Lokasi
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                                {!isEditingDraft ? (
                                                    <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-600" onClick={() => {
                                                        // Backup current saved geometry before editing
                                                        setSavedGeometryBackup(savedGeometry);
                                                        setIsEditingDraft(true);
                                                    }}>
                                                        {savedGeometry ? "Edit Lokasi di Peta" : "Tambah Lokasi di Peta"}
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>Tipe Geometri</Label>
                                                            <RadioGroup value={geometriType} onValueChange={(v) => setGeometriType(v as "titik" | "garis" | "area")} className="flex gap-6">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="titik" id="titik" />
                                                                    <Label htmlFor="titik" className="font-normal">
                                                                        Titik
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="garis" id="garis" />
                                                                    <Label htmlFor="garis" className="font-normal">
                                                                        Garis
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="area" id="area" />
                                                                    <Label htmlFor="area" className="font-normal">
                                                                        Area
                                                                    </Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox id="snapping" checked={fiturSnapping} onCheckedChange={(c) => setFiturSnapping(c as boolean)} />
                                                            <Label htmlFor="snapping" className="font-normal">
                                                                Fitur Snapping
                                                            </Label>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Button variant="outline" className="border-red-400 text-red-500 hover:bg-red-50" onClick={handleClearGeometry}>
                                                                <Trash2 size={16} className="mr-2" />
                                                                Bersihkan Penggambaran
                                                            </Button>
                                                            <Button variant="outline" className="border-orange-400 text-orange-500 hover:bg-orange-50" onClick={handleUndoGeometry}>
                                                                <RotateCcw size={16} className="mr-2" />
                                                                Kembali ke sebelumnya
                                                            </Button>
                                                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                                                                handleSaveGeometry();
                                                                setIsEditingDraft(false);
                                                            }}>
                                                                <Save size={16} className="mr-2" />
                                                                Simpan Lokasi
                                                            </Button>
                                                            <Button variant="outline" className="border-gray-400 text-gray-600 hover:bg-gray-50" onClick={handleCancelDraft}>
                                                                Batalkan
                                                            </Button>
                                                        </div>
                                                        {drawnPoints.length > 0 && (
                                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                                <Label className="text-sm font-medium mb-2 block">Koordinat Titik</Label>
                                                                <div className="space-y-1 text-sm">
                                                                    <p className="text-gray-500 text-xs mb-1">Titik yang sedang digambar:</p>
                                                                    {drawnPoints.map((point, idx) => (
                                                                        <div key={idx} className="text-blue-600 font-mono font-bold leading-tight mb-2 last:mb-0">
                                                                            <p>
                                                                                Lng: {point[0].toFixed(6)} ({ddToDMS(point[0], false)}),
                                                                            </p>
                                                                            <p>
                                                                                Lat: {point[1].toFixed(6)} ({ddToDMS(point[1], true)})
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {!isEditingDraft && savedGeometry?.features.length && (
                                                    <div className="p-3 bg-green-50 rounded-lg max-h-64 overflow-y-auto">
                                                        <Label className="text-sm font-medium mb-2 block text-green-700">Lokasi Tersimpan</Label>
                                                        {savedGeometry.features.map((feature, idx) => {
                                                            const geom = feature.geometry;
                                                            if (geom.type === "Point") {
                                                                const coords = (geom as Point).coordinates as number[];
                                                                return (
                                                                    <div key={idx} className="space-y-1">
                                                                        <p className="text-sm text-green-600 font-medium">Tipe: Titik</p>
                                                                        <div className="font-mono text-green-600 font-bold text-sm leading-tight">
                                                                            <p>
                                                                                Lng: {coords[0].toFixed(6)} ({ddToDMS(coords[0], false)}),
                                                                            </p>
                                                                            <p>
                                                                                Lat: {coords[1].toFixed(6)} ({ddToDMS(coords[1], true)})
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else if (geom.type === "LineString") {
                                                                const coords = (geom as LineString).coordinates as number[][];
                                                                return (
                                                                    <div key={idx} className="space-y-1">
                                                                        <p className="text-sm text-green-600 font-medium">Tipe: Garis ({coords.length} titik)</p>
                                                                        <div className="grid grid-cols-1 gap-0.5">
                                                                            {coords.map((c, i) => (
                                                                                <div key={i} className="font-mono text-green-600 font-bold text-sm leading-tight mb-1 last:mb-0">
                                                                                    <p>
                                                                                        {i + 1}. Lng: {c[0].toFixed(6)} ({ddToDMS(c[0], false)}),
                                                                                    </p>
                                                                                    <p className="pl-4">
                                                                                        Lat: {c[1].toFixed(6)} ({ddToDMS(c[1], true)})
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else if (geom.type === "Polygon") {
                                                                const coords = ((geom as Polygon).coordinates as number[][][])[0];
                                                                const uniqueCoords = coords.slice(0, -1);
                                                                return (
                                                                    <div key={idx} className="space-y-1">
                                                                        <p className="text-sm text-green-600 font-medium">Tipe: Area ({uniqueCoords.length} titik)</p>
                                                                        <div className="grid grid-cols-1 gap-0.5">
                                                                            {uniqueCoords.map((c, i) => (
                                                                                <div key={i} className="font-mono text-green-600 font-bold text-sm leading-tight mb-1 last:mb-0">
                                                                                    <p>
                                                                                        {i + 1}. Lng: {c[0].toFixed(6)} ({ddToDMS(c[0], false)}),
                                                                                    </p>
                                                                                    <p className="pl-4">
                                                                                        Lat: {c[1].toFixed(6)} ({ddToDMS(c[1], true)})
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                )}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )}
                                    <Collapsible open={openCollapsible.toponim} onOpenChange={() => handleOpenCollapsible("toponim")}>
                                        <div className="flex items-center justify-between gap-4 px-4">
                                            <h3 className="text-xl font-semibold">Informasi Unsur Rupabumi</h3>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <ChevronDown />
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                            <form action="" className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Elemen Generik</Label>
                                                    <Input
                                                        value={isEditMode ? editedData.generic_element || "" : toponymData.generic_element || ""}
                                                        onChange={(e) => handleInputChange("generic_element", e.target.value)}
                                                        readOnly={!isEditMode}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Elemen Spesifik</Label>
                                                    <Input
                                                        value={isEditMode ? editedData.specific_element || "" : toponymData.specific_element || ""}
                                                        onChange={(e) => handleInputChange("specific_element", e.target.value)}
                                                        readOnly={!isEditMode}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nama Lokal</Label>
                                                    <Input value={isEditMode ? editedData.local_name || "" : toponymData.local_name || ""} onChange={(e) => handleInputChange("local_name", e.target.value)} readOnly={!isEditMode} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nama Peta</Label>
                                                    <Input value={isEditMode ? editedData.map_name || "" : toponymData.map_name || ""} onChange={(e) => handleInputChange("map_name", e.target.value)} readOnly={!isEditMode} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nama Lain</Label>
                                                    <Input value={isEditMode ? editedData.other_name || "" : toponymData.other_name || ""} onChange={(e) => handleInputChange("other_name", e.target.value)} readOnly={!isEditMode} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Asal Bahasa</Label>
                                                    <Input
                                                        value={isEditMode ? editedData.language_origin || "" : toponymData.language_origin || ""}
                                                        onChange={(e) => handleInputChange("language_origin", e.target.value)}
                                                        readOnly={!isEditMode}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Arti Nama</Label>
                                                    <Input value={isEditMode ? editedData.name_meaning || "" : toponymData.name_meaning || ""} onChange={(e) => handleInputChange("name_meaning", e.target.value)} readOnly={!isEditMode} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Sejarah Nama</Label>
                                                    <Input value={isEditMode ? editedData.name_history || "" : toponymData.name_history || ""} onChange={(e) => handleInputChange("name_history", e.target.value)} readOnly={!isEditMode} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Pelafalan</Label>
                                                    <Input
                                                        value={isEditMode ? editedData.pronounciation || "" : toponymData.pronounciation || ""}
                                                        onChange={(e) => handleInputChange("pronounciation", e.target.value)}
                                                        readOnly={!isEditMode}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Ejaan</Label>
                                                    <Input value={isEditMode ? editedData.spelling || "" : toponymData.spelling || ""} onChange={(e) => handleInputChange("spelling", e.target.value)} readOnly={!isEditMode} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Elemen</Label>
                                                    {isEditMode ? (
                                                        <Popover open={openElementCombobox} onOpenChange={setOpenElementCombobox}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" role="combobox" aria-expanded={openElementCombobox} className="w-full justify-between font-normal" disabled={loadingElements}>
                                                                    {loadingElements ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                            Memuat...
                                                                        </>
                                                                    ) : editedData.element?.code || toponymData.element?.code ? (
                                                                        elements.find((e) => e.code === (editedData.element?.code || toponymData.element?.code))?.name
                                                                    ) : (
                                                                        "Pilih Elemen"
                                                                    )}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-full p-0" align="start">
                                                                <Command>
                                                                    <CommandInput placeholder="Cari elemen..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>Elemen tidak ditemukan.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {elements.map((element) => (
                                                                                <CommandItem
                                                                                    key={element.code}
                                                                                    value={element.name}
                                                                                    onSelect={() => {
                                                                                        handleInputChange("element", {
                                                                                            code: element.code,
                                                                                            name: element.name,
                                                                                        });
                                                                                        setOpenElementCombobox(false);
                                                                                    }}
                                                                                >
                                                                                    <Check className={cn("mr-2 h-4 w-4", (editedData.element?.code || toponymData.element?.code) === element.code ? "opacity-100" : "opacity-0")} />
                                                                                    {element.name}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <Input value={toponymData.element?.name || "-"} readOnly />
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Provinsi</Label>
                                                    {isEditMode ? (
                                                        <Popover open={openProvincePopover} onOpenChange={setOpenProvincePopover}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingProvinces}>
                                                                    {loadingProvinces
                                                                        ? "Memuat..."
                                                                        : editedData.province_id || toponymData.province_id
                                                                            ? provinces.find((p) => p.code === (editedData.province_id || toponymData.province_id))?.name || editedData.province_id || toponymData.province_id
                                                                            : "Pilih Provinsi"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-full p-0" align="start">
                                                                <Command>
                                                                    <CommandInput placeholder="Cari..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {provinces.map((p) => (
                                                                                <CommandItem
                                                                                    key={p.code}
                                                                                    value={p.name}
                                                                                    onSelect={() => {
                                                                                        setEditedData((prev) => ({ ...prev, province_id: p.code, regency_id: "", district_id: "", village_id: "" }));
                                                                                        setOpenProvincePopover(false);
                                                                                    }}
                                                                                >
                                                                                    <Check className={cn("mr-2 h-4 w-4", (editedData.province_id || toponymData.province_id) === p.code ? "opacity-100" : "opacity-0")} />
                                                                                    {p.name}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <Input value={provinces.find((p) => p.code === toponymData.province_id)?.name || toponymData.province_id || "-"} readOnly />
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Kabupaten/Kota</Label>
                                                    {isEditMode ? (
                                                        <Popover open={openRegencyPopover} onOpenChange={setOpenRegencyPopover}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingRegencies || !(editedData.province_id || toponymData.province_id)}>
                                                                    {loadingRegencies
                                                                        ? "Memuat..."
                                                                        : editedData.regency_id || toponymData.regency_id
                                                                            ? regencies.find((r) => r.code === (editedData.regency_id || toponymData.regency_id))?.name || editedData.regency_id || toponymData.regency_id
                                                                            : editedData.province_id || toponymData.province_id
                                                                                ? "Pilih Kabupaten/Kota"
                                                                                : "Pilih Provinsi dulu"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-full p-0" align="start">
                                                                <Command>
                                                                    <CommandInput placeholder="Cari..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {regencies.map((r) => (
                                                                                <CommandItem
                                                                                    key={r.code}
                                                                                    value={r.name}
                                                                                    onSelect={() => {
                                                                                        setEditedData((prev) => ({ ...prev, regency_id: r.code, district_id: "", village_id: "" }));
                                                                                        setOpenRegencyPopover(false);
                                                                                    }}
                                                                                >
                                                                                    <Check className={cn("mr-2 h-4 w-4", (editedData.regency_id || toponymData.regency_id) === r.code ? "opacity-100" : "opacity-0")} />
                                                                                    {r.name}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <Input value={regencies.find((r) => r.code === toponymData.regency_id)?.name || toponymData.regency_id || "-"} readOnly />
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Kecamatan</Label>
                                                    {isEditMode ? (
                                                        <Popover open={openDistrictPopover} onOpenChange={setOpenDistrictPopover}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingDistricts || !(editedData.regency_id || toponymData.regency_id)}>
                                                                    {loadingDistricts
                                                                        ? "Memuat..."
                                                                        : editedData.district_id || toponymData.district_id
                                                                            ? districts.find((d) => d.code === (editedData.district_id || toponymData.district_id))?.name || editedData.district_id || toponymData.district_id
                                                                            : editedData.regency_id || toponymData.regency_id
                                                                                ? "Pilih Kecamatan"
                                                                                : "Pilih Kabupaten dulu"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-full p-0" align="start">
                                                                <Command>
                                                                    <CommandInput placeholder="Cari..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {districts.map((d) => (
                                                                                <CommandItem
                                                                                    key={d.code}
                                                                                    value={d.name}
                                                                                    onSelect={() => {
                                                                                        setEditedData((prev) => ({ ...prev, district_id: d.code, village_id: "" }));
                                                                                        setOpenDistrictPopover(false);
                                                                                    }}
                                                                                >
                                                                                    <Check className={cn("mr-2 h-4 w-4", (editedData.district_id || toponymData.district_id) === d.code ? "opacity-100" : "opacity-0")} />
                                                                                    {d.name}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <Input value={districts.find((d) => d.code === toponymData.district_id)?.name || toponymData.district_id || "-"} readOnly />
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Desa/Kelurahan</Label>
                                                    {isEditMode ? (
                                                        <Popover open={openVillagePopover} onOpenChange={setOpenVillagePopover}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingVillages || !(editedData.district_id || toponymData.district_id)}>
                                                                    {loadingVillages
                                                                        ? "Memuat..."
                                                                        : editedData.village_id || toponymData.village_id
                                                                            ? villages.find((v) => v.code === (editedData.village_id || toponymData.village_id))?.name || editedData.village_id || toponymData.village_id
                                                                            : editedData.district_id || toponymData.district_id
                                                                                ? "Pilih Desa/Kelurahan"
                                                                                : "Pilih Kecamatan dulu"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-full p-0" align="start">
                                                                <Command>
                                                                    <CommandInput placeholder="Cari..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {villages.map((v) => (
                                                                                <CommandItem
                                                                                    key={v.code}
                                                                                    value={v.name}
                                                                                    onSelect={() => {
                                                                                        setEditedData((prev) => ({ ...prev, village_id: v.code }));
                                                                                        setOpenVillagePopover(false);
                                                                                    }}
                                                                                >
                                                                                    <Check className={cn("mr-2 h-4 w-4", (editedData.village_id || toponymData.village_id) === v.code ? "opacity-100" : "opacity-0")} />
                                                                                    {v.name}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <Input value={villages.find((v) => v.code === toponymData.village_id)?.name || toponymData.village_id || "-"} readOnly />
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Tanggal Survei</Label>
                                                    <Input
                                                        type={isEditMode ? "date" : "text"}
                                                        value={isEditMode ? editedData.survey_at || "" : formatDate(toponymData.survey_at)}
                                                        onChange={(e) => handleInputChange("survey_at", e.target.value)}
                                                        readOnly={!isEditMode}
                                                    />
                                                </div>
                                                {toponymData.location_point?.coordinates && (
                                                    <div className="space-y-2">
                                                        <Label>Koordinat</Label>
                                                        <div className="p-3 bg-gray-50 border rounded-md font-mono text-sm space-y-1">
                                                            <p>
                                                                Lng: {toponymData.location_point.coordinates[0].toFixed(6)} ({ddToDMS(toponymData.location_point.coordinates[0], false)})
                                                            </p>
                                                            <p>
                                                                Lat: {toponymData.location_point.coordinates[1].toFixed(6)} ({ddToDMS(toponymData.location_point.coordinates[1], true)})
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </form>
                                        </CollapsibleContent>
                                    </Collapsible>
                                    <Collapsible open={openCollapsible.additional} onOpenChange={() => handleOpenCollapsible("additional")}>
                                        <div className="flex items-center justify-between gap-4 px-4">
                                            <h3 className="text-xl font-semibold">Informasi Pendukung</h3>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <ChevronDown />
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                            {/* 1. Foto Dokumentasi */}
                                            <div className="space-y-4">
                                                <Label className="font-medium">Foto Dokumentasi</Label>
                                                {isEditMode && (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            onChange={handlePhotoSelect} 
                                                            className="hidden" 
                                                            id="photo-upload" 
                                                            multiple
                                                        />
                                                        <label htmlFor="photo-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                            <FileImage className="h-8 w-8 text-gray-400 mb-2" />
                                                            <span className="text-sm text-gray-500">Klik untuk upload foto</span>
                                                            <span className="text-xs text-gray-400 mt-1">Maksimal 5MB per file</span>
                                                        </label>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-3">
                                                    {/* Existing Photos */}
                                                    {toponymData.photos && toponymData.photos.map((photo, index) => (
                                                        <div key={`existing-${index}`} className="w-24 h-24 relative group rounded-lg overflow-hidden border">
                                                            <Image src={photo.url} alt={photo.filename} fill className="object-cover" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handlePhotoClick(index)}
                                                                    className="p-1 hover:scale-110 transition-transform text-white"
                                                                >
                                                                    <Maximize2 size={18} />
                                                                </button>
                                                            </div>
                                                            {isEditMode && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveExistingPhoto(index)}
                                                                    className="absolute top-1 right-1 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm border border-red-100"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* New Photo Files */}
                                                    {selectedPhotoFiles.map((photo, index) => (
                                                        <div key={`new-${index}`} className="w-24 h-24 relative group rounded-lg overflow-hidden border">
                                                            <Image src={photo.previewUrl} alt={photo.file.name} fill className="object-cover" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setPreviewSketch({ url: photo.previewUrl, name: photo.file.name })}
                                                                    className="p-1 hover:scale-110 transition-transform text-white"
                                                                >
                                                                    <Maximize2 size={18} />
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemovePhoto(index)}
                                                                className="absolute top-1 right-1 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm border border-red-100"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {!isEditMode && (!toponymData.photos || toponymData.photos.length === 0) && (
                                                        <p className="text-sm text-gray-500 italic">Tidak ada foto dokumentasi</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 2. Sketsa Lokasi */}
                                            <div className="space-y-4">
                                                <Label className="font-medium">Sketsa Lokasi</Label>
                                                {isEditMode && (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            onChange={handleSketsaSelect} 
                                                            className="hidden" 
                                                            id="sketch-upload" 
                                                        />
                                                        <label htmlFor="sketch-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                            <FileImage className="h-8 w-8 text-gray-400 mb-2" />
                                                            <span className="text-sm text-gray-500">Klik untuk upload sketsa</span>
                                                            <span className="text-xs text-gray-400 mt-1">Maksimal 5MB. Hanya 1 file.</span>
                                                        </label>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-3">
                                                    {toponymData.sketch && (
                                                        <div className="w-24 h-24 relative group rounded-lg overflow-hidden border">
                                                            <img src={toponymData.sketch} alt="Sketsa Lokasi" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setPreviewSketch({ url: toponymData.sketch!, name: "Sketsa Lokasi" })}
                                                                    className="p-1 hover:scale-110 transition-transform text-white"
                                                                >
                                                                    <Maximize2 size={18} />
                                                                </button>
                                                            </div>
                                                            {isEditMode && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleRemoveExistingSketch}
                                                                    className="absolute top-1 right-1 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm border border-red-100"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {sketsaLokasi && (
                                                        <div className="w-24 h-24 relative group rounded-lg overflow-hidden border">
                                                            <img src={sketsaLokasi.previewUrl} alt={sketsaLokasi.file.name} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setPreviewSketch({ url: sketsaLokasi.previewUrl, name: sketsaLokasi.file.name })}
                                                                    className="p-1 hover:scale-110 transition-transform text-white"
                                                                >
                                                                    <Maximize2 size={18} />
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveSketsa}
                                                                className="absolute top-1 right-1 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm border border-red-100"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {!isEditMode && !toponymData.sketch && !sketsaLokasi && (
                                                        <p className="text-sm text-gray-500 italic">Tidak ada sketsa lokasi</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 3. Rekaman Suara Pengucapan */}
                                            <div className="space-y-4">
                                                <Label className="font-medium">Rekaman Suara Pengucapan</Label>
                                                {isEditMode && (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                        <input 
                                                            type="file" 
                                                            accept="audio/*" 
                                                            onChange={handleRekamanSuaraSelect} 
                                                            className="hidden" 
                                                            id="audio-upload" 
                                                        />
                                                        <label htmlFor="audio-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                            <Mic className="h-8 w-8 text-gray-400 mb-2" />
                                                            <span className="text-sm text-gray-500">Klik untuk upload rekaman suara</span>
                                                            <span className="text-xs text-gray-400 mt-1">Maksimal 10MB</span>
                                                        </label>
                                                    </div>
                                                )}

                                                {toponymData.pronounciation_audio && (
                                                    <div className="relative group p-3 bg-gray-50 rounded-lg border border-gray-200 w-full">
                                                        <audio controls className="w-full h-10">
                                                            <source src={toponymData.pronounciation_audio} />
                                                            Browser Anda tidak mendukung audio player.
                                                        </audio>
                                                        {isEditMode && (
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveExistingAudio}
                                                                className="absolute -top-2 -right-2 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 border border-red-100 shadow-sm"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {rekamanSuara && (
                                                    <div className="relative group p-3 bg-gray-50 rounded-lg border border-gray-200 w-full">
                                                        <p className="text-xs text-gray-500 mb-2 truncate">{rekamanSuara.file.name}</p>
                                                        <audio controls className="w-full h-10">
                                                            <source src={rekamanSuara.previewUrl} />
                                                        </audio>
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveRekamanSuara}
                                                            className="absolute -top-2 -right-2 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 border border-red-100 shadow-sm"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {!isEditMode && !toponymData.pronounciation_audio && !rekamanSuara && (
                                                    <p className="text-sm text-gray-500 italic">Tidak ada rekaman suara</p>
                                                )}
                                            </div>

                                            {/* 4. Rekaman Audio Visual */}
                                            <div className="space-y-4">
                                                <Label className="font-medium">Rekaman Audio Visual</Label>
                                                {isEditMode && (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                        <input 
                                                            type="file" 
                                                            accept="video/*" 
                                                            onChange={handleRekamanAudioVisualSelect} 
                                                            className="hidden" 
                                                            id="video-upload" 
                                                        />
                                                        <label htmlFor="video-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                            <Video className="h-8 w-8 text-gray-400 mb-2" />
                                                            <span className="text-sm text-gray-500">Klik untuk upload rekaman video</span>
                                                            <span className="text-xs text-gray-400 mt-1">Maksimal 50MB</span>
                                                        </label>
                                                    </div>
                                                )}

                                                {toponymData.video && (
                                                    <div className="relative group rounded-lg overflow-hidden border bg-black">
                                                        <video controls className="w-full max-h-64">
                                                            <source src={toponymData.video} />
                                                            Browser Anda tidak mendukung video player.
                                                        </video>
                                                        {isEditMode && (
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveExistingVideo}
                                                                className="absolute top-2 right-2 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 border border-red-100 shadow-sm"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {rekamanAudioVisual && (
                                                    <div className="relative group rounded-lg overflow-hidden border bg-black">
                                                        <video controls className="w-full max-h-64">
                                                            <source src={rekamanAudioVisual.previewUrl} />
                                                        </video>
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveRekamanAudioVisual}
                                                            className="absolute top-2 right-2 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10 border border-red-100 shadow-sm"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {!isEditMode && !toponymData.video && !rekamanAudioVisual && (
                                                    <p className="text-sm text-gray-500 italic">Tidak ada rekaman video</p>
                                                )}
                                            </div>

                                            {/* 5. Dokumen Pendukung */}
                                            <div className="space-y-4">
                                                <Label className="font-medium">Dokumen Pendukung</Label>
                                                {isEditMode && (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                        <input 
                                                            type="file" 
                                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                                                            onChange={handleDokumenSelect} 
                                                            className="hidden" 
                                                            id="doc-upload"
                                                        />
                                                        <label htmlFor="doc-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                            <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                                            <span className="text-sm text-gray-500">Klik untuk upload dokumen</span>
                                                            <span className="text-xs text-gray-400 mt-1">Maksimal 10MB</span>
                                                        </label>
                                                    </div>
                                                )}

                                                {toponymData.support_document && (
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-8 w-8 text-orange-500" />
                                                            <p className="text-sm font-medium">Dokumen Tersedia</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-blue-500 hover:text-blue-700"
                                                                onClick={() => window.open(toponymData.support_document!, '_blank')}
                                                            >
                                                                <ExternalLink size={20} />
                                                            </Button>
                                                            {isEditMode && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={handleRemoveExistingDocs}
                                                                >
                                                                    <X size={20} />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {dokumenPendukung.map((doc, index) => (
                                                    <div key={`new-doc-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-blue-200">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-8 w-8 text-blue-500" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium truncate max-w-[200px]">{doc.file.name}</p>
                                                                <p className="text-xs text-gray-400">File baru akan diunggah</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleRemoveDokumen(index)}
                                                        >
                                                            <X size={20} />
                                                        </Button>
                                                    </div>
                                                ))}

                                                {!isEditMode && !toponymData.support_document && dokumenPendukung.length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">Tidak ada dokumen pendukung</p>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                {/* Photo Modal */}
                                <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
                                    <DialogContent className="max-w-none sm:max-w-none w-screen h-screen p-0 m-0 bg-black/60 border-none shadow-none rounded-none overflow-hidden flex items-center justify-center">
                                        <DialogTitle className="sr-only">Foto</DialogTitle>
                                        {selectedPhotoIndex !== null && toponymData?.photos && (
                                            <div className="w-screen h-screen flex items-center justify-center bg-transparent py-1 px-4 relative group/gallery">
                                                <img src={toponymData.photos[selectedPhotoIndex].url} alt={toponymData.photos[selectedPhotoIndex].filename} className="max-w-full max-h-full object-contain" />

                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-center z-50">
                                                    <p className="text-sm font-medium">{toponymData.photos[selectedPhotoIndex].filename}</p>
                                                    <p className="text-xs opacity-80">
                                                        {selectedPhotoIndex + 1} dari {toponymData.photos.length}
                                                    </p>
                                                </div>

                                                {toponymData.photos.length > 1 && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 transition-all border border-white/20 backdrop-blur-md z-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePrevPhoto();
                                                            }}
                                                        >
                                                            <ChevronLeft size={28} />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 transition-all border border-white/20 backdrop-blur-md z-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleNextPhoto();
                                                            }}
                                                        >
                                                            <ChevronLeft size={28} className="rotate-180" />
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 transition-all border border-white/20 backdrop-blur-md z-50"
                                                    onClick={() => setIsPhotoModalOpen(false)}
                                                >
                                                    <X size={28} />
                                                </Button>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>

                                {/* Sketsa Modal */}
                                <Dialog open={!!previewSketch} onOpenChange={() => setPreviewSketch(null)}>
                                    <DialogContent className="max-w-none sm:max-w-none w-screen h-screen p-0 m-0 bg-black/60 border-none shadow-none rounded-none overflow-hidden flex items-center justify-center">
                                        <DialogTitle className="sr-only">Sketsa</DialogTitle>
                                        {previewSketch && (
                                            <div className="w-screen h-screen flex items-center justify-center bg-transparent py-1 px-4 relative">
                                                <img src={previewSketch.url} alt={previewSketch.name} className="max-w-full max-h-full object-contain" />

                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-center z-50">
                                                    <p className="text-sm font-medium">{previewSketch.name}</p>
                                                </div>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 transition-all border border-white/20 backdrop-blur-md z-50"
                                                    onClick={() => setPreviewSketch(null)}
                                                >
                                                    <X size={28} />
                                                </Button>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : (
                            <p className="text-gray-500">Data tidak ditemukan atau sudah melalui proses penelaahan</p>
                        )}
                    </div>
                    <div className="flex-1 h-full">
                        <PreviewMap
                            isEditing={isEditingDraft}
                            geometriType={geometriType}
                            snappingEnabled={fiturSnapping}
                            drawnPoints={drawnPoints}
                            onPointsChange={handlePointsChange}
                            savedGeometry={savedGeometry}
                            onClearSaved={handleClearSavedGeometry}
                            onSave={handleSaveGeometry}
                            onUndo={handleUndoGeometry}
                            locationPointMarker={locationPointMarker}
                            isEditMode={isEditMode}
                        />
                    </div>
                </div>
            </div>
        </ReviewerLayout>
    );
};

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DetailToponimContent />
        </Suspense>
    );
};

export default Page;
