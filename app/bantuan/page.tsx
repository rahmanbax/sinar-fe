"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import { IoPlaySharp } from "react-icons/io5";
import { useGeolocated } from "react-geolocated";
import { useApiHandler } from "@/utils/apiHandler";
import { NRB } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

const FaqPanel: React.FC = () => {
    return (
        <>
            <div className="text-center mb-12">
                <h2 className="text-2xl font-bold italic capitalize">Frequently Asked Question</h2>
                <h5 className="text-lg font-normal">(Pertanyaan yang sering ditanyakan)</h5>
            </div>

            <div className="pe-4 md:px-24 lg:px-48 flex flex-col gap-6 text-justify">
                <div className="flex gap-5 items-start">
                    <div className="shrink-0">
                        <IoPlaySharp size={32} color="#9F9D9D" />
                    </div>
                    <div className="grow">
                        <h5 className="font-bold">Dimana bisa unduh aplikasi Android SINAR?</h5>
                        <p>Aplikasi Android SINAR dapat diunduh di Play Store dengan mengetikkan kata kunci “SINAR Toponim”</p>
                    </div>
                </div>
                <div className="flex gap-5 items-start">
                    <div className="shrink-0">
                        <IoPlaySharp size={32} color="#9F9D9D" />
                    </div>
                    <div className="grow">
                        <h5 className="font-bold">Apakah SINAR bisa dipakai di iPhone?</h5>
                        <p>Belum bisa. Aplikasi SINAR saat ini hanya bisa dipakai di OS Android saja</p>
                    </div>
                </div>
                <div className="flex gap-5 items-start">
                    <div className="shrink-0">
                        <IoPlaySharp size={32} color="#9F9D9D" />
                    </div>
                    <div className="grow">
                        <h5 className="font-bold">Berapa lama masa waktu Pengumuman?</h5>
                        <p>Masa pengumuman dilakukan selama 30 hari kerja</p>
                    </div>
                </div>
            </div>
            <ContactSection />
        </>
    )
}

const GuidePanel: React.FC = () => {
    return (
        <>
            <div className="flex justify-center">
                <Input
                    placeholder="Cari Panduan..."
                    className="w-4/5 md:w-2/5"
                />
            </div>


            <div className="grid justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 mt-8">
                {Array.from({ length: 8 }, (_, index) => (
                    <div key={index} className="flex justify-center">
                        <div className="flex flex-col gap-2 w-fit">
                            <div className="bg-[#B2B2B2] py-8 flex justify-center items-center cursor-pointer">
                                <IoPlaySharp size={72} color="#FFFFFF" style={{ filter: 'drop-shadow(1px 1px 2.5px rgba(0, 0, 0, 0.5))' }} />
                            </div>
                            <Button variant='outline' className="w-max">
                                <Download />
                                Panduan Mendaftar SINAR
                            </Button>
                        </div>
                    </div>

                ))}
            </div>
        </>

    )
}

const DiscussionPanel: React.FC = () => {
    const DiscussionMenu = {
        'Pendaftaran': [
            {
                title: 'Lorem Ipsum Pendaftaran 1',
                desc: 'Lorem Ipsum Pendaftaran 1'
            },
            {
                title: 'Lorem Ipsum Pendaftaran 2',
                desc: 'Lorem Ipsum Pendaftaran 2'
            }
        ],
        'Pengumpulan': [
            {
                title: 'Apa beda antara Pendataan dengan Pemberian Nama? 1',
                desc: 'Pendataan data nama rupabumi untuk mengumpulkan data yang sudah bernama sedangkan Pemberian nama untuk memberikan nama untuk objek yang belum bernama'
            },
            {
                title: 'Apa beda antara Pendataan dengan Pemberian Nama? 2',
                desc: 'Pendataan data nama rupabumi untuk mengumpulkan data yang sudah bernama sedangkan Pemberian nama untuk memberikan nama untuk objek yang belum bernama'
            },
            {
                title: 'Apa beda antara Pendataan dengan Pemberian Nama? 3',
                desc: 'Pendataan data nama rupabumi untuk mengumpulkan data yang sudah bernama sedangkan Pemberian nama untuk memberikan nama untuk objek yang belum bernama'
            },
            {
                title: 'Apa beda antara Pendataan dengan Pemberian Nama? 4',
                desc: 'Pendataan data nama rupabumi untuk mengumpulkan data yang sudah bernama sedangkan Pemberian nama untuk memberikan nama untuk objek yang belum bernama'
            },
            {
                title: 'Apa beda antara Pendataan dengan Pemberian Nama? 5',
                desc: 'Pendataan data nama rupabumi untuk mengumpulkan data yang sudah bernama sedangkan Pemberian nama untuk memberikan nama untuk objek yang belum bernama'
            }
        ],
        'Penelaahan': [
            {
                title: 'Lorem Ipsum Penelaahan',
                desc: 'Lorem Ipsum Penelaahan'
            }
        ],
        'Pengumuman': [
            {
                title: 'Lorem Ipsum Pengumuman',
                desc: 'Lorem Ipsum Pengumuman'
            }
        ],
        'Perubahan': [
            {
                title: 'Lorem Ipsum Perubahan',
                desc: 'Lorem Ipsum Perubahan'
            }
        ],
        'Penetapan': [
            {
                title: 'Lorem Ipsum Penetapan',
                desc: 'Lorem Ipsum Penetapan'
            }
        ],
        'Layanan Data': [
            {
                title: 'Lorem Ipsum Layanan Data',
                desc: 'Lorem Ipsum Layanan Data'
            }
        ],
        'Pembinaan Teknis': [
            {
                title: 'Lorem Ipsum Pembinaan Teknis',
                desc: 'Lorem Ipsum Pembinaan Teknis'
            }
        ],
        'Peraturan & Kebijakan': [
            {
                title: 'Lorem Ipsum Peraturan & Kebijakan',
                desc: 'Lorem Ipsum Peraturan & Kebijakan'
            }
        ],
    }

    const [menu, setMenu] = useState<keyof typeof DiscussionMenu>('Pengumpulan')
    const menuScrollRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: "left" | "right") => {
        if (menuScrollRef.current) {
          const scrollAmount = 150; // adjust as you like
          menuScrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
          });
        }
      };

    return (
        <>
            <div className="flex flex-col sm:flex-row md:px-10 lg:px-30 gap-6 text-justify">
                <div className="flex items-center">
                    <button className="hover:bg-accent p-1 rounded-sm">
                        <ChevronLeft className="sm:hidden"  onClick={() => scroll("left")}/>
                    </button>
                    <div ref={menuScrollRef} className="flex overflow-auto scrollbar-hover-hidden sm:flex-col gap-x-1 mx-3">
                        {Object.keys(DiscussionMenu).map(item => (
                            <Button key={item} variant='ghost' className={`text-md font-bold sm:justify-end sm:text-right rounded-none ${item === menu && 'border-b border-black'}`} onClick={() => setMenu(item as typeof menu)}>
                                {item}
                            </Button>
                        ))}
                    </div>
                    <button className="hover:bg-accent p-1 rounded-sm">
                        <ChevronRight  className="sm:hidden" onClick={() => scroll("right")}/>
                    </button>
                </div>

                <Separator orientation="vertical" className="border-[0.5px] border-black" />
                <div className="group grow h-[50vh]">
                    <div className="w-full h-full flex flex-col lg:px-8 gap-5 overflow-y-scroll scrollbar-hover-hidden">
                        {DiscussionMenu[menu].map(item => (
                            <div key={item.title} className="flex gap-5 items-start">
                                <div className="shrink-0">
                                    <IoPlaySharp size={32} color="#9F9D9D" />
                                </div>
                                <div className="grow">
                                    <h5 className="font-bold">{item.title}</h5>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ContactSection />
        </>
    )
}

const ContactSection: React.FC = () => {
    return (
        <div className="mt-8 w-full sm:w-3/4 pe-4 md:px-18 lg:px-32">
            <Separator className="border-[0.5px] border-black" />
            <div className="max-w-xl text-sm text-black mt-3">
                <h2 className="text-lg font-semibold mb-1">Kontak Kami</h2>

                <div className="space-y-1">
                    <div className="grid grid-cols-[150px_auto]">
                        <span>Email</span>
                        <span>: nna-ina@big.go.id</span>
                    </div>

                    <div className="grid grid-cols-[150px_auto]">
                        <span>WA/Telepon</span>
                        <span>: 0898-3163-030</span>
                    </div>

                    <div className="grid grid-cols-[150px_auto]">
                        <span>Fax</span>
                        <span>: 021 8752064; 021 87901254</span>
                    </div>

                    <div className="grid grid-cols-[150px_auto]">
                        <span>Alamat</span>
                        <span>
                            : Jalan Raya Jakarta-Bogor KM 46, Cibinong,<br />
                            &nbsp;&nbsp;Kabupaten Bogor, Jawa Barat 16911
                        </span>
                    </div>

                    <div className="grid grid-cols-[150px_auto]">
                        <span>Waktu Operasional</span>
                        <span>: Senin - Jumat, Pukul 09.00 - 15.00 WIB</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Page = () => {
    const { coords, } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: true,
        },
        userDecisionTimeout: 10000,
        watchPosition: true,
    });

    const isInitialLoad = useRef(true)
    const [loading, setLoading] = useState(false)
    const apiHandler = useApiHandler({ setLoading, shouldHandleError: true })
    const [apiData, setData] = useState<NRB[]>([])
    const [searchString, setSearchString] = useState<string | undefined>()
    const [panel, setPanel] = useState('guide')

    const handleChangePanel = (panel: 'faq' | 'guide' | 'discussion') => {
        setPanel(panel)
    }

    const refresh = useCallback(() => {

    }, [apiHandler, searchString])

    useEffect(refresh, [refresh])

    return (
        <PublicLayout>
            <div className="mt-24">
                <div className="flex justify-center">
                    <div className="flex gap-2 mt-4 h-10">
                        <Button variant='outline' onClick={() => handleChangePanel('faq')} className={`${panel === 'faq' && 'bg-[#A8DADC]'}`}>FAQ</Button>
                        <Button variant='outline' onClick={() => handleChangePanel('guide')} className={`${panel === 'guide' && 'bg-[#A8DADC]'}`}>Panduan Pengguna</Button>
                        <Button variant='outline' onClick={() => handleChangePanel('discussion')} className={`${panel === 'discussion' && 'bg-[#A8DADC]'}`}>Diskusi</Button>
                    </div>
                </div>
                <div className="mt-10 mx-8 mb-16">
                    {panel === 'faq' && <FaqPanel />}
                    {panel === 'guide' && <GuidePanel />}
                    {panel === 'discussion' && <DiscussionPanel />}
                </div>
            </div>

        </PublicLayout>

    );
}

export default Page