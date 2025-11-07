export type UserType = {
    name: string
    email: string
    role: Role
}

export type UserSignIn = {
    email: string
    password: string
}



export enum Role {
    ADMIN = 'ADMIN',
    VALIDATOR = 'VALIDATOR'
}