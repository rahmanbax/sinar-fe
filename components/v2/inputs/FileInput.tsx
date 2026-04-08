import React, { useRef, useState } from 'react'
import { UploadCloud, File as FileIcon, X, Upload } from 'lucide-react'

type FileInputProps = {
    id: string,
    label: string,
    accept?: string,
    onChange: (file: File | null) => void,
    required?: boolean,
    disabled?: boolean,
    instructions?: string,
    maxSizeMB?: number,
    icon?: React.ReactNode
}

const FileInput = ({ id, label, accept, onChange, required, disabled, instructions, maxSizeMB, icon }: FileInputProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        setError(null);
        
        if (files && files.length > 0) {
            const file = files[0];
            
            if (maxSizeMB) {
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > maxSizeMB) {
                    setError(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB`);
                    if (inputRef.current) inputRef.current.value = "";
                    return;
                }
            }
            
            setSelectedFile(file);
            onChange(file);
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedFile(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-black mb-2"
            >
                {label}
            </label>

            <div
                className={`relative w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ' hover:border-navy-300 bg-white'
                    }`}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    type="file"
                    id={id}
                    ref={inputRef}
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                    required={required && !selectedFile}
                />

                {!selectedFile ? (
                    <div className="flex flex-col items-center text-center space-y-1">
                        {icon || <Upload size={20} className='text-gray-500' />}
                        <p className="text-sm font-medium text-black">
                            Pilih file untuk diunggah
                        </p>
                        <p className="text-xs text-gray-500">
                            {instructions || (accept ? `Upload file dengan format: ${accept}` : 'Mendukung semua format file')}
                            {maxSizeMB ? ` (Maks. ${maxSizeMB} MB)` : ''}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center flex-1 min-w-0 pr-4">
                            <FileIcon size={16} className='text-gray-500' />
                            <div className="ml-4 truncate text-left">
                                <p className="text-sm font-medium text-black truncate">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}

export default FileInput
