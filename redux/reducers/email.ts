/** @format */

import { actions } from '../types'
import { ApiUserProfile } from '@/utils/types'
import { EmailReduxState, ReduxAction } from '../types'

const initialState: EmailReduxState = null

const reducer = (
    state: EmailReduxState = initialState,
    action: ReduxAction<ApiUserProfile>
) => {
    switch (action.type) {
        case actions.signIn:
            // if (action.payload && typeof action.payload.email === 'string')
            // return action.payload.email
            if (
                action.payload &&
                typeof action.payload === 'object' &&
                'email' in action.payload &&
                typeof action.payload.email === 'string'
            )
                return action.payload.email
            return state
        case actions.signOut:
            return null
        default:
            return state
    }
}

export default reducer
