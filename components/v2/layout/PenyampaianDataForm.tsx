'use client'

import React, { useState } from 'react'
import TextInput from '../inputs/TextInput'
import DropdownInput from '../inputs/DropdownInput'
import ButtonComponent from '../buttons/ButtonComponent'
import { Download } from 'lucide-react'
import FileInput from '../inputs/FileInput'

const jenisFileOptions = [
    {
        label: 'Excel',
        value: 'excel'
    },
    {
        label: 'SHP File',
        value: 'shp'
    }
]

const jenisGeometriOptions = [
    {
        label: 'Point',
        value: 'point'
    },
    {
        label: 'Line',
        value: 'line'
    },
    {
        label: 'Polygon',
        value: 'polygon'
    }
]

const PenyampaianDataForm = () => {
    const [jenisFile, setJenisFile] = useState('');
    const [jenisGeometri, setJenisGeometri] = useState('');

    return (
        <div className="max-w-xl mx-auto space-y-5 p-6 bg-white shadow-sm rounded-lg">
            <TextInput
                id='sumberData'
                label="Sumber Data"
                value=""
                onChange={() => { }}
                required
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <DropdownInput
                    label="Jenis File"
                    value={jenisFile}
                    onChange={(val) => {
                        setJenisFile(val);
                    }}
                    options={jenisFileOptions}
                    required
                />
                <DropdownInput
                    label="Jenis Geometri"
                    value={jenisGeometri}
                    onChange={(val) => { setJenisGeometri(val); }}
                    options={jenisGeometriOptions}
                    disabled={jenisFile === ''}
                    required
                />
                <ButtonComponent
                    icon={<Download size={16} />}
                    label="Download Template"
                    className="w-full col-span-2"
                    disabled={jenisGeometri === ''}
                    secondary={true}
                />
            </div>
            <FileInput
                id="file"
                label="Unggah File"
                onChange={() => { }}
                accept={jenisFile === 'excel' ? '.xlsx' : jenisFile === 'shp' ? '.shp' : ''}
                disabled={jenisFile === ''}
                required
            />
            <ButtonComponent
                label="Buat Penyampaian Data"
                className="w-full"
            />
        </div>
    )
}

export default PenyampaianDataForm