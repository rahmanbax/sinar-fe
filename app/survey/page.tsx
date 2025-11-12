"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { cn } from "@/lib/utils";
import { useGeolocated } from "react-geolocated";
import { useApiHandler } from "@/utils/apiHandler";
import { NRB } from "@/types";
import { PiChatTeardropDots, PiChatTeardropDotsBold, PiPencilSimpleDuotone, PiPencilSimpleLineDuotone } from 'react-icons/pi'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsDown, ChevronsUp, CircleUserRound, Database, Download, Search, SlidersVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import SinarParameterizedTable from "@/components/SinarParameterizedTable";
import SurveyorLayout from "@/layouts/SurveryorLayout";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
// import * as d3 from 'd3'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { Map, Marker, GeolocateControl, GeolocateResultEvent, type MapRef, type ViewState, NavigationControl } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { IoLocationOutline } from "react-icons/io5";
import Image from "next/image";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DemoChart: React.FC = () => {
    const data: ChartData<'bar'> = {
        labels: ['Kampung/Dusun', 'Kantor Camat', 'Bukit', 'Masjid', 'Gunung'],
        datasets: [
            {
                label: 'Dataset 1',
                data: [917, 159, 180, 181, 256],
                backgroundColor: 'rgba(54, 162, 235, 1)',
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        indexAxis: 'y',
        maintainAspectRatio: false, // ✅ allow chart to resize properly
        scales: {
            x: {
                grid: {
                    display: false // Hide x-axis grid lines
                }
            },
            y: {
                ticks: { 
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                    size: 10, // adjust for small screens
                    },
                },
                grid: {
                    display: false // Hide y-axis grid lines
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart',
            },
        },
    };

    return <Bar data={data} options={options} />
}


const StatMap = () => {
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
                    [91, -12],   // Sudut barat daya Indonesia (lon, lat) + 5
                    [142, 12]     // Sudut timur laut Indonesia (lon, lat) + 5
                ]}
            ></Map>
        </div>
    )
}

// /login [POST] {email, password}
// /profile [GET] headers{ Authorization: 'Bearer xxx' }

const StatisticContent: React.FC = () => {

    return (
        <div className="flex flex-col lg:flex-row w-full gap-4 px-4">
            {/* LEFT SIDE: CARDS + CHART */}
            <div className="flex flex-col w-full lg:w-1/2 gap-6">
                {/* Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-[#0370A2] text-white text-center gap-2 py-4">
                        <CardTitle className="sr-only">Total Data</CardTitle>
                        <CardContent className="px-3 h-[70%]">
                            <div className="flex flex-col items-center">
                                <Database className="mx-auto mb-2" />
                                <h5>Total Data yg Dikumpulkan</h5>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className="text-center justify-center font-bold">1500</CardFooter>
                    </Card>
                    <Card className="bg-[#DBECFD] text-black text-center gap-2 py-4">
                        <CardTitle className="sr-only">Total Data</CardTitle>
                        <CardContent className="px-3 h-[70%]">
                            <div className="flex flex-col items-center">
                                <IoLocationOutline size={35} className="mx-auto mb-2" />
                                <h5>Data Survei</h5>
                            </div>
                        </CardContent>
                        <Separator className="border border-black" />
                        <CardFooter className="text-center justify-center font-bold">300</CardFooter>
                    </Card>
                    <Card className="bg-[#DBECFD] text-black text-center gap-2 py-4">
                        <CardTitle className="sr-only">Total Data</CardTitle>
                        <CardContent className="px-3 h-[70%]">
                            <div className="flex flex-col items-center">
                                <Image
                                    alt="Data Antara"
                                    src="./graph-1.svg"
                                    width={35}
                                    height={35}
                                    className="mx-auto mb-2"
                                />
                                <h5>Data Antara</h5>
                            </div>
                        </CardContent>
                        <Separator className="border border-black" />
                        <CardFooter className="text-center justify-center font-bold">300</CardFooter>
                    </Card>
                    <Card className="bg-[#DBECFD] text-black text-center gap-2 py-4">
                        <CardTitle className="sr-only">Total Data</CardTitle>
                        <CardContent className="px-3 h-[70%]">
                        <div className="flex flex-col items-center">
                                <Image
                                    alt="Data Dibakukan"
                                    src="./graph-2.svg"
                                    width={35}
                                    height={35}
                                    className="mx-auto mb-2"
                                />
                                <h5>Data yang Dibakukan</h5>
                            </div>
                        </CardContent>
                        <Separator className="border border-black" />
                        <CardFooter className="text-center justify-center font-bold">300</CardFooter>
                    </Card>
                </div>

                {/* Chart */}
                <div className="w-full h-auto md:h-[300px]">
                    <DemoChart />
                </div>
            </div>

            {/* RIGHT SIDE: MAP */}
            <div className="flex justify-center w-full lg:w-1/2 mt-6 sm:mt-0">
                <div className="w-full h-[350px] sm:h-[500px]">
                    <StatMap />
                </div>
            </div>
        </div>
    )
}

const Page = () => {
    const [fullTab, setFulltab] = useState(false)
    const navbarRef = useRef<HTMLDivElement>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const tabs = {
        statistic: 'Statistik',
        data: 'Data Saya',
        'data-delivery': 'Penyampaian Data',
        team: 'Tim Saya'
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
            <div
                className="flex flex-col grow overflow-hidden"
                style={{ paddingTop: fullTab ? navbarHeight + 27 : 90 }}
            >
                {/* --- Profile Section --- */}
                <div className={`flex flex-col md:flex-row md:justify-between items-center overflow-hidden px-5 md:px-20 md:gap-5 transition-all duration-500 ease-in-out ${fullTab ? 'opacity-0 h-0 py-0' : 'opacity-100 h-auto pb-4 md:py-6'}`}>

                    <div className="flex items-center gap-6">
                        <Avatar className="w-28 h-28 md:w-36 md:h-36">
                            <CircleUserRound size="max" />
                        </Avatar>
                        <div className="flex flex-col gap-1">
                            <h3 className="uppercase font-bold text-xl inline-flex gap-2">
                                Username
                                <Link href="/profile">
                                    <PiPencilSimpleLineDuotone size={18} className="mt-1" />
                                </Link>
                            </h3>
                            <h5 className="font-medium text-md">Role</h5>
                            <h5 className="font-medium text-md">City</h5>
                        </div>
                    </div>
                    <Button className="bg-[#083551] text-white hover:bg-white hover:text-[#083551] hover:border hover:border-[#083551] mt-4 md:mt-8">
                        Aktif hingga DD MMMM YYYY
                    </Button>
                </div>

                {/* --- Tabs Section --- */}
                <div className={`flex flex-col grow transition-all duration-500 ${fullTab ? 'h-full' : 'h-1/2 overflow-hidden'}`}>
                    <Tabs
                        defaultValue="statistic"
                        className={`flex flex-col grow w-full overflow-y-hidden gap-0 ${fullTab ? 'bg-muted' : 'bg-white'}`}
                    >
                        <TabsList
                            className={`self-center md:ms-auto mr-0 md:mr-8 p-0 border-none
                            ${fullTab ? 'rounded-t-none bg-muted' : 'rounded-b-none bg-white'}
                        `}
                        >
                            <div className="flex gap-x-2 h-full max-w-xs min-[435]:max-w-full bg-inherit hover:bg-inherit overflow-x-auto scrollbar-hidden">
                                {Object.keys(tabs).map((t) => (
                                    <TabsTrigger
                                        key={t}
                                        value={t}
                                        className={`rounded-b-none data-[state=active]:shadow-none data-[state=active]:border-none 
                                        ${fullTab ? 'rounded-t-none rounded-b-md' : 'rounded-b-none data-[state=active]:bg-muted'}
                                    `}
                                    >
                                        {tabs[t as keyof typeof tabs]}
                                    </TabsTrigger>
                                ))}
                            </div>
                            <button
                                className={`p-1 ${fullTab
                                    ? 'bg-muted hover:bg-white rounded-b-md'
                                    : 'bg-white hover:bg-muted rounded-t-md'
                                    }`}
                                onClick={() => setFulltab(!fullTab)}
                            >
                                {fullTab ? <ChevronsDown size={30} /> : <ChevronsUp size={30} />}
                            </button>
                        </TabsList>

                        {/* --- Tabs Content (Scrollable Area) --- */}
                        <div className="flex flex-col grow bg-muted overflow-hidden">
                            <TabsContent
                                value="statistic"
                                className="flex-1 overflow-y-auto py-8 px-2 sm:px-12"
                            >
                                <StatisticContent />
                            </TabsContent>

                            <TabsContent
                                value="data"
                                className="flex-1 overflow-y-auto bg-muted p-6"
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    Konten Data Saya
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="data-delivery"
                                className="flex-1 overflow-y-auto bg-muted p-6"
                            >
                                <div className="w-full h-full rounded-md border border-dashed border-gray-300 flex items-center justify-center">
                                    Konten Penyampaian Data
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="team"
                                className="flex-1 overflow-y-auto bg-muted p-6"
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    Konten Tim Saya
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </SurveyorLayout>

    );
}

export default Page