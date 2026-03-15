import React from 'react'
import PublicNavbar from './PublicNavbar'

interface PublicLayoutProps {
    children: React.ReactNode
    isMap?: boolean
}

const PublicLayout = ({ children, isMap = false }: PublicLayoutProps) => {
    return (
        <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden">
            <PublicNavbar />
            <main className="flex-1 w-full overflow-hidden flex flex-col">
                {children}
            </main>

            {!isMap && (
                <footer className="w-full bg-gray-100">
                    <div className="mx-auto p-2 text-center text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} SINAR - Sistem Informasi Nama Rupabumi Nasional.</p>
                    </div>
                </footer>
            )}
        </div>
    )
}

export default PublicLayout
