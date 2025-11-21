// src/api/client.ts
import { getAccessToken } from "@/contexts/AuthContext"
import { API_URL } from "@/lib/config"
import { useCallback } from "react"
import {
    networkErrorGate,
    errorNotifyWithSetLoadingFalse,
} from './errors'

/**
 * @param {boolean} shouldHandleError open error notification directly
 * @param {Function} setLoading if set would call it when errored with false parameter
 */

interface ApiHandlerOptions {
    shouldHandleError?: boolean
    setLoading?: (loading: boolean) => void
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiHandlerFunction {
    (
        method: HttpMethod,
        path: string,
        body?: string | object,
        header?: Record<string, string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any>
}


export const useApiHandler = ({
    shouldHandleError,
    setLoading,
}: ApiHandlerOptions) => {
    const token = getAccessToken()
    /**
     * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method HTTP request method
     * @param {string} path the sub path that will be concatenated with base URL
     * @param {string|object} body will be JSON.stringified if not already string
     * @param {Object|null} header will be spread with JSON content-type header
     *  */
    const apiHandler = useCallback<ApiHandlerFunction>(
        (method, path, body, header) =>
            new Promise((resolve, reject) => {
                // if (!token) return reject({ code: 'noToken' })
                if (typeof setLoading === 'function') setLoading(true)

                if (token) {
                    header = {
                        ...header,
                        'Authorization' : `Bearer ${token}`
                    }
                }
                
                fetch(`${API_URL}${path}`, {
                    headers: {
                        'content-type': 'application/json',
                        ...header, 
                    },
                    method,
                    body:
                        body && typeof body === 'string'
                            ? body
                            : JSON.stringify(body),
                })
                    .then(r => r.json())
                    .then(r => {
                        if (r.error) throw r
                        // resolve(r.data)
                        resolve(r)
                        if (typeof setLoading === 'function') setLoading(false)
                    })
                    .catch(networkErrorGate)
                    .catch(e => {
                        if (shouldHandleError) {
                            errorNotifyWithSetLoadingFalse(setLoading)(e)
                            resolve(e)
                        } else {
                            if (typeof setLoading === 'function')
                                setLoading(false)
                            reject(e)
                        }
                    })
            }),
        [token, shouldHandleError, setLoading]
    )
    return apiHandler
}
