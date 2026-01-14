"use client"
import { useState, useRef, useEffect, Suspense, useTransition } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PiPencilSimpleLineDuotone } from 'react-icons/pi'
import { useAuth } from "@/contexts/AuthContext"

import { Button } from "@/components/ui/button"
import { ChevronsDown, ChevronsUp, CircleUserRound, Loader2 } from "lucide-react"
import ReviewerLayout from "@/layouts/ReviewerLayout"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import 'react-calendar-heatmap/dist/styles.css'
import StatisticTab from "./StatisticTab"
import RegencyDataTab from "./RegencyDataTab"
import MyTeamTab from "./MyTeamTab"
import ReviewDataTab from "./ReviewDataTab"

const tabs = [
    { key: 'statistic', label: 'Statistik', component: <StatisticTab /> },
    { key: 'review-data', label: 'Data Penelaahan', component: <ReviewDataTab /> },
    { key: 'regency-data', label: 'Data Kabupaten/Kota', component: <RegencyDataTab /> },
    { key: 'my-team', label: 'Tim Saya', component: <MyTeamTab /> }
]

const PenelahanContent = () => {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [fullTab, setFulltab] = useState(false)
    const navbarRef = useRef<HTMLDivElement>(null)
    const [navbarHeight, setNavbarHeight] = useState(0)

    // Get active tab from URL, default to 'statistic'
    const tabFromUrl = searchParams.get('tab')
    const validTabs = tabs.map(t => t.key)
    const activeTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'statistic'

    const handleTabChange = (value: string) => {
        // Update URL without triggering full navigation for smoother experience
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', value)
        // Clear sub-params when changing main tab
        params.delete('view')
        params.delete('transactionId')
        window.history.replaceState(null, '', `/penelaahan?${params.toString()}`)
        // Force re-render by updating a dummy state or use router.replace for sync
        router.replace(`/penelaahan?${params.toString()}`, { scroll: false })
    }

    useEffect(() => {
        if (!navbarRef.current) return

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setNavbarHeight(entry.contentRect.height)
            }
        })

        observer.observe(navbarRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <ReviewerLayout navbarRef={navbarRef}>
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
                                {user?.name || 'Username'}
                                <Link href="/profile">
                                    <PiPencilSimpleLineDuotone size={18} className="mt-1" />
                                </Link>
                            </h3>
                            <h5 className="font-medium text-md capitalize">{user?.role || 'Role'}</h5>
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
                        value={activeTab}
                        onValueChange={handleTabChange}
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
        </ReviewerLayout>
    )
}

const Page = () => {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Memuat halaman...</p>
                </div>
            </div>
        }>
            <PenelahanContent />
        </Suspense>
    )
}

export default Page