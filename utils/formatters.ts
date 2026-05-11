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

export const formatInstansiName = (instansi: string) => {
    return instansi.replace('Organisasi ', '');
}