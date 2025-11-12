"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Menu } from "lucide-react"


interface Sidebar {
  menuItems: { label: string, href: string }[]
  setOpenLoginDialog: (open: boolean) => void
}

const Sidebar: React.FC<React.PropsWithChildren<Sidebar>> = ({ menuItems, setOpenLoginDialog }) => {
  const [open, setOpen] = useState(false)

  const { user } = useAuth()

  const pathname = usePathname()

  return (
    <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-4">
            <SheetHeader className="p-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="px-3">
                <Image src="/logo.png" width={100} height={70} alt="logo" />
              </div>
              <SheetTitle className="text-md font-bold uppercase">
                Sistem Informasi Nama Rupabumi
              </SheetTitle>
            </Link>     
            </SheetHeader>  
            <div className="flex flex-col gap-3 mt-8">
              {menuItems.map((item) => (
                <div key={item.href}>
                  <Button variant='ghost' className="block w-full text-start" onClick={() => {if (item.href === pathname) setOpen(!open)}}>
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                <Separator className="mt-2"/>
                </div>
              ))}

                {!user && 
                (<>
                  <Button variant='ghost' className="block w-full text-start" onClick={() => setOpenLoginDialog(true)}>
                   Masuk
                  </Button>
                  <Separator/>
                </>)}
                
            </div>
          </SheetContent>
        </Sheet>
      </div>
  )
}

export interface IPublicNav {
  isMobile: boolean
  toggleSidebar?: () => void
  menuItems: { label: string, href: string, variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" }[]
  setOpenLoginDialog: (open: boolean) => void
}

const PublicNav: React.FC<React.PropsWithChildren<IPublicNav>> = ({ isMobile, menuItems = [], setOpenLoginDialog  }) => {

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
        <Sidebar menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog}/>
      </NavigationMenu>
    )
}
export default PublicNav