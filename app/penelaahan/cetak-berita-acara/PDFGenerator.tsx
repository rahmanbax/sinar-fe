"use client"
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import BeritaAcaraPDF from './BeritaAcaraPDF';

interface TableRow {
    no: number;
    wilayah: string;
    dataAwal: number;
    ditelaah: number;
    diterima: number;
    ditolak: number;
}

interface PDFGeneratorProps {
    nomorBeritaAcara: string;
    namaPembukaAcara: string;
    jabatanPembukaAcara: string;
    instansiTerlibat: string;
    tableData: TableRow[];
    totalData?: number;
    handledData?: number;
    elements?: string[];
}

export async function generatePDF(props: PDFGeneratorProps): Promise<Blob> {
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