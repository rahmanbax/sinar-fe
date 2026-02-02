"use client";
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, ChevronLeft, ChevronRight, Layers, Minus, Plus, RotateCcw, Save, CircleDot, Trash2, Loader2, Check, ChevronsUpDown, Camera, X, Maximize2, FileImage, Mic, Video, FileText, ExternalLink } from "lucide-react";
import SurveyorLayout from "@/layouts/SurveryorLayout";
import Link from "next/link";
import { Map, Source, Layer, Marker, type MapRef, type ViewState, type MapLayerMouseEvent } from "@vis.gl/react-maplibre";
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FeatureCollection, Feature, Point, LineString, Polygon } from "geojson";
import { IoLocationSharp } from "react-icons/io5";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { getRegions } from "@/api/region";
import { getElements } from "@/api/classification";
import { uploadImage, uploadAudio, uploadVideo, uploadDocs } from "@/api/media";
import { getToponymById, updateToponym } from "@/api/toponym";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";

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

const ddToDMS = (dd: number, isLat: boolean): string => {
    const absDd = Math.abs(dd);
    const deg = Math.floor(absDd);
    const min = Math.floor((absDd - deg) * 60);
    const sec = ((absDd - deg - min / 60) * 3600).toFixed(2);
    const direction = isLat ? (dd >= 0 ? "LU" : "LS") : dd >= 0 ? "BT" : "BB";
    return `${deg}° ${min}' ${sec}" ${direction}`;
};



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

    const hasZoomedRef = useRef(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Reset zoom flag when savedGeometry or locationPointMarker changes
    useEffect(() => {
        hasZoomedRef.current = false;
    }, [savedGeometry, locationPointMarker]);

    useEffect(() => {
        if (mapRef.current && mapLoaded && !hasZoomedRef.current) {
            let rawCenter: [number, number] | null = null;

            // Priority 1: If we have a location point marker and we are NOT in active draft editing mode
            if (locationPointMarker && !isEditing) {
                rawCenter = locationPointMarker;
            }
            // Priority 2: Use saved geometry if available
            else if (savedGeometry?.features.length) {
                const feature = savedGeometry.features[0];
                if (feature.geometry.type === "Point") {
                    rawCenter = feature.geometry.coordinates as [number, number];
                } else if (feature.geometry.type === "LineString") {
                    const coords = feature.geometry.coordinates as [number, number][];
                    rawCenter = coords[0];
                } else if (feature.geometry.type === "Polygon") {
                    const coords = feature.geometry.coordinates as [number, number][][];
                    rawCenter = coords[0][0];
                }
            }

            if (rawCenter) {
                const [lng, lat] = getSafeCoords(rawCenter);
                if (!isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat)) {
                    hasZoomedRef.current = true;
                    mapRef.current.flyTo({
                        center: [lng, lat],
                        zoom: 15,
                        duration: 1500,
                    });
                }
            }
        }
    }, [savedGeometry, locationPointMarker, mapLoaded, isEditing]);

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
                onLoad={() => setMapLoaded(true)}
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
                {/* Show location_point marker ONLY for point mode when not drafting */}
                {!isEditing && locationPointMarker && geometriType === "titik" && (
                    <Marker
                        longitude={getSafeCoords(locationPointMarker)[0]}
                        latitude={getSafeCoords(locationPointMarker)[1]}
                        anchor="bottom"
                    >
                        <IoLocationSharp className="text-3xl text-blue-600 drop-shadow-lg" />
                    </Marker>
                )}
                {/* Show saved geometry layers (polygons/lines) */}
                {savedGeometry && (
                    <>
                        <Source id="saved-geometry" type="geojson" data={savedGeometry}>
                            <Layer
                                id="saved-polygon-fill"
                                type="fill"
                                filter={["==", ["geometry-type"], "Polygon"]}
                                paint={{
                                    "fill-color": "#3b82f6",
                                    "fill-opacity": 0.3,
                                }}
                            />
                            <Layer
                                id="saved-line"
                                type="line"
                                filter={["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "Polygon"]]}
                                paint={{
                                    "line-color": "#3b82f6",
                                    "line-width": 2,
                                }}
                            />
                        </Source>
                        {savedGeometry.features
                            .filter((f) => f.geometry.type === "Point")
                            .map((feature, idx) => {
                                const rawCoords = (feature.geometry as Point).coordinates as [number, number];
                                const [lng, lat] = getSafeCoords(rawCoords);
                                // For titik mode when not editing, we use the main marker above
                                if (!isEditing && geometriType === "titik") return null;
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
                                    <IoLocationSharp className="text-3xl text-blue-600 drop-shadow-lg opacity-90" />
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

const EditToponimContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toponymId = searchParams.get("id");
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [openSpasial, setOpenSpasial] = useState(true);
    const [openAtribut, setOpenAtribut] = useState(true);
    const [isEditingDraft, setIsEditingDraft] = useState(false);
    const [geometriType, setGeometriType] = useState<"titik" | "garis" | "area">("titik");
    const [fiturSnapping, setFiturSnapping] = useState(false);
    const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
    const [savedGeometry, setSavedGeometry] = useState<FeatureCollection | null>(null);
    const [locationPointMarker, setLocationPointMarker] = useState<[number, number] | null>(null);
    const [historyStack, setHistoryStack] = useState<[number, number][][]>([]);

    const [genericElement, setGenericElement] = useState("");
    const [specificElement, setSpecificElement] = useState("");
    const [localName, setLocalName] = useState("");
    const [mapName, setMapName] = useState("");
    const [otherName, setOtherName] = useState("");
    const [languageOrigin, setLanguageOrigin] = useState("");
    const [nameMeaning, setNameMeaning] = useState("");
    const [nameHistory, setNameHistory] = useState("");
    const [pronounciation, setPronounciation] = useState("");
    const [spelling, setSpelling] = useState("");
    const [elementCode, setElementCode] = useState("");
    const [surveyAt, setSurveyAt] = useState("");
    const [provinceCode, setProvinceCode] = useState("");
    const [regencyCode, setRegencyCode] = useState("");
    const [districtCode, setDistrictCode] = useState("");
    const [villageCode, setVillageCode] = useState("");

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [regencies, setRegencies] = useState<Region[]>([]);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [villages, setVillages] = useState<Region[]>([]);
    const [loadingVillages, setLoadingVillages] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl: string }[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<{ url: string; filename: string }[]>([]);
    const [elements, setElements] = useState<Element[]>([]);
    const [loadingElements, setLoadingElements] = useState(true);
    const [openElementCombobox, setOpenElementCombobox] = useState(false);
    const [openProvincePopover, setOpenProvincePopover] = useState(false);
    const [openRegencyPopover, setOpenRegencyPopover] = useState(false);
    const [openDistrictPopover, setOpenDistrictPopover] = useState(false);
    const [openVillagePopover, setOpenVillagePopover] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
    const { isMobile } = useIsMobile();

    // Informasi Pendukung state
    const [openInformasiPendukung, setOpenInformasiPendukung] = useState(true);
    const [sketsaLokasi, setSketsaLokasi] = useState<{ file: File; previewUrl: string } | null>(null);
    const [existingSketch, setExistingSketch] = useState<string | null>(null);
    const [rekamanSuara, setRekamanSuara] = useState<{ file: File; previewUrl: string } | null>(null);
    const [existingAudio, setExistingAudio] = useState<string | null>(null);
    const [rekamanAudioVisual, setRekamanAudioVisual] = useState<{ file: File; previewUrl: string } | null>(null);
    const [existingVideo, setExistingVideo] = useState<string | null>(null);
    const [dokumenPendukung, setDokumenPendukung] = useState<{ file: File; previewUrl: string }[]>([]);
    const [existingDocs, setExistingDocs] = useState<string | null>(null);

    // Resize state
    const [formWidth, setFormWidth] = useState<number | string>("40%");
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (e: MouseEvent) => {
            if (isResizing) {
                const newWidth = e.clientX;
                if (newWidth > 320 && newWidth < window.innerWidth * 0.75) {
                    setFormWidth(newWidth);
                }
            }
        },
        [isResizing],
    );

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        } else {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing, resize, stopResizing]);

    // Fetch existing toponym data
    useEffect(() => {
        if (!toponymId || !token) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await getToponymById(toponymId, token);
                if (!result.error && result.data) {
                    const d = result.data;
                    setLocalName(d.local_name || "");
                    setMapName(d.map_name || "");
                    setOtherName(d.other_name || "");
                    setLanguageOrigin(d.language_origin || "");
                    setNameMeaning(d.name_meaning || "");
                    setNameHistory(d.name_history || "");
                    setPronounciation(d.pronounciation || "");
                    setSpelling(d.spelling || "");
                    setGenericElement(d.generic_element || "");
                    setSpecificElement(d.specific_element || "");
                    setElementCode(d.element?.code || "");
                    setSurveyAt(d.survey_at ? d.survey_at.substring(0, 10) : "");
                    setProvinceCode(d.province_id || "");
                    setRegencyCode(d.regency_id || "");
                    setDistrictCode(d.district_id || "");
                    setVillageCode(d.village_id || "");
                    if (d.photos) setExistingPhotos(d.photos.map((p: any) => ({ url: p.url, filename: p.filename || p.original_name })));

                    // Set initial geometry type mode from API response
                    if (d.geometry_type === "Point") {
                        setGeometriType("titik");
                    } else if (d.geometry_type === "LineString") {
                        setGeometriType("garis");
                    } else if (d.geometry_type === "MultiPolygon" || d.geometry_type === "Polygon") {
                        setGeometriType("area");
                    }

                    if (d.location_point?.coordinates) {
                        setLocationPointMarker(d.location_point.coordinates);
                    }

                    // Handle geometry - check all possible geometry fields
                    let geometryFeature: Feature | null = null;

                    if (d.location_point?.coordinates) {
                        setLocationPointMarker(d.location_point.coordinates);
                    }

                    // Handle geometry based on geometry_type from API
                    const features: Feature[] = [];
                    if (d.geometry_type === "Point" && d.location_point?.coordinates) {
                        features.push({
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "Point",
                                coordinates: d.location_point.coordinates,
                            },
                        });
                    } else if (d.geometry_type === "LineString" && d.location_line?.coordinates) {
                        features.push({
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: d.location_line.coordinates,
                            },
                        });
                    } else if ((d.geometry_type === "MultiPolygon" || d.geometry_type === "Polygon") && d.location_area?.coordinates) {
                        const multiPolygonCoords = d.location_area.coordinates;
                        // MultiPolygon coordinates are nested: [Polygon[Ring[Point]]]
                        if (multiPolygonCoords && multiPolygonCoords.length > 0) {
                            multiPolygonCoords.forEach((polygonCoords: any) => {
                                // If it's a MultiPolygon, polygonCoords is a 3-level array [Ring[Point]]
                                // If some APIs return Polygon directly, we handle accordingly
                                features.push({
                                    type: "Feature",
                                    properties: {},
                                    geometry: {
                                        type: "Polygon",
                                        coordinates: polygonCoords,
                                    },
                                });
                            });
                        }
                    }

                    if (features.length > 0) {
                        setSavedGeometry({
                            type: "FeatureCollection",
                            features: features,
                        });
                    }

                    // Load informasi pendukung
                    if (d.sketch) setExistingSketch(d.sketch);
                    if (d.pronounciation_audio) setExistingAudio(d.pronounciation_audio);
                    if (d.video) setExistingVideo(d.video);
                    if (d.support_document) setExistingDocs(d.support_document);
                }
            } catch (err) {
                console.error("Failed to fetch toponym:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toponymId, token]);

    useEffect(() => {
        if (!token) return;

        getRegions({ level: "PROVINCE", token })
            .then((result) => {
                if (!result.error && result.data) setProvinces(result.data);
            })
            .finally(() => setLoadingProvinces(false));

        getElements(token)
            .then((result) => {
                if (!result.error && result.data) setElements(result.data);
            })
            .finally(() => setLoadingElements(false));
    }, [token]);

    useEffect(() => {
        if (!provinceCode) {
            setRegencies([]);
            setRegencyCode("");
            setDistricts([]);
            setDistrictCode("");
            setVillages([]);
            setVillageCode("");
            return;
        }

        const selectedProvince = provinces.find((p) => p.code === provinceCode);
        if (!selectedProvince) return;

        setLoadingRegencies(true);
        getRegions({ level: "CITY", parent: selectedProvince.path, token })
            .then((result) => {
                if (!result.error && result.data) setRegencies(result.data);
            })
            .finally(() => setLoadingRegencies(false));
    }, [provinceCode, provinces, token]);

    useEffect(() => {
        if (!regencyCode) {
            setDistricts([]);
            setDistrictCode("");
            setVillages([]);
            setVillageCode("");
            return;
        }

        const selectedRegency = regencies.find((r) => r.code === regencyCode);
        if (!selectedRegency) return;

        setLoadingDistricts(true);
        getRegions({ level: "DISTRICT", parent: selectedRegency.path, token })
            .then((result) => {
                if (!result.error && result.data) setDistricts(result.data);
            })
            .finally(() => setLoadingDistricts(false));
    }, [regencyCode, regencies, token]);

    useEffect(() => {
        if (!districtCode) {
            setVillages([]);
            setVillageCode("");
            return;
        }

        const selectedDistrict = districts.find((d) => d.code === districtCode);
        if (!selectedDistrict) return;

        setLoadingVillages(true);
        getRegions({ level: "VILLAGE", parent: selectedDistrict.path, token })
            .then((result) => {
                if (!result.error && result.data) setVillages(result.data);
            })
            .finally(() => setLoadingVillages(false));
    }, [districtCode, districts, token]);

    // Reset drawn points when geometry type changes
    useEffect(() => {
        if (drawnPoints.length > 0) {
            setDrawnPoints([]);
            setHistoryStack([]);
        }
    }, [geometriType]);

    const getGeometry = (): { type: string; coordinates: any } | null => {
        // Filter features in savedGeometry that match current geometriType
        const matchingSaved = savedGeometry?.features.filter((f) => {
            if (geometriType === "titik") return f.geometry.type === "Point";
            if (geometriType === "garis") return f.geometry.type === "LineString";
            if (geometriType === "area") return f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon";
            return false;
        });

        if (matchingSaved && matchingSaved.length > 0) {
            if (geometriType === "titik") {
                // If multiple points, take the first one (or we could support MultiPoint if needed)
                return { type: "Point", coordinates: (matchingSaved[0].geometry as Point).coordinates };
            } else if (geometriType === "garis") {
                return { type: "LineString", coordinates: (matchingSaved[0].geometry as LineString).coordinates };
            } else if (geometriType === "area") {
                // Combine all polygons into a single MultiPolygon
                const allPolygons: any[] = [];
                matchingSaved.forEach((f) => {
                    if (f.geometry.type === "Polygon") {
                        allPolygons.push(f.geometry.coordinates);
                    } else if (f.geometry.type === "MultiPolygon") {
                        allPolygons.push(...(f.geometry as any).coordinates);
                    }
                });
                return { type: "MultiPolygon", coordinates: allPolygons };
            }
        }

        // Fallback to drawnPoints if nothing saved yet
        if (drawnPoints.length > 0) {
            if (geometriType === "titik") {
                return { type: "Point", coordinates: [drawnPoints[0][0], drawnPoints[0][1]] };
            } else if (geometriType === "garis" && drawnPoints.length >= 2) {
                return { type: "LineString", coordinates: drawnPoints };
            } else if (geometriType === "area" && drawnPoints.length >= 3) {
                return { type: "MultiPolygon", coordinates: [[[...drawnPoints, drawnPoints[0]]]] };
            }
        }
        return null;
    };

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

                // For titik mode, replace existing point (only one point allowed)
                if (geometriType === "titik") {
                    return {
                        type: "FeatureCollection",
                        features: [newFeature!],
                    };
                }

                // For other modes, filter and append
                const currentTypeFeatures = existingFeatures.filter((f) => {
                    if (geometriType === "garis") return f.geometry.type === "LineString";
                    if (geometriType === "area") return f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon";
                    return false;
                });

                return {
                    type: "FeatureCollection",
                    features: [...currentTypeFeatures, newFeature!],
                };
            });

            // For titik mode, also update the main location point marker so map center follows
            if (geometriType === "titik" && drawnPoints.length >= 1) {
                setLocationPointMarker(drawnPoints[0]);
            }

            setDrawnPoints([]);
            setHistoryStack([]);
            // Don't close edit mode automatically so user can add another area easily
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

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const MAX_SIZE = 3 * 1024 * 1024;
        const validFiles: { file: File; previewUrl: string }[] = [];
        for (const file of Array.from(files)) {
            if (file.size <= MAX_SIZE) validFiles.push({ file, previewUrl: URL.createObjectURL(file) });
        }
        if (validFiles.length > 0) setSelectedFiles((prev) => [...prev, ...validFiles]);
        e.target.value = "";
    };
    const handleRemovePhoto = (index: number) => {
        setSelectedFiles((prev) => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };
    const handleRemoveExistingPhoto = (index: number) => {
        setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    // Informasi Pendukung handlers
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
        setExistingSketch(null);
        e.target.value = "";
    };
    const handleRemoveSketsa = () => {
        if (sketsaLokasi) URL.revokeObjectURL(sketsaLokasi.previewUrl);
        setSketsaLokasi(null);
    };
    const handleRemoveExistingSketch = () => {
        setExistingSketch(null);
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
        setExistingAudio(null);
        e.target.value = "";
    };
    const handleRemoveRekamanSuara = () => {
        if (rekamanSuara) URL.revokeObjectURL(rekamanSuara.previewUrl);
        setRekamanSuara(null);
    };
    const handleRemoveExistingAudio = () => {
        setExistingAudio(null);
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
        setExistingVideo(null);
        e.target.value = "";
    };
    const handleRemoveRekamanAudioVisual = () => {
        if (rekamanAudioVisual) URL.revokeObjectURL(rekamanAudioVisual.previewUrl);
        setRekamanAudioVisual(null);
    };
    const handleRemoveExistingVideo = () => {
        setExistingVideo(null);
    };

    const handleDokumenSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const MAX_SIZE = 10 * 1024 * 1024;
        const validFiles: { file: File; previewUrl: string }[] = [];
        for (const file of Array.from(files)) {
            if (file.size <= MAX_SIZE) {
                validFiles.push({ file, previewUrl: URL.createObjectURL(file) });
            }
        }
        if (validFiles.length > 0) {
            setDokumenPendukung((prev) => [...prev, ...validFiles]);
            setExistingDocs(null);
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
        setExistingDocs(null);
    };

    const uploadPhotos = async (): Promise<{ url: string; filename: string }[]> => {
        const uploaded: { url: string; filename: string }[] = [];
        for (const { file } of selectedFiles) {
            try {
                const result = await uploadImage(file, token!);
                if (!result.error && result.data) {
                    uploaded.push({
                        url: result.data.url,
                        filename: file.name,
                    });
                }
            } catch (err) {
                console.error(`Failed to upload ${file.name}:`, err);
            }
        }
        return uploaded;
    };

    const allPhotos = [...existingPhotos.map((p) => ({ url: p.url, name: p.filename })), ...selectedFiles.map((f) => ({ url: f.previewUrl, name: f.file.name }))];

    const handlePrevImage = useCallback(
        (e?: React.MouseEvent | KeyboardEvent) => {
            e?.stopPropagation();
            const currentIndex = allPhotos.findIndex((p) => p.url === previewImage?.url);
            if (currentIndex > 0) {
                setPreviewImage(allPhotos[currentIndex - 1]);
            }
        },
        [previewImage, allPhotos],
    );

    const handleNextImage = useCallback(
        (e?: React.MouseEvent | KeyboardEvent) => {
            e?.stopPropagation();
            const currentIndex = allPhotos.findIndex((p) => p.url === previewImage?.url);
            if (currentIndex < allPhotos.length - 1) {
                setPreviewImage(allPhotos[currentIndex + 1]);
            }
        },
        [previewImage, allPhotos],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const geometry = getGeometry();
        if (!geometry) {
            alert("Silakan gambar lokasi terlebih dahulu");
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedPhotos: { url: string; filename: string }[] = [];
            if (selectedFiles.length > 0) uploadedPhotos = await uploadPhotos();
            const allPhotos = [...existingPhotos, ...uploadedPhotos];

            // Upload sketsa lokasi if any new file
            let uploadedSketch: string | null = existingSketch;
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
            let uploadedAudio: string | null = existingAudio;
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
            let uploadedVideo: string | null = existingVideo;
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
            let uploadedDocs: string | null = existingDocs;
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

            const payload: Record<string, unknown> = {
                local_name: localName,
                generic_element: genericElement,
                specific_element: specificElement,
            };

            // Set geometry field and specific location fields
            if (geometry.type === "Point") {
                payload.location_point = geometry;
            } else if (geometry.type === "LineString") {
                payload.location_line = geometry;
            } else if (geometry.type === "MultiPolygon") {
                payload.location_area = geometry;
            }
            payload.geometry = geometry;

            if (mapName) payload.map_name = mapName;
            if (otherName) payload.other_name = otherName;
            if (languageOrigin) payload.language_origin = languageOrigin;
            if (nameMeaning) payload.name_meaning = nameMeaning;
            if (nameHistory) payload.name_history = nameHistory;
            if (pronounciation) payload.pronounciation = pronounciation;
            if (spelling) payload.spelling = spelling;
            if (elementCode) payload.element_id = elementCode;
            if (provinceCode) payload.province_code = provinceCode;
            if (regencyCode) payload.regency_code = regencyCode;
            if (districtCode) payload.district_code = districtCode;
            if (villageCode) payload.village_code = villageCode;
            if (surveyAt) payload.survey_at = surveyAt;
            if (allPhotos.length > 0) payload.photos = allPhotos;
            if (uploadedSketch) payload.sketch = uploadedSketch;
            if (uploadedAudio) payload.pronounciation_audio_url = uploadedAudio;
            if (uploadedVideo) payload.video_url = uploadedVideo;
            if (uploadedDocs) payload.support_document_url = uploadedDocs;

            const result = await updateToponym(toponymId!, payload, token!);
            if (!result.error) {
                alert("Toponim berhasil diperbarui!");
                router.push("/survey?tab=my-data");
            } else {
                alert(`Gagal: ${result.message}`);
            }
        } catch (err) {
            console.error("Failed to submit:", err);
            alert("Terjadi kesalahan saat menyimpan");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading)
        return (
            <SurveyorLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="ml-2">Memuat data...</p>
                </div>
            </SurveyorLayout>
        );

    return (
        <SurveyorLayout>
            <div className="flex h-full pt-20">
                {/* Left Side - Form Container */}
                <div
                    className={cn(
                        "border-r relative group/form h-full flex flex-col",
                        isMobile ? "w-full" : "",
                        !isResizing && "transition-[width] duration-300",
                    )}
                    style={{
                        width: !isMobile ? (typeof formWidth === "number" ? `${formWidth}px` : formWidth) : undefined,
                        flex: !isMobile ? "none" : undefined,
                    }}
                >
                    {/* Resize Handle */}
                    {!isMobile && (
                        <div
                            className="absolute top-0 bg-white -right-3 p-2 h-full cursor-col-resize z-50 transition"
                            onMouseDown={startResizing}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-300 rounded-full transition-colors group-hover:bg-white" />
                        </div>
                    )}

                    {/* Scrollable Content Wrapper */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/survey?tab=my-data">
                                <Button size="icon-sm" variant="ghost">
                                    <ChevronLeft />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-bold">Edit Data Toponim</h1>
                        </div>
                        <div className="space-y-4">
                            <Collapsible open={openSpasial} onOpenChange={setOpenSpasial}>
                                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                    <ChevronDown className={`transition-transform ${openSpasial ? "" : "-rotate-90"}`} size={20} />
                                    Penggambaran Lokasi
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                    {!isEditingDraft ? (
                                        <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-600" onClick={() => {
                                            // Auto-select geometry type based on current saved data
                                            if (savedGeometry?.features.length) {
                                                const feature = savedGeometry.features[0];
                                                if (feature.geometry.type === "Point") setGeometriType("titik");
                                                else if (feature.geometry.type === "LineString") setGeometriType("garis");
                                                else if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") setGeometriType("area");
                                            }
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
                                                <Button variant="outline" className="border-gray-400 text-gray-600 hover:bg-gray-50" onClick={() => {
                                                    setDrawnPoints([]);
                                                    setHistoryStack([]);
                                                    setIsEditingDraft(false);
                                                }}>
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
                                                    const coords = geom.coordinates as number[];
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
                                                    const coords = geom.coordinates as number[][];
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
                                                    const coords = (geom.coordinates as number[][][])[0];
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
                            <Collapsible open={openAtribut} onOpenChange={setOpenAtribut}>
                                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                    <ChevronDown className={`transition-transform ${openAtribut ? "" : "-rotate-90"}`} size={20} />
                                    Informasi Toponim
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>
                                                Elemen Generik <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={genericElement} onChange={(e) => setGenericElement(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Elemen Spesifik <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={specificElement} onChange={(e) => setSpecificElement(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Nama Lokal <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={localName} onChange={(e) => setLocalName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Nama Peta <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={mapName} onChange={(e) => setMapName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Nama Lain <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={otherName} onChange={(e) => setOtherName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Asal Bahasa <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={languageOrigin} onChange={(e) => setLanguageOrigin(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Arti Nama <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={nameMeaning} onChange={(e) => setNameMeaning(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Sejarah Nama <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={nameHistory} onChange={(e) => setNameHistory(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Pelafalan <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={pronounciation} onChange={(e) => setPronounciation(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Ejaan <span className="text-red-500">*</span>
                                            </Label>
                                            <Input value={spelling} onChange={(e) => setSpelling(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Elemen <span className="text-red-500">*</span>
                                            </Label>
                                            <Popover open={openElementCombobox} onOpenChange={setOpenElementCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingElements}>
                                                        {loadingElements ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                Memuat...
                                                            </>
                                                        ) : elementCode ? (
                                                            elements.find((e) => e.code === elementCode)?.name
                                                        ) : (
                                                            "Pilih Elemen"
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Cari elemen..." />
                                                        <CommandList>
                                                            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                            <CommandGroup>
                                                                {elements.map((el) => (
                                                                    <CommandItem
                                                                        key={el.code}
                                                                        value={el.name}
                                                                        onSelect={() => {
                                                                            setElementCode(el.code);
                                                                            setOpenElementCombobox(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", elementCode === el.code ? "opacity-100" : "opacity-0")} />
                                                                        {el.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Provinsi <span className="text-red-500">*</span>
                                            </Label>
                                            <Popover open={openProvincePopover} onOpenChange={setOpenProvincePopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingProvinces}>
                                                        {loadingProvinces ? "Memuat..." : provinceCode ? provinces.find((p) => p.code === provinceCode)?.name : "Pilih Provinsi"}
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
                                                                            setProvinceCode(p.code);
                                                                            setOpenProvincePopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", provinceCode === p.code ? "opacity-100" : "opacity-0")} />
                                                                        {p.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Kabupaten/Kota <span className="text-red-500">*</span>
                                            </Label>
                                            <Popover open={openRegencyPopover} onOpenChange={setOpenRegencyPopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingRegencies || !provinceCode}>
                                                        {loadingRegencies ? "Memuat..." : regencyCode ? regencies.find((r) => r.code === regencyCode)?.name : provinceCode ? "Pilih Kabupaten/Kota" : "Pilih Provinsi dulu"}
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
                                                                            setRegencyCode(r.code);
                                                                            setOpenRegencyPopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", regencyCode === r.code ? "opacity-100" : "opacity-0")} />
                                                                        {r.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Kecamatan <span className="text-red-500">*</span>
                                            </Label>
                                            <Popover open={openDistrictPopover} onOpenChange={setOpenDistrictPopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingDistricts || !regencyCode}>
                                                        {loadingDistricts ? "Memuat..." : districtCode ? districts.find((d) => d.code === districtCode)?.name : regencyCode ? "Pilih Kecamatan" : "Pilih Kab/Kota dulu"}
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
                                                                            setDistrictCode(d.code);
                                                                            setOpenDistrictPopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", districtCode === d.code ? "opacity-100" : "opacity-0")} />
                                                                        {d.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Desa/Kelurahan</Label>
                                            <Popover open={openVillagePopover} onOpenChange={setOpenVillagePopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between font-normal" disabled={loadingVillages || !districtCode}>
                                                        {loadingVillages ? "Memuat..." : villageCode ? villages.find((v) => v.code === villageCode)?.name : districtCode ? "Pilih Desa/Kelurahan" : "Pilih Kecamatan dulu"}
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
                                                                            setVillageCode(v.code);
                                                                            setOpenVillagePopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", villageCode === v.code ? "opacity-100" : "opacity-0")} />
                                                                        {v.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal Survei</Label>
                                            <Input type="date" value={surveyAt} onChange={(e) => setSurveyAt(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Foto Pendukung (Maks 3MB)</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" id="photo-upload" />
                                                <label htmlFor="photo-upload" className="flex flex-col items-center cursor-pointer">
                                                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500">Klik untuk pilih foto</span>
                                                </label>
                                            </div>
                                            {existingPhotos.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mt-3">
                                                    {existingPhotos.map((photo, i) => (
                                                        <div key={`existing-${i}`} className="relative group cursor-pointer" onClick={() => setPreviewImage({ url: photo.url, name: photo.filename })}>
                                                            <img src={photo.url} alt={photo.filename} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                                <Maximize2 className="text-white h-6 w-6" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveExistingPhoto(i);
                                                                }}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedFiles.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mt-3">
                                                    {selectedFiles.map((photo, i) => (
                                                        <div key={i} className="relative group cursor-pointer" onClick={() => setPreviewImage({ url: photo.previewUrl, name: photo.file.name })}>
                                                            <img src={photo.previewUrl} alt={photo.file.name} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                                <Maximize2 className="text-white h-6 w-6" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemovePhoto(i);
                                                                }}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <PhotoPreviewModal
                                            open={!!previewImage}
                                            onOpenChange={(open) => !open && setPreviewImage(null)}
                                            previewImage={previewImage}
                                            allPhotos={allPhotos}
                                            onPrev={handlePrevImage}
                                            onNext={handleNextImage}
                                        />
                                    </form>
                                </CollapsibleContent>
                            </Collapsible>

                            {/* Accordion Informasi Pendukung */}
                            <Collapsible open={openInformasiPendukung} onOpenChange={setOpenInformasiPendukung}>
                                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                    <ChevronDown className={`transition-transform ${openInformasiPendukung ? "" : "-rotate-90"}`} size={20} />
                                    Informasi Pendukung
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                    {/* Sketsa Lokasi */}
                                    <div className="space-y-2">
                                        <Label>Sketsa Lokasi (Maksimal 5MB)</Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleSketsaSelect} 
                                                className="hidden" 
                                                id="sketsa-upload" 
                                            />
                                            <label htmlFor="sketsa-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                <FileImage className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Klik untuk pilih sketsa</span>
                                                <span className="text-xs text-gray-400 mt-1">Hanya 1 file sketsa</span>
                                            </label>
                                        </div>

                                        {/* Existing sketch */}
                                        {existingSketch && !sketsaLokasi && (
                                            <div className="mt-3">
                                                <div 
                                                    className="relative group cursor-pointer inline-block" 
                                                    onClick={() => setPreviewImage({ url: existingSketch, name: "Sketsa Lokasi" })}
                                                >
                                                    <img 
                                                        src={existingSketch} 
                                                        alt="Sketsa Lokasi" 
                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                        <Maximize2 className="text-white h-6 w-6" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveExistingSketch();
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* New sketch thumbnail */}
                                        {sketsaLokasi && (
                                            <div className="mt-3">
                                                <div 
                                                    className="relative group cursor-pointer inline-block" 
                                                    onClick={() => setPreviewImage({ url: sketsaLokasi.previewUrl, name: sketsaLokasi.file.name })}
                                                >
                                                    <img 
                                                        src={sketsaLokasi.previewUrl} 
                                                        alt={sketsaLokasi.file.name} 
                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                        <Maximize2 className="text-white h-6 w-6" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveSketsa();
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mt-1 max-w-24">{sketsaLokasi.file.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rekaman Suara Pengucapan */}
                                    <div className="space-y-2">
                                        <Label>Rekaman Suara Pengucapan (Maksimal 10MB)</Label>
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
                                                <span className="text-sm text-gray-500">Klik untuk pilih rekaman suara</span>
                                                <span className="text-xs text-gray-400 mt-1">Format: MP3, WAV, dll</span>
                                            </label>
                                        </div>

                                        {/* Existing audio displayed outside the field */}
                                        {existingAudio && !rekamanSuara && (
                                            <div className="mt-3">
                                                <div className="relative group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full">
                                                    <div className="flex-1 min-w-0">
                                                        <audio controls className="w-full h-8">
                                                            <source src={existingAudio} />
                                                        </audio>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveExistingAudio}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* New audio displayed outside the field */}
                                        {rekamanSuara && (
                                            <div className="mt-3">
                                                <div className="relative group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate mb-2">{rekamanSuara.file.name}</p>
                                                        <audio controls className="w-full h-8">
                                                            <source src={rekamanSuara.previewUrl} type={rekamanSuara.file.type} />
                                                        </audio>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveRekamanSuara}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rekaman Audio Visual */}
                                    <div className="space-y-2">
                                        <Label>Rekaman Audio Visual (Maksimal 50MB)</Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <input 
                                                type="file" 
                                                accept="video/*,audio/*" 
                                                onChange={handleRekamanAudioVisualSelect} 
                                                className="hidden" 
                                                id="video-upload" 
                                            />
                                            <label htmlFor="video-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                <Video className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Klik untuk pilih rekaman audio visual</span>
                                                <span className="text-xs text-gray-400 mt-1">Format: MP4, AVI, MOV, dll</span>
                                            </label>
                                        </div>

                                        {/* Existing video displayed outside the field */}
                                        {existingVideo && !rekamanAudioVisual && (
                                            <div className="mt-3">
                                                <div className="relative group w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                    <video controls className="w-full h-48 bg-black">
                                                        <source src={existingVideo} />
                                                    </video>

                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveExistingVideo}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* New video displayed outside the field */}
                                        {rekamanAudioVisual && (
                                            <div className="mt-3">
                                                <div className="relative group w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                    <video controls className="w-full h-48 bg-black">
                                                        <source src={rekamanAudioVisual.previewUrl} type={rekamanAudioVisual.file.type} />
                                                    </video>
                                                    <div className="flex items-center justify-between p-2">
                                                        <span className="text-sm text-gray-600 truncate">{rekamanAudioVisual.file.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveRekamanAudioVisual}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dokumen Pendukung */}
                                    <div className="space-y-2">
                                        <Label>Dokumen Pendukung (Maksimal 10MB)</Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <input 
                                                type="file" 
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                                                onChange={handleDokumenSelect} 
                                                className="hidden" 
                                                id="doc-upload"
                                                multiple 
                                            />
                                            <label htmlFor="doc-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Klik untuk upload dokumen</span>
                                                <span className="text-xs text-gray-400 mt-1">Format: PDF, DOC, XLS, dll</span>
                                            </label>
                                        </div>
                                        
                                        {/* Existing docs */}
                                        {existingDocs && dokumenPendukung.length === 0 && (
                                            <div className="space-y-2 mt-3">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => window.open(existingDocs, '_blank')}
                                                            title="Preview dokumen"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={handleRemoveExistingDocs}
                                                            title="Hapus dokumen"
                                                        >
                                                            <X size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* New documents list */}
                                        {dokumenPendukung.length > 0 && (
                                            <div className="space-y-2 mt-3">
                                                {dokumenPendukung.map((doc, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                            <span className="text-sm truncate">{doc.file.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => window.open(doc.previewUrl, '_blank')}
                                                                title="Preview dokumen"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRemoveDokumen(index)}
                                                                title="Hapus dokumen"
                                                            >
                                                                <X size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6">
                                <Link href="/survey?tab=my-data" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">
                                        Batal
                                    </Button>
                                </Link>
                                <Button 
                                    type="button" 
                                    className="flex-1 bg-green-600 hover:bg-green-700" 
                                    disabled={isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan Perubahan"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
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
                        isEditMode={true}
                    />
                </div>
            </div>
        </SurveyorLayout>
    );
};

const Page = () => (
    <Suspense
        fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }
    >
        <EditToponimContent />
    </Suspense>
);
export default Page;
