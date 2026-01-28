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
import { ChevronDown, CircleUserRound, Loader2, LogOut, Menu } from "lucide-react"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"


interface Sidebar {
  menuItems: { label: string, href: string }[]
  setOpenLoginDialog: (open: boolean) => void
}

const Sidebar: React.FC<React.PropsWithChildren<Sidebar>> = ({ menuItems, setOpenLoginDialog }) => {
  const [open, setOpen] = useState(false)

  const { user, isLoading, logout, isLoggingOut } = useAuth()

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

          {/* User Info Section */}
          {user && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-gray-100 rounded-lg">
              <CircleUserRound size={40} />
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-4">
            {/* Role-based menu items */}
            {user && (
              <>
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

            {!isLoading && !user &&
              (<>
                <Button variant='ghost' className="block w-full text-start" onClick={() => setOpenLoginDialog(true)}>
                  Masuk
                </Button>
                <Separator />
              </>)}

            {user && (
              <>
                <Button
                  variant='ghost'
                  className="block w-full text-start"
                  onClick={logout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Keluar'}
                </Button>
                <Separator />
              </>
            )}

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

const PublicNav: React.FC<React.PropsWithChildren<IPublicNav>> = ({ isMobile, menuItems = [], setOpenLoginDialog }) => {

  const pathname = usePathname()
  const { user, isLoading, logout, isLoggingOut } = useAuth()

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
        <h1 className="text-lg font-bold uppercase hidden sm:block">
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
        {!isLoading && !user && (
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

        {/* User Menu when logged in */}
        {!isLoading && user && (
          <NavigationMenuItem>
            <Menubar className="w-fit h-10 p-0 items-center border-none bg-transparent">
              <MenubarMenu>
                <MenubarTrigger className="hover:bg-accent justify-between h-full py-0 px-3 gap-2">
                  <CircleUserRound size={24} />
                  <span className="hidden min-[1250px]:inline">{user.name}</span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem disabled>
                    Halo, {user.name}!
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
                  <MenubarItem asChild>
                    <Link href="/profile">
                      <CircleUserRound size={16} className="mr-2" /> Ubah Profil
                    </Link>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={logout} disabled={isLoggingOut}>
                    {isLoggingOut ? <Loader2 className="animate-spin mr-2" size={16} /> : <LogOut size={16} className="mr-2" />}
                    {isLoggingOut ? 'Logging out...' : 'Keluar'}
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </NavigationMenuItem>
        )}

      </NavigationMenuList>
      <Sidebar menuItems={menuItems} setOpenLoginDialog={setOpenLoginDialog} />
    </NavigationMenu>
  )
}
export default PublicNav