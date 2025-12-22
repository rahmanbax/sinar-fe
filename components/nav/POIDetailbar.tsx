import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { FileText, ChevronLeft, Loader } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetHeader,
    SheetClose,
    SheetDescription,
} from '@/components/ui/sheet'

import { Separator } from "@/components/ui/separator"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useApiHandler } from "@/utils/apiHandler"
import { NRB } from "@/types"
import { Spinner } from "../ui/spinner"
import { StandardToponim, ToponimMarkerItem } from "@/types/Toponim"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const ShowLoading : React.FC =  () => (
    <div className="flex justify-center items-center h-full">
        <SheetTitle className="sr-only">ID POI</SheetTitle>
        <Spinner className="size-8"/>
    </div>
)

export interface IPOIDetailSidebar {
    markerData?: ToponimMarkerItem | null
    setMarkerData: (data: ToponimMarkerItem | null) => void
}

const POIDetailSidebar: React.FC<React.PropsWithChildren<IPOIDetailSidebar>> = ({ markerData, setMarkerData }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // Not strictly needed for clearing all, but good practice

    const handleClearParams = () => {
        router.replace(pathname, { scroll: false });
    };

    const handleOnOpenChange = (open: boolean) => {
        handleClearParams()
        if (open && markerData) setMarkerData(markerData)
        else {setMarkerData(null)}
    }

    const isInitialLoad = useRef(true)
    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandler<StandardToponim>({ setLoading, shouldHandleError: true })
    const [item, setData] = useState<StandardToponim | null>(null)

    const refresh = useCallback(() => {
        if(markerData) {
            apiHandler('GET', `/toponyms/${markerData.id}`)
            .then(r => {
                setData(r)
            })
        }
        isInitialLoad.current = false
    }, [apiHandler, markerData])

    useEffect(refresh, [refresh])

    return (
        <Sheet open={!!markerData} modal={false} onOpenChange={handleOnOpenChange}>
            <SheetContent side="left" className="w-screen sm:max-w-md py-4 ps-8 pt-24 pe-12 h-screen z-8 absolute block overflow-y-scroll">
                <SheetClose asChild>
                    <div className="flex items-center gap-1">
                        <Button type="button" onClick={() => handleOnOpenChange(false)} size='icon-sm' className="rounded-sm border-2">
                            <ChevronLeft /> 
                        </Button> 
                        <h5 className="font-semibold"> Kembali </h5>
                    </div>
                    
                </SheetClose> 
                {loading ? (<ShowLoading/>) : (
                    <>
                        <SheetHeader className="px-0">
                            <SheetTitle className="font-bold">ID {item?.id_toponym} {item?.local_name}</SheetTitle>
                        </SheetHeader>
                        <div className="relative w-full h-44">
                        {item?.photos?.length && <Image
                            src={item.photos[0].url}
                            layout="fill"
                            objectFit="cover"
                            alt={item.map_name}
                        />}
                        </div>
                        
                        <div className="flex flex-col mt-5"> 
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Status Pembakuan</div>
                                <div className="text-wrap">{item?.standardization_status.name}</div>
                            </div> 
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Kategori</div>
                                <div className="text-wrap">{item?.category.name}</div>
                            </div> 
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Sub Kategori</div>
                                <div className="text-wrap">{item?.sub_category.name}</div>
                            </div>
                            <Separator className="my-2"/>     
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Jenis Unsur</div>
                                <div className="text-wrap">{item?.element.name}</div>
                            </div> 
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Nama Lokal</div>
                                <div className="text-wrap">{item?.local_name}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Nama Spesifik</div>
                                <div className="text-wrap">{item?.specific_name}</div>
                            </div>
                            <Separator className="my-2"/>     
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Nama Lain</div>
                                <div className="text-wrap">{item?.other_name}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Asal Bahasa</div>
                                <div className="text-wrap">{item?.languange_origin}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Provinsi</div>
                                <div className="text-wrap">{item?.province?.name}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Kabupaten/Kota</div>
                                <div className="text-wrap">{item?.regency?.name}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Kecamatan</div>
                                <div className="text-wrap">{item?.district?.name}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Kelurahan/Desa</div>
                                <div className="text-wrap">{item?.village?.name}</div>
                            </div>
                            <Separator className="my-2"/>
                        </div>
                        
                    </>
                )}
                
            </SheetContent>
        </Sheet>
    )
}

export default POIDetailSidebar
