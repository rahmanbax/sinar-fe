"use client"
import { useIsMobile } from "@/hooks/use-is-mobile"
import PublicNav, { IPublicNav } from "@/components/nav/PublicNav"
import LoginDialog from "@/components/LoginDialog"
import { useState } from "react"
import { PiInstagramLogo, PiFacebookLogo, PiXLogo, PiYoutubeLogo, PiLinkedinLogo, PiWhatsappLogo, PiEnvelope } from "react-icons/pi"
import Link from "next/link"
import { usePathname } from "next/navigation"


export interface IPublicLayout {
    children: React.ReactNode
}

const Footer : React.FC = () => {
   return (
    <div className="bg-[#1D3557] text-center flex flex-col lg:flex-row justify-between py-5 px-6 xl:px-28 text-neutral-50">
        <h4>©2025 Badan Informasi Geospasial. All rights reserved.</h4>
        <div className="flex items-center justify-center gap-2">
            <Link href='https://www.instagram.com/infogeospasial/'>
                <PiInstagramLogo size={24}/>
            </Link>
            
            <Link href='https://www.facebook.com/infogeospasial'>
                <PiFacebookLogo size={24}/>
            </Link>
           
            <Link href='https://x.com/InfoGeospasial'>
                <PiXLogo size={24}/>
            </Link>
            <Link href='https://www.youtube.com/@BadanInformasiGeospasial1969'>
                <PiYoutubeLogo size={24}/>
            </Link>
            <Link href='https://www.linkedin.com/company/badaninformasigeospasial/'>
                <PiLinkedinLogo size={24}/>
            </Link>
            
        </div>
        <div className="flex flex-col lg:flex-row">
            <h4 className="mb-2 lg:me-2 lg:mb-0">Hubungi Kami :</h4>
            <div className="flex flex-col items-center md:flex-row justify-center gap-2 lg:gap-0">
                <h4 className="inline-flex"><PiWhatsappLogo size={22} className="lg:me-1"/> +62 898-3163-030</h4>
                <h4 className="hidden md:inline-flex px-2">|</h4>
                <h4 className="inline-flex"><PiEnvelope size={22} className="lg:me-1"/> nna-ina@big.go.id</h4>    
            </div>
           
        </div>
    </div>
   )
}

const PublicLayout: React.FC<React.PropsWithChildren<IPublicLayout>> = ({ children }) => {
    const [openLoginDialog, setOpenLoginDialog] = useState(false)

    const { isMobile } = useIsMobile()

    const pathname = usePathname()

    const menuItems: IPublicNav['menuItems'] = [
        { label: 'Pengumuman Nama Rupabumi', href: '/pengumuman', variant: 'ghost' },
        { label: 'Peta', href: '/', variant: 'ghost' },
        { label: 'Gazeter', href: '/gazeter', variant: 'ghost' },
        { label: 'Bantuan', href: '/bantuan', variant: 'ghost' },
    ]

    return (

        <div className="flex min-h-screen w-full flex-col bg-neutral-50">
            <PublicNav isMobile={isMobile} menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog}/>
            <main className="flex-1">
                {children}
            </main>
            <LoginDialog open={openLoginDialog} setOpen={setOpenLoginDialog}/>
            {pathname !== '/' && <Footer/>}
        </div>
    )
}

export default PublicLayout