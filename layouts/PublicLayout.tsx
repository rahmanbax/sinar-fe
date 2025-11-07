"use client"
import { useIsMobile } from "@/hooks/use-is-mobile"
import PublicTopNav, { IPublicTopNav } from "@/components/nav/PublicTopNav"
import LoginDialog from "@/components/LoginDialog"
import { useState } from "react"

export interface IPublicLayout {
    children: React.ReactNode
}

const PublicLayout: React.FC<React.PropsWithChildren<IPublicLayout>> = ({ children }) => {
    const [openLoginDialog, setOpenLoginDialog] = useState(false)

    const { isMobile } = useIsMobile()

    const menuItems: IPublicTopNav['menuItems'] = [
        { label: 'Pengumuman Nama Rupabumi', href: '/pengumuman', variant: 'ghost' },
        { label: 'Peta', href: '/', variant: 'ghost' },
        { label: 'Gazeter', href: '/gazeter', variant: 'ghost' },
        { label: 'Bantuan', href: '/bantuan', variant: 'ghost' },
    ]

    return (

        <div className="flex min-h-screen w-full flex-col bg-neutral-50">
            <PublicTopNav isMobile={isMobile} menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog}/>
            <main className="flex-1">
                {children}
            </main>
            <LoginDialog open={openLoginDialog} setOpen={setOpenLoginDialog}/>
        </div>
    )
}

export default PublicLayout