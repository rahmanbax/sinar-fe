"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon, MenuIcon, Calendar, Home, Inbox, Search, Settings, Menu } from "lucide-react"
import { useGeolocated } from "react-geolocated"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'

import PublicSidebar from "./PublicSidebar"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export interface IPublicTopNav {
  isMobile: boolean
  toggleSidebar?: () => void
  menuItems: { label: string, href: string, variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" }[]
  setOpenLoginDialog: (open: boolean) => void
}

const PublicTopNav: React.FC<React.PropsWithChildren<IPublicTopNav>> = ({ isMobile, menuItems = [], setOpenLoginDialog  }) => {

    const pathname = usePathname()
    const { user } = useAuth()

    const [hovered, setHovered] = useState<string | null>(null)

    return (
        <NavigationMenu
        viewport={isMobile}
        className="flex py-3 px-5 min-w-screen items-center justify-between fixed bg-neutral-50 z-10 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.1)]"
      >
        {/* Left Section (Logo + Title) */}
        <Link href="/" className="flex items-center gap-2">
          <div className="px-3">
            <Image src="/logo.png" width={50} height={50} alt="logo" />
          </div>
          <h1 className="text-lg md:text-xl font-bold uppercase">
            Sistem Informasi Nama Rupabumi
          </h1>
        </Link>        

        <NavigationMenuList className="hidden lg:flex lg:flex-1 justify-end gap-5 ml-auto px-5">
            {menuItems && menuItems.length &&
                menuItems.map((item) => (  
                <NavigationMenuItem key={item.label}>
                    <Link href={item.href}>
                        <Button 
                            className={`text-lg ${item.href === pathname ? 'text-[#1378B7] font-bold' : 'font-normal'}`} 
                            onMouseEnter={() => setHovered(item.href)}
                            onMouseLeave={() => setHovered(null)}
                            variant={hovered === item.href ? 'outline' : item.variant ?? 'ghost'}
                        >
                            {item.label}
                        </Button>
                    </Link>
                  </NavigationMenuItem>
                ))
            }
            {!user && (
              <NavigationMenuItem>
              <Button 
                className="text-lg hover:bg-[#1378B7] hover:text-neutral-50" 
                variant="outline"
                onClick={() => setOpenLoginDialog(true)}
              >
                  Login
              </Button>
            </NavigationMenuItem>
            )}
            
        </NavigationMenuList>
        <PublicSidebar menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog}/>
      </NavigationMenu>
    )
}
export default PublicTopNav