export const logoPath = '/logo.png'

export const tokenParameters = {
    tokenKey: 'valide_token',
    renewalTsKey: 'valide_token_lastrenewts',
    tokenRenewDuration: 59 * 60 * 1000,
    renewalBeforeExpiryMinutes: 5,
    renewalDebounceSeconds: 5,
    renewalDebounceRetryWait: 30,
}
export const baseAPIPath =
    process.env.REACT_APP_BASEAPIURL ??
    (process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000/api'
        : '/api')

export const validEmailRegex =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

export const passwordStrengthValidatorRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/