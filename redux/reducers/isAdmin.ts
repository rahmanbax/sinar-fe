/** @format */

import { actions } from '../types'
import { ApiUserProfile } from '@/utils/types'
import { IsAdminReduxState, ReduxAction } from '../types'

const initialState: IsAdminReduxState = null

const reducer = (
    state: IsAdminReduxState = initialState,
    action: ReduxAction<ApiUserProfile>
) => {
    switch (action.type) {
        case actions.signIn:
            // if (action.payload && typeof action.payload.is_admin === 'boolean')
            //     return action.payload.is_admin
            if (
                action.payload &&
                typeof action.payload === 'object' &&
                'is_admin' in action.payload &&
                typeof action.payload.is_admin === 'boolean'
            )
                return action.payload.is_admin
            return state
        case actions.signOut:
            return null
        default:
            return state
    }
}

export default reducer
