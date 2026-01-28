"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, ChevronLeft, ChevronRight, Layers, Minus, Plus, RotateCcw, Save, CircleDot, Trash2, Loader2, Check, ChevronsUpDown, Camera, X, Maximize2 } from "lucide-react";
import SurveyorLayout from "@/layouts/SurveryorLayout";
import Link from "next/link";
import { Map, Source, Layer, Marker, type MapRef, type ViewState, type MapLayerMouseEvent } from "@vis.gl/react-maplibre";
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FeatureCollection, Feature, Point, LineString, Polygon } from "geojson";
import { IoLocationSharp } from "react-icons/io5";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { getRegions } from "@/api/region";
import { getElements } from "@/api/classification";
import { uploadImage } from "@/api/media";
import { createToponym } from "@/api/toponym";
import PhotoPreviewModal from "@/components/PhotoPreviewModal";

// Province type from API
interface Province {
    id: number;
    name: string;
    code: string;
    level: string;
    path: string;
}

// Region type for regency/district
interface Region {
    id: number;
    name: string;
    code: string;
    level: string;
    parent_id: number;
    path: string;
}

// Element type from API
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
}

const PreviewMap: React.FC<PreviewMapProps> = ({ isEditing, geometriType, snappingEnabled, drawnPoints, onPointsChange, savedGeometry, onClearSaved, onSave, onUndo }) => {
    const mapRef = useRef<MapRef>(null);
    const [showLayerMenu, setShowLayerMenu] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null);

    const initialViewState: ViewState = {
        longitude: big_office_coord.longitude,
        latitude: big_office_coord.latitude,
        zoom: 4.55,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0 },
    };

    const [viewState, setViewState] = useState(initialViewState);
    const [mapStyle, setMapStyle] = useState(MapStyles[0]);

    const handleZoomIn = () => {
        if (mapRef.current) {
            const currentZoom = viewState.zoom;
            mapRef.current.flyTo({ zoom: Math.min(currentZoom + 1, 18), duration: 300 });
        }
    };

    const handleZoomOut = () => {
        if (mapRef.current) {
            const currentZoom = viewState.zoom;
            mapRef.current.flyTo({ zoom: Math.max(currentZoom - 1, 1), duration: 300 });
        }
    };

    // Snapping logic - find nearest point within threshold
    const snapToNearestPoint = useCallback(
        (lng: number, lat: number): [number, number] => {
            if (!snappingEnabled || drawnPoints.length === 0) {
                return [lng, lat];
            }

            const threshold = 0.001; // ~100m at equator
            let nearestPoint: [number, number] = [lng, lat];
            let minDistance = Infinity;

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

    // Handle map click for drawing
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

                    // Line/Polygon mode - add point
                    onPointsChange([...drawnPoints, snappedPoint]);
                }, 200); // 200ms delay to detect double-click
            } else {
                // Point mode - immediate response
                const { lng, lat } = e.lngLat;
                const snappedPoint = snapToNearestPoint(lng, lat);
                onPointsChange([snappedPoint]);
            }
        },
        [isEditing, geometriType, drawnPoints, onPointsChange, snapToNearestPoint, onClearSaved],
    );

    // Handle double-click to finish line/polygon
    const handleMapDblClick = useCallback(
        (e: MapLayerMouseEvent) => {
            if (!isEditing || geometriType === "titik") return;
            e.preventDefault();

            // Cancel pending click
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }

            // Finish drawing - trigger save with minimum point validation
            const minPoints = geometriType === "garis" ? 2 : 3; // Line needs 2, Polygon needs 3
            if (drawnPoints.length >= minPoints) {
                onSave();
            }
        },
        [isEditing, geometriType, drawnPoints, onSave],
    );

    // Handle mouse move for cursor tracking
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
                {/* Saved Geometry Layer */}
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
                        {/* Render saved points as Markers with location icon */}
                        {savedGeometry.features
                            .filter((f) => f.geometry.type === "Point")
                            .map((feature, idx) => {
                                const coords = (feature.geometry as Point).coordinates as [number, number];
                                return (
                                    <Marker key={`saved-point-${idx}`} longitude={coords[0]} latitude={coords[1]} anchor="bottom">
                                        <IoLocationSharp className="text-3xl text-blue-600 drop-shadow-lg" />
                                    </Marker>
                                );
                            })}
                    </>
                )}

                {/* Current Drawing Layer */}
                {isEditing && currentDrawingGeoJson.features.length > 0 && (
                    <>
                        <Source id="current-drawing" type="geojson" data={currentDrawingGeoJson}>
                            <Layer
                                id="drawing-polygon-fill"
                                type="fill"
                                filter={["==", ["geometry-type"], "Polygon"]}
                                paint={{
                                    "fill-color": "#10b981",
                                    "fill-opacity": 0.2,
                                }}
                            />
                            <Layer
                                id="drawing-line"
                                type="line"
                                filter={["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "Polygon"]]}
                                paint={{
                                    "line-color": "#10b981",
                                    "line-width": 2,
                                    "line-dasharray": [2, 2],
                                }}
                            />
                            {/* Circle points only for line/polygon modes */}
                            {geometriType !== "titik" && (
                                <Layer
                                    id="drawing-points"
                                    type="circle"
                                    filter={["==", ["geometry-type"], "Point"]}
                                    paint={{
                                        "circle-radius": 6,
                                        "circle-color": "#10b981",
                                        "circle-stroke-width": 2,
                                        "circle-stroke-color": "#ffffff",
                                    }}
                                />
                            )}
                        </Source>
                        {/* Marker icon for point mode */}
                        {geometriType === "titik" &&
                            drawnPoints.map((point, idx) => (
                                <Marker key={`drawing-point-${idx}`} longitude={point[0]} latitude={point[1]} anchor="bottom">
                                    <IoLocationSharp className="text-3xl text-blue-600 drop-shadow-lg opacity-90" />
                                </Marker>
                            ))}
                    </>
                )}
            </Map>

            {/* Drawing Mode Indicator */}
            {isEditing && (
                <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <CircleDot size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">
                        Mode: {geometriType === "titik" ? "Titik" : geometriType === "garis" ? "Garis" : "Area"}
                        {snappingEnabled && " (Snapping ON)"}
                    </span>
                </div>
            )}

            {/* Instructions */}
            {isEditing && (
                <div className="absolute bottom-20 left-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-[200px]">
                    {geometriType === "titik" ? <p>Klik pada peta untuk menempatkan titik</p> : <p>Klik untuk menambah titik, double-click untuk selesai</p>}
                </div>
            )}

            {/* Map Controls - Bottom Right */}
            <div className="absolute bottom-12 right-4 flex flex-col gap-2">
                {/* Layer Toggle */}
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

                {/* Zoom Controls */}
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

const Page = () => {
    const router = useRouter();
    const { token } = useAuth();
    const [openSpasial, setOpenSpasial] = useState(true);
    const [openAtribut, setOpenAtribut] = useState(true);

    // Spasial/Geometri
    const [isEditingDraft, setIsEditingDraft] = useState(false);
    const [geometriType, setGeometriType] = useState<"titik" | "garis" | "area">("titik");
    const [fiturSnapping, setFiturSnapping] = useState(false);

    // Drawing state
    const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
    const [savedGeometry, setSavedGeometry] = useState<FeatureCollection | null>(null);
    const [historyStack, setHistoryStack] = useState<[number, number][][]>([]);

    // Form Atribut - Basic Info
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

    // Region codes
    const [provinceCode, setProvinceCode] = useState("");
    const [regencyCode, setRegencyCode] = useState("");
    const [districtCode, setDistrictCode] = useState("");
    const [villageCode, setVillageCode] = useState("");

    // API Data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [regencies, setRegencies] = useState<Region[]>([]);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [villages, setVillages] = useState<Region[]>([]);
    const [loadingVillages, setLoadingVillages] = useState(false);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isMobile } = useIsMobile();

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

    // Selected files for upload (stored locally until submit)
    const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl: string }[]>([]);

    // Photo select handler (store locally, don't upload yet)
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const sizeInMB = 3;
        const MAX_SIZE = sizeInMB * 1024 * 1024;
        const validFiles: { file: File; previewUrl: string }[] = [];
        const rejectedFiles: string[] = [];

        for (const file of Array.from(files)) {
            if (file.size > MAX_SIZE) {
                rejectedFiles.push(file.name);
            } else {
                validFiles.push({
                    file,
                    previewUrl: URL.createObjectURL(file),
                });
            }
        }

        if (rejectedFiles.length > 0) {
            alert(`File berikut melebihi ukuran maksimal ${sizeInMB}MB:\n${rejectedFiles.join("\n")}`);
        }

        if (validFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }

        // Reset input
        e.target.value = "";
    };

    // Remove selected photo
    const handleRemovePhoto = (index: number) => {
        setSelectedFiles((prev) => {
            // Revoke object URL to free memory
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Upload all photos (called during submit)
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

    // Elements data
    const [elements, setElements] = useState<Element[]>([]);
    const [loadingElements, setLoadingElements] = useState(true);
    const [openElementCombobox, setOpenElementCombobox] = useState(false);
    const [openProvincePopover, setOpenProvincePopover] = useState(false);
    const [openRegencyPopover, setOpenRegencyPopover] = useState(false);
    const [openDistrictPopover, setOpenDistrictPopover] = useState(false);
    const [openVillagePopover, setOpenVillagePopover] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

    // Fetch Initial Data (Provinces and Elements)
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

    // Fetch Regencies
    useEffect(() => {
        if (!provinceCode || !token) {
            if (!provinceCode) {
                setRegencies([]);
                setRegencyCode("");
                setDistricts([]);
                setDistrictCode("");
                setVillages([]);
                setVillageCode("");
            }
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

    // Fetch Districts
    useEffect(() => {
        if (!regencyCode || !token) {
            if (!regencyCode) {
                setDistricts([]);
                setDistrictCode("");
                setVillages([]);
                setVillageCode("");
            }
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

    // Fetch Villages
    useEffect(() => {
        if (!districtCode || !token) {
            if (!districtCode) {
                setVillages([]);
                setVillageCode("");
            }
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

    const allPhotos = selectedFiles.map((f) => ({ url: f.previewUrl, name: f.file.name }));

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



    // Reset drawn points when geometry type changes
    useEffect(() => {
        if (drawnPoints.length > 0) {
            setDrawnPoints([]);
            setHistoryStack([]);
        }
    }, [geometriType]);

    // Get geometry from saved geometry or drawn points
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

    // Handle points change with history
    const handlePointsChange = useCallback(
        (points: [number, number][]) => {
            setHistoryStack((prev) => [...prev, drawnPoints]);
            setDrawnPoints(points);
        },
        [drawnPoints],
    );

    // Save geometry
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

            setDrawnPoints([]);
            setHistoryStack([]);
        }
    }, [drawnPoints, geometriType]);

    // Undo last point
    const handleUndoGeometry = useCallback(() => {
        if (historyStack.length > 0) {
            const previousPoints = historyStack[historyStack.length - 1];
            setDrawnPoints(previousPoints);
            setHistoryStack((prev) => prev.slice(0, -1));
        } else {
            setDrawnPoints([]);
        }
    }, [historyStack]);

    // Clear all drawing
    const handleClearGeometry = useCallback(() => {
        setDrawnPoints([]);
        setSavedGeometry(null);
        setHistoryStack([]);
    }, []);

    // Clear only saved geometry (for when starting new drawing)
    const handleClearSavedGeometry = useCallback(() => {
        setSavedGeometry(null);
    }, []);

    // Submit toponym
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const geometry = getGeometry();
        if (!geometry) {
            alert("Silakan gambar lokasi titik terlebih dahulu");
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload photos first if any
            let uploadedPhotos: { url: string; filename: string }[] = [];
            if (selectedFiles.length > 0) {
                uploadedPhotos = await uploadPhotos();
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

            // Optional fields
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
            if (uploadedPhotos.length > 0) payload.photos = uploadedPhotos;

            const result = await createToponym(payload, token!);

            if (!result.error) {
                alert("Toponim berhasil disimpan!");
                router.push("/survey?tab=my-data");
            } else {
                alert(`Gagal menyimpan toponim: ${result.message}`);
            }
        } catch (err) {
            console.error("Failed to submit:", err);
            alert("Terjadi kesalahan saat menyimpan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SurveyorLayout>
            <div className="flex h-full pt-20">
                {/* Left Side - Form */}
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
                            <h1 className="text-xl font-bold">Tambah Data Toponim</h1>
                        </div>

                        <div className="space-y-4">
                            {/* Penggambaran Spasial/Geometri */}
                            <Collapsible open={openSpasial} onOpenChange={setOpenSpasial}>
                                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                    <ChevronDown className={`transition-transform ${openSpasial ? "" : "-rotate-90"}`} size={20} />
                                    Penggambaran Lokasi
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                    {!isEditingDraft ? (
                                        <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsEditingDraft(true)}>
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
                                                <Checkbox id="snapping" checked={fiturSnapping} onCheckedChange={(checked) => setFiturSnapping(checked as boolean)} />
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
                                                <Button
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    onClick={() => {
                                                        handleSaveGeometry();
                                                        setIsEditingDraft(false);
                                                    }}
                                                >
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

                                            {/* Display coordinates */}
                                            {(drawnPoints.length > 0 || savedGeometry) && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                    <Label className="text-sm font-medium mb-2 block">Koordinat Titik</Label>
                                                    {drawnPoints.length > 0 && (
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
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Show saved coordinates when not editing */}
                                    {!isEditingDraft && savedGeometry && savedGeometry.features.length > 0 && (
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
                                                    // Exclude the last point since it's a duplicate of the first (closing point)
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

                            {/* Pengisian Atribut */}
                            <Collapsible open={openAtribut} onOpenChange={setOpenAtribut}>
                                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg">
                                    <ChevronDown className={`transition-transform ${openAtribut ? "" : "-rotate-90"}`} size={20} />
                                    Informasi Toponim
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 ml-6 space-y-4">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="generic-element">
                                                Elemen Generik <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="generic-element" placeholder="Contoh: Gunung" value={genericElement} onChange={(e) => setGenericElement(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="specific-element">
                                                Elemen Spesifik <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="specific-element" placeholder="Contoh: Merapi" value={specificElement} onChange={(e) => setSpecificElement(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="local-name">
                                                Nama Lokal <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="local-name" placeholder="Contoh: Gunung Merapi" value={localName} onChange={(e) => setLocalName(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="map-name">
                                                Nama Peta <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="map-name" placeholder="Contoh: Gunung Merapi" value={mapName} onChange={(e) => setMapName(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="other-name">
                                                Nama Lain <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="other-name" placeholder="Contoh: Mt. Merapi" value={otherName} onChange={(e) => setOtherName(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="language-origin">
                                                Asal Bahasa <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="language-origin" placeholder="Contoh: Jawa" value={languageOrigin} onChange={(e) => setLanguageOrigin(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name-meaning">
                                                Arti Nama <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="name-meaning" placeholder="Contoh: Gunung berapi" value={nameMeaning} onChange={(e) => setNameMeaning(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name-history">
                                                Sejarah Nama <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="name-history" placeholder="Contoh: Digunakan sejak abad ke-15" value={nameHistory} onChange={(e) => setNameHistory(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pronounciation">
                                                Pelafalan <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="pronounciation" placeholder="Contoh: Gu-nung Me-ra-pi" value={pronounciation} onChange={(e) => setPronounciation(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="spelling">
                                                Ejaan <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="spelling" placeholder="Contoh: Gunung Merapi" value={spelling} onChange={(e) => setSpelling(e.target.value)} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                Elemen <span className="text-red-500">*</span>
                                            </Label>
                                            <input type="hidden" value={elementCode} required />
                                            <Popover open={openElementCombobox} onOpenChange={setOpenElementCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" aria-expanded={openElementCombobox} className="w-full justify-between font-normal" disabled={loadingElements}>
                                                        {loadingElements ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                <span>Memuat...</span>
                                                            </div>
                                                        ) : elementCode ? (
                                                            elements.find((e) => e.code === elementCode)?.name
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
                                                                            setElementCode(element.code);
                                                                            setOpenElementCombobox(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", elementCode === element.code ? "opacity-100" : "opacity-0")} />
                                                                        {element.name}
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
                                            <input type="hidden" value={provinceCode} required />
                                            <Popover open={openProvincePopover} onOpenChange={setOpenProvincePopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" aria-expanded={openProvincePopover} className="w-full justify-between font-normal" disabled={loadingProvinces}>
                                                        {loadingProvinces ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                <span>Memuat...</span>
                                                            </div>
                                                        ) : provinceCode ? (
                                                            provinces.find((p) => p.code === provinceCode)?.name
                                                        ) : (
                                                            "Pilih Provinsi"
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Cari provinsi..." />
                                                        <CommandList>
                                                            <CommandEmpty>Provinsi tidak ditemukan.</CommandEmpty>
                                                            <CommandGroup>
                                                                {provinces.map((province) => (
                                                                    <CommandItem
                                                                        key={province.code}
                                                                        value={province.name}
                                                                        onSelect={() => {
                                                                            setProvinceCode(province.code);
                                                                            setOpenProvincePopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", provinceCode === province.code ? "opacity-100" : "opacity-0")} />
                                                                        {province.name}
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
                                            <input type="hidden" value={regencyCode} required />
                                            <Popover open={openRegencyPopover} onOpenChange={setOpenRegencyPopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" aria-expanded={openRegencyPopover} className="w-full justify-between font-normal" disabled={loadingRegencies || !provinceCode}>
                                                        {loadingRegencies ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                <span>Memuat...</span>
                                                            </div>
                                                        ) : regencyCode ? (
                                                            regencies.find((r) => r.code === regencyCode)?.name
                                                        ) : provinceCode ? (
                                                            "Pilih Kabupaten/Kota"
                                                        ) : (
                                                            "Pilih Provinsi terlebih dahulu"
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Cari kabupaten/kota..." />
                                                        <CommandList>
                                                            <CommandEmpty>Kabupaten/Kota tidak ditemukan.</CommandEmpty>
                                                            <CommandGroup>
                                                                {regencies.map((regency) => (
                                                                    <CommandItem
                                                                        key={regency.code}
                                                                        value={regency.name}
                                                                        onSelect={() => {
                                                                            setRegencyCode(regency.code);
                                                                            setOpenRegencyPopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", regencyCode === regency.code ? "opacity-100" : "opacity-0")} />
                                                                        {regency.name}
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
                                            <input type="hidden" value={districtCode} required />
                                            <Popover open={openDistrictPopover} onOpenChange={setOpenDistrictPopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" aria-expanded={openDistrictPopover} className="w-full justify-between font-normal" disabled={loadingDistricts || !regencyCode}>
                                                        {loadingDistricts ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                <span>Memuat...</span>
                                                            </div>
                                                        ) : districtCode ? (
                                                            districts.find((d) => d.code === districtCode)?.name
                                                        ) : regencyCode ? (
                                                            "Pilih Kecamatan"
                                                        ) : (
                                                            "Pilih Kabupaten/Kota terlebih dahulu"
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Cari kecamatan..." />
                                                        <CommandList>
                                                            <CommandEmpty>Kecamatan tidak ditemukan.</CommandEmpty>
                                                            <CommandGroup>
                                                                {districts.map((district) => (
                                                                    <CommandItem
                                                                        key={district.code}
                                                                        value={district.name}
                                                                        onSelect={() => {
                                                                            setDistrictCode(district.code);
                                                                            setOpenDistrictPopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", districtCode === district.code ? "opacity-100" : "opacity-0")} />
                                                                        {district.name}
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
                                                Desa/Kelurahan
                                            </Label>
                                            <input type="hidden" value={villageCode} required />
                                            <Popover open={openVillagePopover} onOpenChange={setOpenVillagePopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" aria-expanded={openVillagePopover} className="w-full justify-between font-normal" disabled={loadingVillages || !districtCode}>
                                                        {loadingVillages ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                <span>Memuat...</span>
                                                            </div>
                                                        ) : villageCode ? (
                                                            villages.find((v) => v.code === villageCode)?.name
                                                        ) : districtCode ? (
                                                            "Pilih Kelurahan/Desa"
                                                        ) : (
                                                            "Pilih Kecamatan terlebih dahulu"
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Cari desa/kelurahan..." />
                                                        <CommandList>
                                                            <CommandEmpty>Desa/Kelurahan tidak ditemukan.</CommandEmpty>
                                                            <CommandGroup>
                                                                {villages.map((village) => (
                                                                    <CommandItem
                                                                        key={village.code}
                                                                        value={village.name}
                                                                        onSelect={() => {
                                                                            setVillageCode(village.code);
                                                                            setOpenVillagePopover(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", villageCode === village.code ? "opacity-100" : "opacity-0")} />
                                                                        {village.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="survey-at">Tanggal Survei </Label>
                                            <Input id="survey-at" type="date" value={surveyAt} onChange={(e) => setSurveyAt(e.target.value)} />
                                        </div>

                                        {/* Photo Upload */}
                                        <div className="space-y-2">
                                            <Label>Foto Pendukung (Maksimal 3MB)</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" id="photo-upload" />
                                                <label htmlFor="photo-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500">Klik untuk pilih foto</span>
                                                    <span className="text-xs text-gray-400 mt-1">Pilih beberapa foto sekaligus</span>
                                                </label>
                                            </div>

                                            {/* Selected photos grid */}
                                            {selectedFiles.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mt-3">
                                                    {selectedFiles.map((photo, index) => (
                                                        <div key={index} className="relative group cursor-pointer" onClick={() => setPreviewImage({ url: photo.previewUrl, name: photo.file.name })}>
                                                            <img src={photo.previewUrl} alt={photo.file.name} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                                <Maximize2 className="text-white h-6 w-6" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemovePhoto(index);
                                                                }}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                            <p className="text-xs text-gray-500 truncate mt-1">{photo.file.name}</p>
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

                                        {/* Submit Buttons */}
                                        <div className="flex gap-4 pt-4">
                                            <Link href="/survey" className="flex-1">
                                                <Button type="button" variant="outline" className="w-full">
                                                    Batal
                                                </Button>
                                            </Link>
                                            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    "Simpan Toponim"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>
                </div>

                {/* Right Side - Map */}
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
                    />
                </div>
            </div>
        </SurveyorLayout>
    );
};

export default Page;
