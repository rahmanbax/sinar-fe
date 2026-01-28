import { useState, useRef, useEffect } from "react";
import { Database } from "lucide-react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { Map, type MapRef, type ViewState } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { IoLocationOutline } from "react-icons/io5";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import Image from "next/image";
import { getPersonalPerformance } from "@/api/personal";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// API Response Types
interface PerformanceData {
    user_id: string
    summary: {
        submitted_data: number
        survey_data: number
        antara_data: number
        standarized: number
    }
    five_top_elements: Array<{
        element_code: string
        element_name: string
        count: number
    }>
}

interface ElementChartProps {
    elements: Array<{
        element_code: string
        element_name: string
        count: number
    }>
}

const ElementChart: React.FC<ElementChartProps> = ({ elements }) => {
    const data: ChartData<'bar'> = {
        labels: elements.map(e => e.element_name),
        datasets: [
            {
                label: 'Jumlah Data',
                data: elements.map(e => e.count),
                backgroundColor: 'rgba(54, 162, 235, 1)',
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                        size: 10,
                    },
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: '5 Elemen Teratas',
            },
        },
    };

    return <Bar data={data} options={options} />
}

const StatMap = () => {
    const mapRef = useRef<MapRef>(null);
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
                    [91, -12],
                    [142, 12]
                ]}
            ></Map>
        </div>
    )
}

const StatisticTab: React.FC = () => {
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const result = await getPersonalPerformance(token);

                if (!result.error && result.data) {
                    setPerformanceData(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch performance data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-gray-500">Memuat statistik...</p>
            </div>
        )
    }

    return (
        <div className="block px-4">
            <div className="flex flex-col lg:flex-row w-full gap-4">
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
                            <CardFooter className="text-center justify-center font-bold">
                                {performanceData?.summary.submitted_data || 0}
                            </CardFooter>
                        </Card>
                        <Card className="bg-[#DBECFD] text-black text-center gap-2 py-4">
                            <CardTitle className="sr-only">Data Survei</CardTitle>
                            <CardContent className="px-3 h-[70%]">
                                <div className="flex flex-col items-center">
                                    <IoLocationOutline size={35} className="mx-auto mb-2" />
                                    <h5>Data Survei</h5>
                                </div>
                            </CardContent>
                            <Separator className="border border-black" />
                            <CardFooter className="text-center justify-center font-bold">
                                {performanceData?.summary.survey_data || 0}
                            </CardFooter>
                        </Card>
                        <Card className="bg-[#DBECFD] text-black text-center gap-2 py-4">
                            <CardTitle className="sr-only">Data Antara</CardTitle>
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
                            <CardFooter className="text-center justify-center font-bold">
                                {performanceData?.summary.antara_data || 0}
                            </CardFooter>
                        </Card>
                        <Card className="bg-[#DBECFD] text-black text-center gap-2 py-4">
                            <CardTitle className="sr-only">Data Dibakukan</CardTitle>
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
                            <CardFooter className="text-center justify-center font-bold">
                                {performanceData?.summary.standarized || 0}
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Chart */}
                    <div className="w-full h-auto md:h-[300px]">
                        {performanceData?.five_top_elements && performanceData.five_top_elements.length > 0 ? (
                            <ElementChart elements={performanceData.five_top_elements} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Belum ada data elemen</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: MAP */}
                <div className="flex justify-center w-full lg:w-1/2 mt-6 sm:mt-0">
                    <div className="w-full h-[350px] sm:h-[500px]">
                        <StatMap />
                    </div>
                </div>
            </div>
            <h4 className="text-2xl mt-10 mb-2">Linimasa</h4>
            <div className="bg-white p-3">
                <CalendarHeatmap
                    startDate={new Date('2025-01-01')}
                    endDate={new Date()}
                    monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']}
                    showWeekdayLabels
                    values={[
                        { date: '2025-01-01', count: 12 },
                        { date: '2025-01-22', count: 122 },
                        { date: '2025-01-30', count: 38 },
                    ]}
                />
            </div>
        </div>
    )
}

export default StatisticTab