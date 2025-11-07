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

const ShowLoading : React.FC =  () => (
    <div className="flex justify-center items-center h-full">
        <SheetTitle className="sr-only">ID POI</SheetTitle>
        <Spinner className="size-8"/>
    </div>
)

export interface IPOIDetailSidebar {
    dataId: string | null
    setDataId: (dataId: string | null) => void
}

const POIDetailSidebar: React.FC<React.PropsWithChildren<IPOIDetailSidebar>> = ({ dataId, setDataId }) => {
    const handleOnOpenChange = () => {
        setDataId(null)
    }

    const isInitialLoad = useRef(true)
    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandler({ setLoading, shouldHandleError: true })
    const [item, setData] = useState<NRB | null>(null)

    const refresh = useCallback(() => {
        if(dataId) {
            apiHandler('GET', `/nrb/${dataId}`)
            .then(r => {
                setData(r)
            })
        }
        isInitialLoad.current = false
    }, [apiHandler, dataId])

    useEffect(refresh, [refresh])

    return (
        <Sheet open={!!dataId} modal={false}>
            <SheetContent side="left" className="w-screen sm:max-w-md py-4 ps-8 pt-24 pe-12 h-screen z-8 absolute block overflow-y-scroll">
                <SheetClose asChild>
                    <div className="flex items-center gap-1">
                        <Button type="button" onClick={handleOnOpenChange} size='icon-sm' className="rounded-sm border-2">
                            <ChevronLeft /> 
                        </Button> 
                        <h5 className="font-semibold"> Kembali </h5>
                    </div>
                    
                </SheetClose> 
                {loading ? (<ShowLoading/>) : (
                    <>
                        <SheetHeader className="px-0">
                            <SheetTitle className="font-bold">ID {item?.id} {item?.nrb}</SheetTitle>
                        </SheetHeader>
                        <div className="relative w-full h-44">
                        {item?.pictures && <Image
                            src={item.pictures}
                            layout="fill"
                            objectFit="cover"
                            alt={item.id}
                        />}
                        </div>
                        
                        <div className="flex flex-col mt-5"> 
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Status Pembakuan</div>
                                <div className="text-wrap">{item?.standarizationStatus}</div>
                            </div> 
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Kategori</div>
                                <div className="text-wrap">{item?.category}</div>
                            </div> 
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Sub Kategori</div>
                                <div className="text-wrap">{item?.subCategory}</div>
                            </div>
                            <Separator className="my-2"/>     
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Jenis Unsur</div>
                                <div className="text-wrap">{item?.elementType}</div>
                            </div> 
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Nama Lokal</div>
                                <div className="text-wrap">{item?.localName}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Nama Spesifik</div>
                                <div className="text-wrap">{item?.specificName}</div>
                            </div>
                            <Separator className="my-2"/>     
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Nama Lain</div>
                                <div className="text-wrap">{item?.otherName}</div>
                            </div>
                            <Separator className="my-2"/>
                            <div className="grid grid-cols-2">
                                <div className="text-wrap font-semibold">Asal Bahasa</div>
                                <div className="text-wrap">{item?.languangeOrigin}</div>
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
