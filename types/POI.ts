
export type NRB = {
    createdAt: string
    nrb: string
    standarizationStatus: string
    category: string
    subCategory: string
    elementType: string
    localName: string
    specificName: string
    otherName: string
    languangeOrigin: string
    pictures: string
    coord: {
        longitude: number
        latitude: number
    }
    province: string
    regency: string
    id: string
}

export type NRBMarkerItem = {
    id: string
    nrb: string
    longitude: number
    latitude: number
}