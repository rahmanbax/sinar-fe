/** @format */

import { actions } from '../types'
import { TokenReduxState, ReduxAction } from '@/redux/types'

const initialState: TokenReduxState = null

const reducer = (
    state: TokenReduxState = initialState,
    action: ReduxAction<string | { token: string }>
) => {
    switch (action.type) {
        case actions.setToken:
            return action.payload as string
        case actions.signIn:
            // if (action.payload && typeof action.payload.token === 'string')
            // return action.payload.token
            if (
                action.payload &&
                typeof action.payload === 'object' &&
                'token' in action.payload &&
                typeof action.payload.token === 'string'
            )
                return action.payload.token
            return state
        case actions.signOut:
            return null
        default:
            return state
    }
}

export default reducer
