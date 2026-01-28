"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefObject, useState } from "react"

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
import { Bell, ChevronDown, CircleQuestionMark, CircleUserRound, Edit, Loader2, LogOut, Mail, Menu } from "lucide-react"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Avatar } from "../ui/avatar"


interface ISidebar {
  menuItems: { label: string, href: string }[]
  setOpenLoginDialog: (open: boolean) => void
}

const Sidebar: React.FC<React.PropsWithChildren<ISidebar>> = ({ menuItems, setOpenLoginDialog }) => {
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
            <div className="flex items-center gap-2">
              <Link href="/profile" target="_blank" className="px-3 shrink rounded-full">
                {/* <CircleUserRound size={70} /> */}
                <Avatar className="w-16 h-16">
                  <CircleUserRound size="max" />
                </Avatar>
              </Link>
              <SheetTitle className="sr-only">
                Sistem Informasi Nama Rupabumi
              </SheetTitle>
              <div className="flex flex-col grow">
                <h5 className="">{user?.name || 'User'}</h5>
                <Link href="/profile" className="text-xs flex items-center gap-1">
                  <span>Edit Profil</span> <Edit size={15} />
                </Link>
                <div className="flex gap-3">
                  <button ><Mail size={16} /></button>
                  <button><CircleQuestionMark size={16} /></button>
                </div>
              </div>
            </div>
          </SheetHeader>
          <div className="flex flex-col gap-3 mt-4">
            {/* Role-based menu items */}
            {(user?.role === 'surveyor' || user?.role === 'contributor') && (
              <div>
                <Button variant='ghost' className="block w-full text-start" onClick={() => { if ('/survey' === pathname) setOpen(!open) }}>
                  <Link href="/survey">Menu Surveyor</Link>
                </Button>
                <Separator className="mt-2" />
              </div>
            )}
            {user?.role === 'verificator' && (
              <div>
                <Button variant='ghost' className="block w-full text-start" onClick={() => { if ('/penelaahan' === pathname) setOpen(!open) }}>
                  <Link href="/penelaahan">Menu Penelaahan</Link>
                </Button>
                <Separator className="mt-2" />
              </div>
            )}
            {user?.role === 'big' && (
              <div>
                <Button variant='ghost' className="block w-full text-start" onClick={() => { if ('/big' === pathname) setOpen(!open) }}>
                  <Link href="/big">Menu BIG</Link>
                </Button>
                <Separator className="mt-2" />
              </div>
            )}
            {user?.role === 'admin' && (
              <>
                <div>
                  <Button variant='ghost' className="block w-full text-start" onClick={() => { if ('/survey' === pathname) setOpen(!open) }}>
                    <Link href="/survey">Menu Surveyor</Link>
                  </Button>
                  <Separator className="mt-2" />
                </div>
                <div>
                  <Button variant='ghost' className="block w-full text-start" onClick={() => { if ('/penelaahan' === pathname) setOpen(!open) }}>
                    <Link href="/penelaahan">Menu Penelaahan</Link>
                  </Button>
                  <Separator className="mt-2" />
                </div>
                <div>
                  <Button variant='ghost' className="block w-full text-start" onClick={() => { if ('/big' === pathname) setOpen(!open) }}>
                    <Link href="/big">Menu BIG</Link>
                  </Button>
                  <Separator className="mt-2" />
                </div>
              </>
            )}

            {menuItems.map((item) => (
              <div key={item.href}>
                <Button variant='ghost' className="block w-full text-start" onClick={() => { if (item.href === pathname) setOpen(!open) }}>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
                <Separator className="mt-2" />
              </div>
            ))}

          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export interface ISurveyorNav {
  isMobile: boolean
  toggleSidebar?: () => void
  menuItems: { label: string, href: string, variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" }[]
  setOpenLoginDialog: (open: boolean) => void
  navbarRef?: RefObject<HTMLDivElement | null>
}

const UserNav: React.FC<React.PropsWithChildren<ISurveyorNav>> = ({ isMobile, menuItems = [], setOpenLoginDialog, navbarRef }) => {

  const pathname = usePathname()
  const { user, logout, isLoggingOut } = useAuth()

  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <NavigationMenu
      id="surveyor-navbar"
      ref={navbarRef}
      viewport={isMobile}
      className="flex py-3 pl-5 pr-8 min-w-screen justify-between lg:justify-start items-center fixed bg-neutral-50 z-10 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.1)]"
    >
      {/* Left Section (Logo + Title) */}
      <Link href="/" className="flex items-center gap-2 lg:max-w-80">
        <div className="px-3">
          <Image src="/logo.png" width={50} height={50} alt="logo" />
        </div>
        <h1 className="text-lg font-bold uppercase hidden sm:block">
          Sistem Informasi Nama Rupabumi
        </h1>
      </Link>

      <NavigationMenuList className="hidden lg:flex gap-3 ml-auto px-3">
        {menuItems && menuItems.length &&
          menuItems.map((item) => (
            <NavigationMenuItem key={item.label}>
              <Link href={item.href}>
                <Button
                  className={`text-md max-w-80 whitespace-normal h-20 min-[1250]:h-auto ${pathname === item.href ? 'text-[#1378B7] font-bold' : 'font-normal'}`}
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

      </NavigationMenuList>
      <Sidebar menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog} />
      {/** I want this element to be positioned in right end */}
      <div className="hidden lg:flex items-center gap-2 ml-auto">
        <Button size="icon" variant="ghost" className="rounded-full">
          <Bell />
        </Button>
        <Menubar className="w-fit min-[1250]:w-40 h-10 p-0 items-center justify-self-end">
          <MenubarMenu>
            <MenubarTrigger className="hover:bg-accent w-full justify-between h-full py-0">
              <div className="flex gap-2 items-center">
                <CircleUserRound size={24} />
                <h5 className="hidden min-[1250]:flex">{user?.name || 'User'}</h5>
              </div>
              <ChevronDown size={20} className="text-muted-foreground" />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>
                Halo, {user?.name || 'User'}!
              </MenubarItem>
              <MenubarSeparator />
              {(user?.role === 'surveyor' || user?.role === 'contributor') && (
                <MenubarItem asChild>
                  <Link href="/survey">
                    Menu Surveyor
                  </Link>
                </MenubarItem>
              )}
              {user?.role === 'verificator' && (
                <MenubarItem asChild>
                  <Link href="/penelaahan">
                    Menu Penelaahan
                  </Link>
                </MenubarItem>
              )}
              {user?.role === 'big' && (
                <MenubarItem asChild>
                  <Link href="/big">
                    Menu BIG
                  </Link>
                </MenubarItem>
              )}
              {user?.role === 'admin' && (
                <>
                  <MenubarItem asChild>
                    <Link href="/survey">
                      Menu Surveyor
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/penelaahan">
                      Menu Penelaahan
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/big">
                      Menu BIG
                    </Link>
                  </MenubarItem>
                </>
              )}
              <MenubarSeparator />
              <MenubarItem>
                <CircleUserRound /> Ubah Profil
              </MenubarItem>
              <MenubarItem>
                <Mail /> Daftar pesan
              </MenubarItem>
              <MenubarItem>
                <CircleQuestionMark /> Bantuan
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={logout} disabled={isLoggingOut} className="">
                {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
                {isLoggingOut ? 'Logging out...' : 'Keluar'}
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

    </NavigationMenu>
  )
}
export default UserNav