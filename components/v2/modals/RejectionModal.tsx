import React, { useState } from 'react';
import { X } from 'lucide-react';
import ButtonComponent from '../buttons/ButtonComponent';
import TextBoxInput from '../inputs/TextBoxInput';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (note: string) => void;
    title?: string;
}

const RejectionModal = ({ isOpen, onClose, onSubmit, title = "Tolak Pendaftaran" }: RejectionModalProps) => {
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit(note);
        setNote('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg w-full max-w-md p-6 space-y-5 shadow-xl">
                <div className='flex items-center justify-between'>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <TextBoxInput
                        id="rejection_note"
                        label="Alasan Penolakan"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required={true}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6 pt-2 border-t border-gray-100">
                    <ButtonComponent
                        label="Batalkan"
                        onClick={onClose}
                        secondary
                        className='w-full'
                    />
                    <ButtonComponent
                        label="Kirim Penolakan"
                        onClick={handleSubmit}
                        className='w-full'
                        disabled={!note.trim()}
                    />
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;