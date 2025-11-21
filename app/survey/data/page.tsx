"use client"
import { useState, useRef, useEffect } from "react";
import { PiPencilSimpleLineDuotone } from 'react-icons/pi'

import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronLeft, ChevronsDown, ChevronsUp, ChevronsUpDown, CircleUserRound, Database } from "lucide-react";
import SurveyorLayout from "@/layouts/SurveryorLayout";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
// import * as d3 from 'd3'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { Map, type MapRef, type ViewState, } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import Image from "next/image";
import StatisticTab from "../StatisticTab";
import MyDataTab from "../MyDataTab";
import MyTeamTab from "../MyTeamTab";
import DataDeliveryTab from "../DataDeliveryTab";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const PreviewMap = () => {
    const mapRef = useRef<MapRef>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geoRef = useRef<maplibregl.GeolocateControl>(null);

    const [bearing, setBearing] = useState(0)

    const initialViewState: ViewState = {
        longitude: big_office_coord.longitude,
        latitude: big_office_coord.latitude,
        zoom: 4.55,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0 }
    };

    const [loadingStyle, setLoadingStyle] = useState(false)
    const [viewState, setViewState] = useState(initialViewState);
    const [mapStyle, setMapStyle] = useState(MapStyles[0])
    const [onHover, setOnHover] = useState<string | undefined>()

    return (
        <div className="w-full h-full border-2 border-black">
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle.src}
                onMove={e => {
                    setViewState(e.viewState)
                    setBearing(e.viewState.bearing)
                }}
                maxBounds={[
                    [92, -12],   // Sudut barat daya Indonesia (lon, lat) + 5
                    [142, 7]     // Sudut timur laut Indonesia (lon, lat) + 5
                ]}
            ></Map>
        </div>
    )
}

const Page = () => {
    const [fullTab, setFulltab] = useState(false)
    const navbarRef = useRef<HTMLDivElement>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [openCollapsible, setOpenCollapsible] = useState({ toponim: false, additional: false })
    const tabs = [
        { key: 'statistic', label: 'Statistik', component: <StatisticTab /> },
        { key: 'my-data', label: 'Data Saya', component: <MyDataTab /> },
        { key: 'data-delivery', label: 'Penyampaian Data', component: <DataDeliveryTab /> },
        { key: 'my-team', label: 'Tim Saya', component: <MyTeamTab /> }
    ]

    const handleOpenCollapsible = (key: keyof typeof openCollapsible) => {
        setOpenCollapsible({ ...openCollapsible, [key]: !openCollapsible[key] })
    }

    useEffect(() => {
        if (!navbarRef.current) return;

        // Observe height changes of navbar
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setNavbarHeight(entry.contentRect.height);
            }
        });

        observer.observe(navbarRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <SurveyorLayout navbarRef={navbarRef}>
            <div className="flex flex-col overflow-hidden grow pt-23 h-full">
                <div className="flex grow">
                    <div className="block w-3/4 py-4 px-6 overflow-y-scroll max-h-[83vh]">
                        <div className="flex items-center gap-3 mb-5">
                            <Button size='icon-sm'><ChevronLeft /></Button>
                            Kembali
                        </div>
                        <h3 className="text-xl font-bold mb-3">ID Toponim</h3>
                        <div className="flex gap-3 mb-3">
                            <Button className="bg-purple-600 hover:bg-purple-800">
                                <PiPencilSimpleLineDuotone /> Edit Data
                            </Button>
                            <Button className="bg-green-700 hover:bg-green-800">
                                <Check /> Ajukan Data
                            </Button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Collapsible open={openCollapsible.toponim} onOpenChange={() => handleOpenCollapsible('toponim')}>
                                <div className="flex items-center justify-between gap-4 px-4">
                                    <h3 className="text-xl font-semibold">
                                        Informasi Unsur Rupabumi
                                    </h3>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <ChevronDown />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent className="flex flex-col px-6 mt-3">
                                    <form action="">
                                        <FieldSet className="gap-y-3">
                                            <FieldGroup className="flex flex-row">
                                                <Field>
                                                    <FieldLabel htmlFor="generic_name">
                                                        Elemen Generik
                                                    </FieldLabel>
                                                    <Input
                                                        id="generic_name"
                                                        name="generic_name"
                                                        required
                                                    />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="specific_name">
                                                        Elemen Spesifik
                                                    </FieldLabel>
                                                    <Input
                                                        id="specific_name"
                                                        name="specific_name"
                                                        required
                                                    />
                                                </Field>
                                            </FieldGroup>
                                            <FieldDescription>
                                                Nama Rupabumi :
                                            </FieldDescription>
                                            <Field>
                                                <FieldLabel htmlFor="element_type">
                                                    Jenis Unsur Rupabumi
                                                </FieldLabel>
                                                <Select
                                                    name="element_type"
                                                    required
                                                >
                                                    <SelectTrigger id="element_type">
                                                        <SelectValue placeholder="Jenis Unsur Rupa bumi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unsur1">Unsur 1</SelectItem>
                                                        <SelectItem value="unsur2">Unsur 2</SelectItem>
                                                        <SelectItem value="unsur3">Unsur 3</SelectItem>
                                                        <SelectItem value="unsur4">Unsur 4</SelectItem>
                                                        <SelectItem value="unsur5">Unsur 5</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                            <FieldGroup className="flex flex-row">
                                                <Field>
                                                    <FieldLabel htmlFor="decimal_coordinate">
                                                        Koordinat (Derajat Desimal)
                                                    </FieldLabel>
                                                    <Input
                                                        id="decimal_coordinate"
                                                        name="decimal_coordinate"
                                                        required
                                                        readOnly
                                                    />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="degree_coordinate">
                                                        Koordinat (Derajat Menit Detik)
                                                    </FieldLabel>
                                                    <Input
                                                        id="degree_coordinate"
                                                        name="degree_coordinate"
                                                        required
                                                        readOnly
                                                    />
                                                </Field>
                                            </FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="name_meaning">
                                                    Arti Nama
                                                </FieldLabel>
                                                <Input
                                                    id="name_meaning"
                                                    name="name_meaning"
                                                    required
                                                    readOnly
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="other_name">
                                                    Nama Lain
                                                </FieldLabel>
                                                <Input
                                                    id="other_name"
                                                    name="other_name"
                                                    required
                                                    readOnly
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="languange_origin">
                                                    Asal Bahasa
                                                </FieldLabel>
                                                <Input
                                                    id="languange_origin"
                                                    name="languange_origin"
                                                    required
                                                    readOnly
                                                />
                                            </Field>
                                        </FieldSet>
                                    </form>
                                </CollapsibleContent>
                            </Collapsible>
                            <Collapsible open={openCollapsible.additional} onOpenChange={() => handleOpenCollapsible('additional')}>
                                <div className="flex items-center justify-between gap-4 px-4">
                                    <h3 className="text-xl font-semibold">
                                        Informasi Pendukung
                                    </h3>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <ChevronDown />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent className="grid grid-cols-2 gap-x-6 gap-y-8 place-items-center px-6 mt-3">
                                    <div className="w-48 h-32 bg-gray-500"></div>
                                    <div className="w-48 h-32 bg-gray-500"></div>
                                    <div className="w-48 h-32 bg-gray-500"></div>
                                    <div className="w-48 h-32 bg-gray-500"></div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>
                    <PreviewMap />
                </div>
            </div>
        </SurveyorLayout>

    );
}

export default Page