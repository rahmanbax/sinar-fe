import { MultiSelect, Option } from "@/components/MultiSelect"
import SinarParameterizedTable from "@/components/SinarParameterizedTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CircleUserRound, Map, Plus, Search, SlidersVertical } from "lucide-react"

import Link from "next/link"
import { useState } from "react"

import { Chart as ChartJS, ChartData, ArcElement, Tooltip, Legend, Plugin } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Progress } from "@/components/ui/progress"

ChartJS.register(ArcElement, Tooltip, Legend);

const CenterTextPlugin: Plugin = {
    id: "centerText",
    afterDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        const dataset = chart.data.datasets[0];
        const value = dataset.data[0] as number;

        ctx.save();
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${value}%`, width / 2, height / 2);
        ctx.restore();
    }
};

const DoughnutPerformance: React.FC<{ data: number[], type: 'accepted' | 'rejected' }> = ({ data, type }) => {
    const chartData: ChartData<'doughnut'> = {
        labels: [type, ''],
        datasets: [
            {
                label: 'Dataset 1',
                data: data,
                backgroundColor: type === 'accepted' ? [
                    'rgba(21, 72, 30, 1)',
                    'rgba(21, 72, 30, 0.2)'
                ] : [
                    'rgba(179, 0, 3, 1)',
                    'rgba(179, 0, 3, 0.2)'
                ]
            },
        ],
    };

    return <Doughnut data={chartData} plugins={[CenterTextPlugin]} options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "85%",   // THINNER DOUGHNUT
        plugins: {
            legend: { display: false }
        }
    }} />
}

interface IReviewCard {
    id: number
    title: string
    reviewerCnt?: number
    elementTypeCnt?: number
    reviewedCnt?: number
    districtCnt?: number
    acceptedCnt?: number
    rejectedCnt?: number
    reviewEndTs?: Date
}

const ReviewCard:
    React.FC<IReviewCard> = ({
        id,
        title,
        reviewedCnt = 0,
        elementTypeCnt = 0,
        reviewerCnt = 0,
        districtCnt = 0,
        acceptedCnt = 0,
        rejectedCnt = 0,
        reviewEndTs
    }) => {
        return (
            <Card className="p-4 rounded-none border border-black shadow-none sm:w-full">
                <CardHeader className="flex justify-between px-0">
                    <CardTitle>ID Penelaahan #{id}</CardTitle>
                    <div className="border border-blue-600 text-blue-600 flex items-center justify-center text-center p-1 text-sm">
                        Proses Penelaahan
                    </div>
                </CardHeader>
                {/* Bottom Section */}
                <CardContent className="px-0">
                    <h3 className="text-xl mb-3">
                        {title}
                    </h3>
                    <div className="flex justify-between">
                        <div className="text-start">
                            <h5 className="mb-3">
                                <span className="text-xl">{reviewerCnt}</span> Verifikator
                            </h5>
                            <h5 className="mb-3">
                                <span className="text-xl">{reviewedCnt}</span> Data yang ditelaah
                            </h5>
                        </div>
                        <div className="text-end">
                            <h5 className="mb-3">
                                <span className="text-xl">{elementTypeCnt}</span> Jenis Unsur Rupabumi
                            </h5>
                            <h5 className="mb-3">
                                <span className="text-xl">{districtCnt}</span> Kecamatan
                            </h5>
                        </div>
                    </div>
                    <div className="flex gap-x-2 justify-center w-full h-30 mb-4">
                        <div className="text-center w-30 h-20">
                            <DoughnutPerformance data={[acceptedCnt, reviewedCnt - acceptedCnt]} type='accepted' />
                            <h5>{acceptedCnt}</h5>
                            <p>Data Diterima</p>
                        </div>

                        <div className="text-center w-30 h-20">
                            <DoughnutPerformance data={[acceptedCnt, reviewedCnt - rejectedCnt]} type='rejected' />
                            <h5>{rejectedCnt}</h5>
                            <p>Data Ditolak</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <Progress value={30} className="[&>*]:bg-[#0088FF]" />
                        <p>Penelaahan akan berakhir dalam 20 hari lagi</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

const ReviewDataTab: React.FC = () => {

    return (
        <div className="block px-4">
            <Button>
                <div className="p-0.5 bg-white">
                    <Plus className="text-black" />
                </div>
                Buat penelaahan
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-8 gap-5">
                <ReviewCard id={1} title="Penelaahan Kabupaten Konoha Tahap 8" reviewedCnt={100} acceptedCnt={30} />
                <ReviewCard id={1} title="Penelaahan Kabupaten Konoha Tahap 8" reviewedCnt={100} acceptedCnt={30} />
                <ReviewCard id={1} title="Penelaahan Kabupaten Konoha Tahap 8" reviewedCnt={100} acceptedCnt={30} />
                <ReviewCard id={1} title="Penelaahan Kabupaten Konoha Tahap 8" reviewedCnt={100} acceptedCnt={30} />
            </div>
        </div>
    )
}

export default ReviewDataTab