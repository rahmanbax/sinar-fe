"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"
import { useGeolocated } from "react-geolocated"
import { useIsMobile } from "@/hooks/use-is-mobile"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export interface IPublicLayout {
    children: React.ReactNode
}

export interface IPublicNavigationMenu {
    isMobile: boolean
}

const PublicNavigationMenu: React.FC<React.PropsWithChildren<IPublicNavigationMenu>> = ({ isMobile }) => {
    return (
        <NavigationMenu viewport={isMobile} className="flex justify-between py-3 px-5 min-w-screen">
            <Link href="/" className="flex align-middle items-center gap-2">
                <div className="px-5">
                    <Image src="/logo.png" width={65} height={65} alt="logo"/>
                </div>
                <h1 className="text-2xl font-bold uppercase">Sistem Informasi Nama Rupabumi</h1>
            </Link>
            <NavigationMenuList className="flex-wrap py-3 px-5 gap-5">
                <NavigationMenuItem>
                    <Button variant="ghost"><h2 className="text-lg">Pengumuman Nama Rupabumi</h2></Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Button variant="ghost">
                        <h2 className="text-lg">Peta</h2>
                    </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Button variant="ghost">
                        <h2 className="text-lg">Gazeter</h2>
                    </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Button variant="ghost">
                        <h2 className="text-lg">Bantuan</h2>
                    </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Button variant="secondary">
                        <h2 className="text-lg">Login</h2>
                    </Button>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

const PublicLayout: React.FC<React.PropsWithChildren<IPublicLayout>> = ({ children }) => {
    const { isMobile } = useIsMobile()
    
    return (
        <main className="min-w-screen min-h-screen">
            <PublicNavigationMenu isMobile={isMobile} />
             {children}
        </main>
    )
}

export default PublicLayout