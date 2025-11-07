/** @format */
import { Provider, useSelector, useDispatch } from 'react-redux'
import { legacy_createStore as createStore, combineReducers } from 'redux'
import * as reducers from './reducers/index'
import { FC, ReactNode } from 'react'

export const rootReducer = combineReducers(reducers)

export const ReduxProvider: FC<{ children: ReactNode }> = ({ children }) => (
    <Provider store={store}>{children}</Provider>
)

/** @type import('redux').Store */
export const store = createStore(
    rootReducer,
    process.env.NODE_ENV !== 'production' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__REDUX_DEVTOOLS_EXTENSION__({
            trace: true,
            traceLimit: 50,
        })
)

export { useSelector, useDispatch }

export { actions } from './types'
