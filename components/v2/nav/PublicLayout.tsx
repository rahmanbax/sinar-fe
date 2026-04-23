import React from 'react'
import PublicNavbar from './PublicNavbar'
import Footer from './Footer'

interface PublicLayoutProps {
    children: React.ReactNode
    isMap?: boolean
}

const PublicLayout = ({ children, isMap = false }: PublicLayoutProps) => {
    return (
        <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden">
            <PublicNavbar />
            <div className="flex-1 w-full overflow-y-auto flex flex-col">
                <main className="flex-1 w-full flex flex-col">
                    {children}
                </main>

                {!isMap && (
                    <Footer />
                )}
            </div>
        </div>
    )
}

export default PublicLayout
