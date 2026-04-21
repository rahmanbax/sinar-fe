import React from 'react'
import Image from 'next/image'
import { Download, ExternalLink } from 'lucide-react'

interface GazeterCardProps {
    src: string;
    altName: string;
    title: string;
}

const GazeterCard = ({ src, altName, title }: GazeterCardProps) => {
    return (
        <div className='space-y-3'>
            <Image
                src={src}
                alt={altName}
                width={0}
                height={0}
                sizes="100vw"
                className='w-full h-auto rounded-lg'
            />
            <h3 className='font-semibold text-black w-full'>{title}</h3>
            <div className='flex items-center gap-1 md:gap-3 text-navy-500 text-sm md:text-base'>
                <div className='flex items-center gap-1'>
                    <ExternalLink size={16} />
                    <p className='text-sm'>Lihat</p>
                </div>
                <span className='w-1 h-1 bg-gray-200 rounded-full' />
                <div className='flex items-center gap-1'>
                    <Download size={16} />
                    <p className='text-sm'>Unduh</p>
                </div>
            </div>
        </div>
    )
}

export default GazeterCard