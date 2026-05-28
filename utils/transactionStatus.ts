export const getBadgeColor = (statusNum: number | undefined): string => {
    if (statusNum === 4) return 'green';
    if (statusNum === 3) return 'blue';
    if (statusNum === 2) return 'orange';
    if (statusNum === 1) return 'red';
    if (statusNum === 0) return 'slate';
    if (statusNum === -1) return 'rose';
    return 'gray';
};

export const getBadgeLabel = (statusNum: number | undefined): string => {
    if (statusNum === 4) return 'Selesai';
    if (statusNum === 3) return 'Rekomendasi';
    if (statusNum === 2) return 'Cetak BA';
    if (statusNum === 1) return 'Closed';
    if (statusNum === 0) return 'Proses Penelaahan';
    if (statusNum === -1) return 'Due';
    return 'Proses Penelaahan';
};
