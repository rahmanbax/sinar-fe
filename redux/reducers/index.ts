export { default as token } from './token'
export { default as isAdmin } from './isAdmin'
export { default as email } from './email'
/**
 * As you can see, in Redux, each of these reducers would result in redux state {token, isAdmin, email, activeUnit}
 * Please use the type for the global Redux state, and replace references to AuthState throughout the app where appropriate, such as those in AppLayout.
 */
