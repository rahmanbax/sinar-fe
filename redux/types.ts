export enum actions {
    setToken = 'setToken',
    signIn = 'signIn',
    signOut = 'signOut',
}

// redux
export type ReduxAction<T> = {
    type: actions
    payload: T
}

export type EmailReduxState = string | null
export type IsAdminReduxState = boolean | null
export type TokenReduxState = string | null
export type ReduxState = {
    email?: EmailReduxState
    isAdmin?: IsAdminReduxState
    token?: TokenReduxState
}