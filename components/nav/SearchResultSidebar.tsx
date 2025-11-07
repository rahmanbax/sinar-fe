import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { FileText, ChevronLeft } from "lucide-react"

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

export interface ISearchResultSidebar {
    searchString?: string
}

const SearchResultSidebar: React.FC<React.PropsWithChildren<ISearchResultSidebar>> = ({ searchString }) => {
    const [open, setOpen] = useState(false)

    const handleOnOpenChange = () => {
        
    }

    const isInitialLoad = useRef(true)
    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandler({ setLoading, shouldHandleError: true })
    const [data, setData] = useState<NRB[]>()

    const refresh = useCallback(() => {
        if(searchString) {
            apiHandler('GET', `/nrb?search=${searchString}`)
            .then(r => {
                setData(r)
            })
        }
        isInitialLoad.current = false
    }, [apiHandler, searchString])

    useEffect(refresh, [refresh])

    return (
        <Sheet open={!!(data && data.length)} modal={false}>
            <SheetContent side="left" className="w-96 py-4 ps-8 pe-12 h-[90vh] z-5 absolute top-18 block">
                <SheetClose asChild>
                    <Button type="button" size='icon-sm' className="rounded-none">
                        <ChevronLeft /> 
                    </Button> 
                </SheetClose> Kembali
                <SheetHeader className="px-0">
                    <SheetTitle></SheetTitle>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export default SearchResultSidebar
