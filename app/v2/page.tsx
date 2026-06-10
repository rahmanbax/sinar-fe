"use client"
import React, { Suspense } from 'react'
import PublicLayout from '@/components/v2/nav/PublicLayout'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar as CalendarIcon, Map as MapIcon, ChevronRight, Newspaper, MapPin, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import IndonesiaMap from '@/components/v2/map/IndonesiaMap'
import MiniIndonesiaMap from '@/components/v2/map/MiniIndonesiaMap'
import { usePublicNewsQuery, usePublicAgendasQuery } from '@/hooks/usePublic'
import { formatDistanceToNow, format } from 'date-fns'
import { id } from 'date-fns/locale'

// Dummy Data Components
const StatCard = ({ title, value }: { title: string, value: string }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex justify-between items-center shadow-sm">
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-sm font-medium text-gray-500">{title}</span>
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
        </div>
    </div>
)

const SectionHeader = ({ title, icon, href }: { title: string, icon: React.ReactNode, href: string }) => (
    <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        </div>
        <Link href={href} className="text-sm font-semibold text-gray-600 hover:text-navy-600 flex items-center gap-1">
            Lihat Semua <ChevronRight size={16} />
        </Link>
    </div>
)

const BerandaContent = () => {
    const searchParams = useSearchParams();
    const view = searchParams.get('view');
    const { data: newsData, isLoading: isLoadingNews } = usePublicNewsQuery(1, "");
    const { data: agendasData, isLoading: isLoadingAgendas } = usePublicAgendasQuery(1, "");

    if (view === 'peta') {
        return (
            <PublicLayout isMap={true}>
                <div className='flex-1 w-full h-full relative overflow-hidden'>
                    <Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-sm font-semibold text-gray-500 animate-pulse">Memuat Peta...</span>
                        </div>
                    }>
                        <IndonesiaMap />
                    </Suspense>
                </div>
            </PublicLayout>
        )
    }

    return (
        <PublicLayout>
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-12">
                {/* Hero Section */}
                <div className="w-full h-[300px] md:h-[400px] lg:h-[450px] relative rounded-3xl overflow-hidden shadow-md">
                    <Image
                        src="/hero_mountain.png"
                        alt="Pemandangan Alam Indonesia"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Statistik Section */}
                <div className="flex flex-col gap-6 items-center">
                    <h2 className="text-xl font-bold text-gray-900">Statistik</h2>
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Toponim" value="6.000" />
                        <StatCard title="Total Toponim" value="6.000" />
                        <StatCard title="Total Toponim" value="6.000" />
                    </div>
                </div>

                {/* Berita, Agenda, Gazeter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Berita */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader title="Berita" icon={<Newspaper size={20} />} href="/v2/berita" />
                        
                        {isLoadingNews ? (
                            <div className="w-full h-48 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                                <span className="text-gray-400 text-sm">Memuat berita...</span>
                            </div>
                        ) : newsData?.data && newsData.data.length > 0 ? (
                            <>
                                {/* Main News Card */}
                                <Link href={`/v2/berita/${newsData.data[0].slug}`} className="w-full h-48 bg-gray-200 rounded-xl relative overflow-hidden group cursor-pointer block">
                                    {newsData.data[0].thumbnail_url && (
                                        <Image src={newsData.data[0].thumbnail_url} alt={newsData.data[0].title} fill className="object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                    <div className="absolute bottom-0 left-0 p-4 z-20">
                                        <h4 className="text-white font-bold leading-snug group-hover:underline line-clamp-2">{newsData.data[0].title}</h4>
                                    </div>
                                </Link>
                                
                                {/* Small News Cards */}
                                {newsData.data.slice(1, 3).map((news) => (
                                    <Link href={`/v2/berita/${news.slug}`} key={news.id} className="flex gap-4 items-center group cursor-pointer mt-2">
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                                            {news.thumbnail_url && (
                                                <Image src={news.thumbnail_url} alt={news.title} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h5 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-navy-600 line-clamp-2">{news.title}</h5>
                                            <span className="text-xs text-gray-500">
                                                {news.published_at ? formatDistanceToNow(new Date(news.published_at), { addSuffix: true, locale: id }) : ''}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <div className="w-full h-48 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Belum ada berita</span>
                            </div>
                        )}
                    </div>

                    {/* Agenda */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader title="Agenda" icon={<CalendarIcon size={20} />} href="/v2/agenda" />
                        
                        {isLoadingAgendas ? (
                            <div className="w-full h-48 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                                <span className="text-gray-400 text-sm">Memuat agenda...</span>
                            </div>
                        ) : agendasData?.data && agendasData.data.length > 0 ? (
                            <>
                                {/* Main Agenda Card */}
                                <Link href={`/v2/agenda/${agendasData.data[0].id}`} className="w-full h-48 bg-gray-200 rounded-xl relative overflow-hidden group cursor-pointer block">
                                    {agendasData.data[0].photo_url && (
                                        <Image src={agendasData.data[0].photo_url} alt={agendasData.data[0].title} fill className="object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                    <div className="absolute bottom-0 left-0 p-4 z-20 flex flex-col gap-1">
                                        <h4 className="text-white font-bold leading-snug group-hover:underline line-clamp-2">{agendasData.data[0].title}</h4>
                                        <span className="text-white/80 text-xs font-medium">
                                            {agendasData.data[0].date ? format(new Date(agendasData.data[0].date), 'dd MMMM yyyy', { locale: id }) : ''}
                                        </span>
                                    </div>
                                </Link>
                                
                                {/* Small Agenda Cards */}
                                {agendasData.data.slice(1, 3).map((agenda) => (
                                    <Link href={`/v2/agenda/${agenda.id}`} key={agenda.id} className="flex gap-4 items-center group cursor-pointer mt-2">
                                        <div className="w-16 h-16 bg-navy-600 rounded-full shrink-0 overflow-hidden flex items-center justify-center relative">
                                            {agenda.photo_url ? (
                                                <Image src={agenda.photo_url} alt={agenda.title} fill className="object-cover" />
                                            ) : (
                                                <span className="text-white font-bold text-xs text-center leading-tight uppercase">
                                                    {agenda.date ? format(new Date(agenda.date), 'dd\nMMM', { locale: id }) : 'AGENDA'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h5 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-navy-600 line-clamp-2">{agenda.title}</h5>
                                            <span className="text-xs text-gray-500">
                                                {agenda.date ? format(new Date(agenda.date), 'dd MMMM yyyy', { locale: id }) : ''}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <div className="w-full h-48 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Belum ada agenda</span>
                            </div>
                        )}
                    </div>

                    {/* Gazeter */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader title="Gazeter" icon={<MapPin size={20} />} href="/v2/gazeter" />
                        <Link href="/v2/gazeter" className="flex gap-4 items-start group cursor-pointer">
                            <div className="w-24 h-32 bg-gray-200 rounded-lg shrink-0 overflow-hidden" />
                            <div className="flex flex-col gap-2 pt-1">
                                <h5 className="font-semibold text-gray-900 leading-snug group-hover:text-navy-600">Gazeter Republik Indonesia Tahun 2026 Edisi 2</h5>
                                <span className="text-xs text-gray-500">1 Juli 2026</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Kalender & Map */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 mt-4">
                    {/* Kalender */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon size={20} className="text-gray-900" />
                            <h3 className="font-bold text-lg text-gray-900">Kalender</h3>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-2 text-xs font-bold text-gray-600 border-r border-gray-200 last:border-0">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 grid-rows-5 text-center text-sm">
                                {/* Dummy Calendar Cells */}
                                {Array.from({length: 35}).map((_, i) => (
                                    <div key={i} className={`py-3 border-r border-b border-gray-100 last:border-r-0 ${i < 2 || i > 31 ? 'text-gray-400 bg-gray-50/50' : 'text-gray-900 font-medium hover:bg-gray-50 cursor-pointer'} ${i === 3 ? 'bg-yellow-50 text-yellow-700' : ''}`}>
                                        {(i % 31) + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Rekap Nama Rupabumi */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapIcon size={20} className="text-gray-900" />
                            <h3 className="font-bold text-lg text-gray-900">Rekap Nama Rupabumi</h3>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl w-full h-[300px] flex items-center justify-center relative overflow-hidden">
                            <MiniIndonesiaMap />
                        </div>
                    </div>
                </div>

            </div>
        </PublicLayout>
    )
}

export default function BerandaPage() {
    return (
        <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center bg-gray-50">
                <span className="text-sm font-semibold text-gray-500 animate-pulse">Memuat...</span>
            </div>
        }>
            <BerandaContent />
        </Suspense>
    )
}