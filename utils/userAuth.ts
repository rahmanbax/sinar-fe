/* eslint-disable @typescript-eslint/no-explicit-any */
/** @format */

import dayjs from 'dayjs'
import {
    baseAPIPath,
    tokenParameters,
    passwordStrengthValidatorRegex,
} from './consts'
import { actions } from '../redux'
import { errorNotify, errors, networkErrorGate } from './errors'
import { ApiUserProfile, ApiUserSignIn } from '@/utils/types'
import { Dispatch } from 'redux'

/**
 * @returns {{tokenValid: boolean, expiry: dayjs.Dayjs|undefined, renewal: dayjs.Dayjs|undefined}}
 */
export const getTokenExpiry = (token: string) => {
    try {
        const tokenArr = token.split('.')
        if (tokenArr.length < 3) return { tokenValid: false }
        const expiry = dayjs(new Date(JSON.parse(atob(tokenArr[1])).exp * 1000))
        const latestExpiryDeadline = expiry
            .set('second', Math.floor(Math.random() * 60))
            .subtract(tokenParameters.renewalBeforeExpiryMinutes, 'm')
        return {
            tokenValid:
                expiry.isValid() && latestExpiryDeadline.isAfter(new Date()),
            expiry,
            renewal: latestExpiryDeadline,
        }
    } catch (e) {
        return { tokenValid: false }
    }
}

export const logout = (dispatch: Dispatch) => {
    //TODO will be change the any
    window.localStorage.removeItem(tokenParameters.tokenKey)
    dispatch({ type: actions.signOut })
}

/**
 * @param {import('redux').Dispatch} dispatch
 */
export const renewTokenFromAPI = (dispatch: Dispatch) => {
    const tokenFromLocalStorage = window.localStorage.getItem(
        tokenParameters.tokenKey
    )
    if (
        !tokenFromLocalStorage ||
        getTokenExpiry(tokenFromLocalStorage).renewal?.isAfter(
            dayjs().add(tokenParameters.renewalBeforeExpiryMinutes - 1, 'm')
        )
    )
        return
    const lastRenewFromLocalStorage = window.localStorage.getItem(
        tokenParameters.renewalTsKey
    )
    const lastRenewTs = lastRenewFromLocalStorage
        ? dayjs(lastRenewFromLocalStorage)
        : null
    if (
        lastRenewTs &&
        lastRenewTs.isValid() &&
        lastRenewTs.isAfter(
            dayjs().subtract(tokenParameters.renewalDebounceSeconds, 's')
        )
    )
        return setTimeout(
            () => renewTokenFromAPI(dispatch),
            tokenParameters.renewalDebounceRetryWait
        )
    window.localStorage.setItem(
        tokenParameters.renewalTsKey,
        dayjs().toISOString()
    )
    fetch(`${baseAPIPath}/user/token`, {
        headers: {
            token: tokenFromLocalStorage,
        },
    })
        .then(r => r.json())
        .then(r => {
            if (r && r.data) {
                window.localStorage.setItem(
                    tokenParameters.tokenKey,
                    r.data.token
                )
                dispatch({ type: actions.signIn, payload: r.data })
            } else {
                if (r.code) throw r.code
                throw errors.serverError
            }
        })
        .catch(e => {
            networkErrorGate(e)
        })
        .finally(() => {
            window.localStorage.removeItem(tokenParameters.renewalTsKey)
        })
}
/**
 * @param {string} token
 * @param {import('redux').Dispatch} dispatch
 */
export const getUserProfileFromAPI = async (token: string, dispatch: any) => {
    try {
        const res = await fetch(`${baseAPIPath}/user/profile`, {
            headers: {
                token: token,
            },
        })
        const body = await res.json()
        if (body && body.data) {
            dispatch({ type: actions.signIn, payload: body.data })
        } else {
            throw errors.serverError
        }
    } catch (e) {
        networkErrorGate(e)
    }
}

/**
 * @param {{email: string, password: string}} payload
 * @param {import('redux').Dispatch} dispatch
 */
export const loginAPIHandler = async (
    payload: ApiUserProfile,
    dispatch: any
) => {
    try {
        const res = await fetch(`${baseAPIPath}/user`, {
            headers: {
                'content-type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(payload),
        })
        const body = await res.json()
        if (body && body.data) {
            window.localStorage.setItem(
                tokenParameters.tokenKey,
                body.data.token
            )
            dispatch({ type: actions.signIn, payload: body.data })
        } else {
            if (body.code) throw body.code
            throw errors.serverError
        }
    } catch (e) {
        networkErrorGate(e)
    }
}
/**
 * @param {{email: string, password: string}} payload
 * @param {import('redux').Dispatch} dispatch
 */
export const signUpAPIHandler = async (
    payload: ApiUserSignIn,
    dispatch: any
) => {
    try {
        const res = await fetch(`${baseAPIPath}/user`, {
            headers: {
                'content-type': 'application/json',
            },
            method: 'PUT',
            body: JSON.stringify(payload),
        })
        const body = await res.json()
        if (body && body.data) {
            window.localStorage.setItem(
                tokenParameters.tokenKey,
                body.data.token
            )
            dispatch({ type: actions.signIn, payload: body.data })
        } else {
            if (body.code) throw body.code
            throw errors.serverError
        }
    } catch (e) {
        networkErrorGate(e)
    }
}
