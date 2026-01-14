"use client"
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: '15mm 25mm 30mm 30mm',
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
    },
    // Header styles
    header: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 4,
        marginBottom: 24,
        alignItems: 'flex-start',
        gap: 16,
    },
    logo: {
        width: 88,
        height: 100,
    },
    headerTextContainer: {
        flex: 1,
        textAlign: 'center',
    },
    headerTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
    },
    headerAddress: {
        fontSize: 10,
        marginTop: 2,
    },
    // Title styles
    titleContainer: {
        textAlign: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    // Content styles
    contentContainer: {
        marginBottom: 4,
    },
    paragraph: {
        textAlign: 'justify',
        marginBottom: 8,
        fontSize: 10,
    },
    boldText: {
        fontFamily: 'Helvetica-Bold',
    },
    // Table styles
    table: {
        marginTop: 0,
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        backgroundColor: '#E5E7EB', // bg-gray-200
    },
    tableCell: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 4,
        fontSize: 9,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableCellNo: {
        width: '6%',
    },
    tableCellWilayah: {
        width: '28%',
        textAlign: 'left',
    },
    tableCellDataAwal: {
        width: '16%',
    },
    tableCellDitelaah: {
        width: '24%',
    },
    tableCellDiterima: {
        width: '13%',
    },
    tableCellDitolak: {
        width: '13%',
    },
    // Header cells for "Hasil Telaah" span
    tableHeaderHasilTelaah: {
        width: '26%',
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#E5E7EB',
    },
    tableHeaderHasilTelaahText: {
        fontSize: 9,
        textAlign: 'center',
        padding: 4,
        fontFamily: 'Helvetica-Bold',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
    },
    tableHeaderHasilTelaahRow: {
        flexDirection: 'row',
    },
    tableHeaderHasilTelaahCell: {
        width: '50%',
        fontSize: 9,
        textAlign: 'center',
        padding: 4,
        fontFamily: 'Helvetica-Bold',
    },
    tableHeaderHasilTelaahCellFirst: {
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
});

interface TableRow {
    no: number;
    wilayah: string;
    dataAwal: number;
    ditelaah: number;
    diterima: number;
    ditolak: number;
}

interface BeritaAcaraPDFProps {
    nomorBeritaAcara: string;
    namaPembukaAcara: string;
    jabatanPembukaAcara: string;
    instansiTerlibat: string;
    tableData: TableRow[];
    totalData?: number;
    handledData?: number;
    elements?: string[];
}

const BeritaAcaraPDF = ({
    nomorBeritaAcara,
    namaPembukaAcara,
    jabatanPembukaAcara,
    instansiTerlibat,
    tableData,
    totalData = 0,
    handledData = 0,
    elements = []
}: BeritaAcaraPDFProps) => {
    const elementText = elements.join(', ').replace(/, ([^,]*)$/, ' dan $1');
    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo-wiki.png` : '/logo-wiki.png';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Image src={logoUrl} style={styles.logo} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>BADAN INFORMASI GEOSPASIAL</Text>
                        <Text style={styles.headerSubtitle}>( B I G )</Text>
                        <Text style={styles.headerAddress}>Jalan Raya Bogor KM 46, Kawasan Sains dan Teknologi Dr. (H.C.) Ir. H. Soekarno</Text>
                        <Text style={styles.headerAddress}>Cibinong, Bogor, Jawa Barat 16911</Text>
                        <Text style={styles.headerAddress}>Telepon: (021) 875 2062-2063, Faksimile: (021) 875 2064</Text>
                        <Text style={styles.headerAddress}>Situs Web: http://www.big.go.id, e-mail: info@big.go.id</Text>
                        <Text style={styles.headerAddress}>Koordinat: 6o 29' 27.29" LS. 106o 50' 56.08" BT</Text>
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>BERITA ACARA</Text>
                    <Text style={styles.title}>NOMOR: {nomorBeritaAcara?.toUpperCase() || 'MASUKKAN NOMOR BERITA ACARA'}</Text>
                    <Text style={styles.title}>PENELAAHAN NAMA RUPABUMI TINGKAT PUSAT</Text>
                    <Text style={styles.title}>TAHUN 2026</Text>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    {/* Section I */}
                    <Text style={styles.paragraph}>
                        <Text style={styles.boldText}>I.</Text> Pada hari Senin sampai dengan Jumat, tanggal Dua Puluh sampai dengan Dua Puluh Empat bulan Januari tahun Dua Ribu Dua Puluh Lima, telah dilaksanakan kegiatan Penelaahan Nama Rupabumi Tingkat Pusat di Cibinong.
                    </Text>

                    {/* Section II */}
                    <Text style={styles.paragraph}>
                        <Text style={styles.boldText}>II.</Text> Acara secara resmi dibuka oleh {namaPembukaAcara || 'Nama Pembuka Acara'} selaku {jabatanPembukaAcara || 'Jabatan Pembuka Acara'}, Badan Informasi Geospasial (BIG). Acara dihadiri oleh perwakilan dari Badan Informasi Geospasial{instansiTerlibat ? ' dan ' + instansiTerlibat : ''}.
                    </Text>

                    {/* Section III */}
                    <Text style={styles.paragraph}>
                        <Text style={styles.boldText}>III.</Text> Pembahasan dilakukan terhadap {handledData || '...'} dari {totalData || '...'} data nama rupabumi {elements.length > 0 ? `unsur ${elementText}` : 'semua unsur'} yang sudah mencapai status penelaahan Pusat, yang merupakan bagian dari data Tim Kerja Penyelenggaraan Nama Rupabumi Tingkat Pusat pada tanggal 15 Januari 2025.
                    </Text>

                    {/* Section IV */}
                    <Text style={styles.paragraph}>
                        <Text style={styles.boldText}>IV.</Text> Data yang telah ditelaah adalah sebagai berikut:
                    </Text>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    {/* Table Header Row */}
                    <View style={styles.tableRow}>
                        {/* No. */}
                        <View style={[styles.tableCell, styles.tableCellNo, styles.tableHeader, { justifyContent: 'center' }]}>
                            <Text style={styles.boldText}>No.</Text>
                        </View>
                        {/* Keterangan Wilayah */}
                        <View style={[styles.tableCell, styles.tableCellWilayah, styles.tableHeader, { borderLeftWidth: 0, justifyContent: 'center' }]}>
                            <Text style={styles.boldText}>Keterangan Wilayah</Text>
                        </View>
                        {/* Jumlah Data Awal */}
                        <View style={[styles.tableCell, styles.tableCellDataAwal, styles.tableHeader, { borderLeftWidth: 0, justifyContent: 'center' }]}>
                            <Text style={styles.boldText}>Jumlah Data Awal</Text>
                        </View>
                        {/* Jumlah Data yang Ditelaah */}
                        <View style={[styles.tableCell, styles.tableCellDitelaah, styles.tableHeader, { borderLeftWidth: 0, justifyContent: 'center' }]}>
                            <Text style={styles.boldText}>Jumlah Data yang Ditelaah</Text>
                        </View>
                        {/* Hasil Telaah (colspan) */}
                        <View style={[styles.tableHeaderHasilTelaah, { borderLeftWidth: 0 }]}>
                            <Text style={styles.tableHeaderHasilTelaahText}>Hasil Telaah</Text>
                            <View style={styles.tableHeaderHasilTelaahRow}>
                                <Text style={[styles.tableHeaderHasilTelaahCell, styles.tableHeaderHasilTelaahCellFirst]}>Diterima</Text>
                                <Text style={styles.tableHeaderHasilTelaahCell}>Ditolak</Text>
                            </View>
                        </View>
                    </View>

                    {/* Table Body Rows */}
                    {tableData.map((row, index) => (
                        <View key={row.no} style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.tableCellNo, { borderTopWidth: 0 }]}>
                                <Text>{row.no}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellWilayah, { borderTopWidth: 0, borderLeftWidth: 0 }]}>
                                <Text>{row.wilayah}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellDataAwal, { borderTopWidth: 0, borderLeftWidth: 0 }]}>
                                <Text>{row.dataAwal}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellDitelaah, { borderTopWidth: 0, borderLeftWidth: 0 }]}>
                                <Text>{row.ditelaah}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellDiterima, { borderTopWidth: 0, borderLeftWidth: 0 }]}>
                                <Text>{row.diterima}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellDitolak, { borderTopWidth: 0, borderLeftWidth: 0 }]}>
                                <Text>{row.ditolak}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default BeritaAcaraPDF;
