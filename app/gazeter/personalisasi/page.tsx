"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { useGeolocated } from "react-geolocated";
import { useApiHandler } from "@/utils/apiHandler";
import { NRB } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface IGazeterCollapsibleItem {
    data: {
        name: string
        coverImg: string
        url: string
    }
}

const GazeterCollapsibleItem: React.FC<IGazeterCollapsibleItem> = ({ data }) => {
    return (
        <Collapsible
            className="max-w-max md:max-w-[928px] bg-linear-to-r from-[#1378B7] to-[#083551] rounded-md pb-0 data-[state=open]:pb-5 transition-all duration-500 ease-in-out"
        >
            <div className="flex items-center justify-between gap-4 p-4 rounded-md lg:w-[928px]">
                <h5 className="text-2xl font-semibold text-white">
                    {data.name}
                </h5>
                <CollapsibleTrigger asChild>
                    <button className="w-auto h-auto p-0 bg-inherit hover:bg-inherit">
                        <ChevronDown
                            size={28}
                            className="text-white transition-transform duration-500 ease-in-out data-[state=open]:rotate-180 hover:scale-125 hover:drop-shadow-lg cursor-pointer"
                        />
                    </button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="flex justify-center px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center p-4 overflow-hidden transition-all duration-500 ease-in-out data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
                    <div className="h-72 w-48 bg-white p-2 relative">
                        <div className="relative w-full h-full">
                            <Link href={data.url}>
                                <Image
                                    src={data.coverImg}
                                    alt={data.name}
                                    fill
                                    className='object-cover'
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

const gazeterItems = [
    {
        name: 'Gazeter Republik Indonesia 2024',
        coverImg: 'https://sinar.big.go.id/assets/images/gazeter_thumb/gazeter_thumb_1744615986.jpg',
        url: 'https://sinar.big.go.id/assets/document/gazeter/gazeter_1744615986.pdf'
    },
    {
        name: 'Gazeter Republik Indonesia 2023',
        coverImg: 'https://sinar.big.go.id/assets/images/gazeter_thumb/gazeter_thumb_1703639773.jpg',
        url: 'https://sinar.big.go.id/assets/document/gazeter/gazeter_1703639768.pdf'
    },
    {
        name: 'Gazeter Republik Indonesia 2022',
        coverImg: 'https://sinar.big.go.id/assets/images/referensi/thumbnail/5-Gazeter-Republik-Indonesia-Edisi-1-Tahun-2022-Unsur-Rupabumi-Pulau-(A4).png',
        url: 'https://sinar.big.go.id/assets/document/gazeter/gazeter_1708946616.pdf'
    },
    {
        name: 'Gazeter Republik Indonesia 2021',
        coverImg: 'https://sinar.big.go.id/assets/images/gazeter_thumb/gazeter_thumb_1643095454.jpg',
        url: 'https://sinar.big.go.id/assets/document/gazeter/gazeter_1643095453.pdf'
    }
]

const Page = () => {

    const isInitialLoad = useRef(true)
    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandler({ setLoading, shouldHandleError: true })
    const [apiData, setData] = useState<NRB[]>([])
    const [searchString, setSearchString] = useState<string | undefined>()
    const [page, setPage] = useState(1)

    const [panel, setPanel] = useState('ebook')

    const handleChangePanel = (panel: 'ebook' | 'tabular') => {
        setPanel(panel)
    }

    const refresh = useCallback(() => {

    }, [apiHandler, searchString])

    useEffect(refresh, [refresh])

    return (
        <PublicLayout>
            <div className="mt-24">
                <div className="flex flex-col items-center text-center px-12 md:px-32 lg:px-56 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Gazeter Republik Indonesia</h1>
                    <p className="text-wrap">adalah daftar yang berisi Nama Rupabumi baku, nama daerah, nama wilayah administrasi, dan nama ibu kota Negara Kesatuan Republik Indonesia</p>
                    <div className="flex gap-2 mt-4 h-10">
                        <Button variant='outline' className={`${panel === 'ebook' ? 'bg-[#A8DADC]' : 'bg-neutral-50'}`} onClick={() => handleChangePanel('ebook')}>Data Cetak</Button>
                        <Separator orientation="vertical" className="bg-black" />
                        <Button variant='outline' className={`${panel === 'tabular' ? 'bg-[#A8DADC]' : 'bg-neutral-50'}`} onClick={() => handleChangePanel('tabular')}>Data Tabular</Button>
                    </div>
                </div>
                {panel === 'ebook' ? <div className="flex flex-col gap-y-6 items-center px-12 md:px-28 lg:px-16 mb-10">
                    {gazeterItems.map(item => (
                        <GazeterCollapsibleItem key={item.name} data={item} />
                    ))}
                </div> : <></>}
            </div>
            <div
                className="
                    absolute 
                    flex items-center justify-center text-center 
                    bg-[#E63946] text-neutral-50 font-bold rounded-full
                    aspect-square
                    text-xs sm:text-sm md:text-base lg:text-lg
                    w-20 sm:w-24 md:w-32
                    bottom-8 sm:bottom-10 md:bottom-12
                    right-2 sm:right-5 md:right-8
                    cursor-pointer
                "
            >
                Buat Gazetermu Sendiri!
            </div>
        </PublicLayout>

    );
}

export default Page