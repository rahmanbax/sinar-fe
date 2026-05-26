export const formatRoleName = (role: string) => {
    switch (role) {
        case 'superadmin':
            return 'Super Admin';
        case 'admin':
            return 'Admin';
        case 'verificator':
            return 'Verifikator';
        case 'surveyor':
            return 'Surveyor';
        case 'big':
            return 'BIG';
        default:
            return role;
    }
}

export const formatInstansiName = (instansi: string | null | undefined) => {
    if (!instansi) return '-';
    return instansi.replace('Organisasi ', '');
}

export const capitalizeFirstLetter = (str: string | undefined | null) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
