export type SuccessResponseWrapper<T> = {
    error: false
    message?: string
    data?: T
}

export type ErrorResponseWrapper = {
    error: true
    message: string
    errors?: unknown
}

export type PaginationWrapper<T> = Exclude<SuccessResponseWrapper<T>, {data: T}> & {
    total_pages: number
    page: number
    per_page: number
    data: T[]
}

export type HttpResponse<T> = ErrorResponseWrapper | SuccessResponseWrapper<T> | PaginationWrapper<T>