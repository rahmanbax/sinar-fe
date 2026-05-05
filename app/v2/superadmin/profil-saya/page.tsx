import MyProfileForm from '@/components/v2/layout/MyProfileForm'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ProfilePage = () => {
  return (
    <DashboardLayout showNav={false}>
      <nav className="flex items-center text-sm text-gray-500 mb-5 gap-2 max-w-xl mx-auto">
        <Link href="/v2/superadmin" className="hover:text-black transition-colors">Dashboard</Link>
        <ChevronRight size={14} />
        <span className="text-black">Profil Saya</span>
      </nav>
      <MyProfileForm/>
    </DashboardLayout>
  )
}

export default ProfilePage