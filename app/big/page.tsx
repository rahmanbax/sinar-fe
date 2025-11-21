"use client"
import { useState, useRef, useEffect } from "react";
import { PiPencilSimpleLineDuotone } from 'react-icons/pi'

import { Button } from "@/components/ui/button";
import { ChevronsDown, ChevronsUp, CircleUserRound, Database } from "lucide-react";
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
import { IoLocationOutline } from "react-icons/io5";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import Image from "next/image";
import StatisticTab from "./StatisticTab";
import GazeterTab from "./GazeterTab";
import MyTeamTab from "./MyTeamTab";
import ReviewDataTab from "./ReviewDataTab";

const Page = () => {
    const [fullTab, setFulltab] = useState(false)
    const navbarRef = useRef<HTMLDivElement>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const tabs = [
        { key: 'statistic', label: 'Statistik', component: <StatisticTab/> },
        { key: 'announcement', label: 'Pengumuman', component: <StatisticTab/> },
        { key: 'response-review', label: 'Penelaahan Tanggapan', component: <StatisticTab/> },
        { key: 'publication', label: 'Penetapan', component: <StatisticTab/> },
        { key: 'create-gazeter', label: 'Pembuatan GRI', component: <GazeterTab/> },
        { key: 'update-review', label: 'Penelaahan Perubahan', component: <StatisticTab/> },
        { key: 'my-team', label: 'Tim Saya', component: <MyTeamTab/> }
    ]

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
                            <Image
                                src="/logo-wiki.png"
                                layout="fill"
                                objectFit="contain"
                                alt="logo-big"
                            />
                        </Avatar>
                        <div className="flex flex-col gap-1">
                            <h3 className="uppercase font-bold text-xl inline-flex gap-2">
                                Badan Informasi Geospasial
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
                                {tabs.map((t) => (
                                    <TabsTrigger
                                        key={t.key}
                                        value={t.key}
                                        className={`rounded-b-none data-[state=active]:shadow-none data-[state=active]:border-none 
                                        ${fullTab ? 'rounded-t-none rounded-b-md' : 'rounded-b-none data-[state=active]:bg-muted'}
                                    `}
                                    >
                                        {t.label}
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
                            {tabs.map(t => (
                                <TabsContent
                                    key={t.key}
                                    value={t.key}
                                    className="flex-1 overflow-y-auto py-8 px-2 sm:px-12"
                                >
                                    {t.component}
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            </div>
        </SurveyorLayout>
    );
}

export default Page