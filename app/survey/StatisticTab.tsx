import { useState, useRef } from "react";
import { Database } from "lucide-react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import * as d3 from 'd3'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { Map, type MapRef, type ViewState,  } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { IoLocationOutline } from "react-icons/io5";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
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

const StatisticTab: React.FC = () => {
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