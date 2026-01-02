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

export interface IReviewerLayout {
    children: React.ReactNode
    navbarRef?: RefObject<HTMLDivElement | null>
}

const ReviewerLayout: React.FC<React.PropsWithChildren<IReviewerLayout>> = ({ children, navbarRef }) => {
    const [openLoginDialog, setOpenLoginDialog] = useState(false)

    const { isMobile } = useIsMobile()

    const menuItems: ISurveyorNav['menuItems'] = [
        { label: 'Penelaahan', href: '/penelaahan' },
        { label: 'Gazeter', href: '/gazeter', variant: 'ghost' },
        { label: 'Pengumuman Nama Rupabumi', href: '/pengumuman', variant: 'ghost' }
    ]

    return (
        <ProtectedRoute allowedRoles={[Role.VERIFICATOR, Role.ADMIN]}>
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

export default ReviewerLayout