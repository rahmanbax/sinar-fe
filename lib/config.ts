export const DEV_MODE = process.env.NEXT_PUBLIC_MODE === 'dev'
export const API_URL = DEV_MODE ? process.env.NEXT_PUBLIC_MOCK_API : process.env.NEXT_PUBLIC_API