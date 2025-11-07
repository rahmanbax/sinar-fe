import Link from "next/link"
import { useEffect, useState } from "react"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon, MenuIcon, Calendar, Home, Inbox, Search, Settings, Menu } from "lucide-react"
import { useGeolocated } from "react-geolocated"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

import {
  Sheet,
  SheetTrigger,
  SheetContent, 
  SheetTitle,
  SheetHeader
} from '@/components/ui/sheet'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export interface IPublicSidebar {
  menuItems: { label: string, href: string }[]
  setOpenLoginDialog: (open: boolean) => void
}

const PublicSidebar: React.FC<React.PropsWithChildren<IPublicSidebar>> = ({ menuItems, setOpenLoginDialog }) => {
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

export default PublicSidebar
