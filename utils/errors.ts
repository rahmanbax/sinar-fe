export const errors = {
    serverError: 'An Error occurred with the server',
    userNotExist: 'User with that email does not exist',
    userAlreadyExist: 'User with that email already exist',
    invalidLogin: 'User/Password invalid',
    invalidPassword: 'Password is invalid',
    bad_request: 'Bad request',
    not_found: 'Not found',
    not_exists: 'Not exists',
    weakPassword:
        'Min 8 Characters of min one Uppercase, lowercase and numeric and with 5 unique characters',
    unauthorized: 'Unauthorized to perform request',
    noToken: 'Session token not sent with request',
    invalidToken: 'invalidToken',
    illegalCharacter: 'Illegal character in one of request',
    illegalParameter: 'Illegal parameter in one of request',
    preExistUnit: 'Unit exists',
    preExistUnitField: 'Unit field exists',
    preExistUnitFieldChoice: 'Unit field choice exists',
    preExistUnitMember: 'Unit member exists',
    unitNotExist: 'Unit does not exist',
    unitFieldNotExist: 'Unit field does not exist',
    unitFieldChoiceNotExist: 'Unit field choice does not exist',
    unitMemberNotExist: 'Unit member does not exists',
    apiKeyNotExist: 'API key does not exists',
    dataMismatch: 'Data is not matched with requirement',
    noHookConfigured: 'Hook is not configured',
    tokenExpired: 'Session expired: please login',
    networkError: 'Failed to Communicate With Server',
}

export const networkErrorGate = (e: unknown) => {
    if (e instanceof TypeError) throw errors.networkError
    throw e
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorNotify = (e: any) => {
    const code = e && e.code ? e.code : e
    console.error('Error:', code, e)
    // notification.error({
    //     message: e.message ??
    //         code in errors ? errors[code as keyof typeof errors] : e.toString(),
    // })
}

export const errorNotifyWithSetLoadingFalse =
    (setLoading?: (loading: boolean) => void) =>
    (e: unknown): void => {
        if (typeof setLoading === 'function') setLoading(false)
        errorNotify(e)
    }