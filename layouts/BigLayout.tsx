"use client"
import { useIsMobile } from "@/hooks/use-is-mobile"
import UserNav, { ISurveyorNav } from "@/components/nav/UserNav"
import LoginDialog from "@/components/LoginDialog"
import { RefObject, useState } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Role } from "@/types/User"

const Footer: React.FC = () => {
    return (
        <div className="bg-muted text-center flex justify-end py-2 px-6 text-muted-foreground">
            <h4>©2025 Badan Informasi Geospasial. All rights reserved.</h4>
        </div>
    )
}

export interface IBigLayout {
    children: React.ReactNode
    navbarRef?: RefObject<HTMLDivElement | null>
}

const BigLayout: React.FC<React.PropsWithChildren<IBigLayout>> = ({ children, navbarRef }) => {
    const [openLoginDialog, setOpenLoginDialog] = useState(false)

    const { isMobile } = useIsMobile()

    const menuItems: ISurveyorNav['menuItems'] = [
        { label: 'Dashboard', href: '/big' },
        { label: 'Pengumuman', href: '/big/pengumuman' },
        { label: 'Gazeter', href: '/gazeter', variant: 'ghost' },
    ]

    return (
        <ProtectedRoute allowedRoles={[Role.BIG, Role.ADMIN]}>
            <div className="flex w-full flex-col h-screen bg-neutral-50">
                <UserNav isMobile={isMobile} menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog} navbarRef={navbarRef} />
                <main className="flex-1 bg-white flex flex-col h-full">
                    {children}
                    <Footer />
                </main>
                <LoginDialog open={openLoginDialog} setOpen={setOpenLoginDialog} />
            </div>
        </ProtectedRoute>
    )
}

export default BigLayout
