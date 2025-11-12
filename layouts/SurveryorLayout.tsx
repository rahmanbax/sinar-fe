"use client"
import { useIsMobile } from "@/hooks/use-is-mobile"
import SurveyorNav, { ISurveyorNav } from "@/components/nav/SurveyorNav"
import LoginDialog from "@/components/LoginDialog"
import { RefObject, useState } from "react"
import { PiInstagramLogo, PiFacebookLogo, PiXLogo, PiYoutubeLogo, PiLinkedinLogo, PiWhatsappLogo, PiEnvelope } from "react-icons/pi"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Footer : React.FC = () => {
   return (
    <div className="bg-muted text-center flex justify-end py-2 px-6 text-muted-foreground">
        <h4>©2025 Badan Informasi Geospasial. All rights reserved.</h4>
    </div>
   )
}

export interface ISurveyorLayout {
    children: React.ReactNode
    navbarRef?:  RefObject<HTMLDivElement | null>
}

const SurveyorLayout: React.FC<React.PropsWithChildren<ISurveyorLayout>> = ({ children, navbarRef }) => {
    const [openLoginDialog, setOpenLoginDialog] = useState(false)

    const { isMobile } = useIsMobile()

    const pathname = usePathname()

    const menuItems: ISurveyorNav['menuItems'] = [
        { label: 'Beranda', href: '/' },
        { label: 'Dashboard', href: '/survey'},
        { label: 'Rapor Nama Rupabumi', href: '/rapor'},
        { label: 'Gazeter', href: '/gazeter', variant: 'ghost' },
        { label: 'Pengumuman Nama Rupabumi', href: '/pengumuman', variant: 'ghost' }
    ]

    return (

        <div className="flex w-full flex-col h-screen bg-neutral-50">
            <SurveyorNav isMobile={isMobile} menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog} navbarRef={navbarRef}/>
            <main className="flex-1 bg-white flex flex-col h-full">
                {children}
                <Footer/>
            </main>
            <LoginDialog open={openLoginDialog} setOpen={setOpenLoginDialog}/>
            
        </div>
    )
}

export default SurveyorLayout