"use client"
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import BeritaAcaraPDF, { BeritaAcaraPDFProps } from './BeritaAcaraPDF';

export async function generatePDF(props: BeritaAcaraPDFProps): Promise<Blob> {
    try {
        const doc = <BeritaAcaraPDF {...props} />;
        const asPdf = pdf(doc);
        const blob = await asPdf.toBlob();
        return blob;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
