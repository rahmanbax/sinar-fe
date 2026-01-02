export type UserType = {
    id: number
    name: string
    email: string
    phone: string
    org_id: number
    role: Role
    permission_level: number | null
    email_verified_at: string
    created_at: string
    updated_at: string
}

export type UserSignIn = {
    email: string
    password: string
}

export enum Role {
    ADMIN = 'admin',
    VERIFICATOR = 'verificator',
    SURVEYOR = 'surveyor',
    BIG = 'big'
}

// Role redirect mapping
export const getRoleDefaultRoute = (role: Role): string => {
    switch (role) {
        case Role.ADMIN:
        case Role.BIG:
            return '/big'
        case Role.VERIFICATOR:
            return '/penelaahan'
        case Role.SURVEYOR:
            return '/survey'
        default:
            return '/'
    }
}

// Role allowed routes mapping
export const getRoleAllowedRoutes = (role: Role): string[] => {
    switch (role) {
        case Role.ADMIN:
            return ['/big', '/penelaahan', '/survey', '/pengumuman', '/gazeter']
        case Role.BIG:
            return ['/big', '/pengumuman', '/gazeter']
        case Role.VERIFICATOR:
            return ['/penelaahan']
        case Role.SURVEYOR:
            return ['/survey', '/pengumuman']
        default:
            return ['/']
    }
}