
export enum GeometryType {
    POINT = 'POINT',
    LINE = 'LINE',
    POLYGON = 'POLYGON'
}

export type Point = {
    lng: number
    lat: number
}

export type Line = [Point, Point]

export type Polygon = Point[]

export type MultiPolygon = Polygon[]

export type CreateToponimReq = {
    geometry_type: GeometryType,
    point?: Point
    line?: Line
    polygon?: Polygon
    altitude?: number
    classification_id: number
    element_id?: number
    // lCode: string
    generic_name: string
    specific_name: string
    toponim_name: string
    local_name: string
    other_name?: string
    name_meaning?: string
    name_history?: string
    languange_origin?: string
    pronounce?: string
    spelling?: string
    province_id?: number
    regency_id?: number
    district_id?: number
    village_id?: number
    source_person?: string
    survey_date: Date
    source: string
    note?: string
}

export type ToponimMarkerItem = {
    id: string
    name: string
    category: string
    element: string
    coordinates: Point
}

export type BoundingBoxToponymItem = {
    id: string
    local_name: string
    category_name: string
    subcategory_name: string
    element_name: string
    province: string | null
    regency: string | null
    district: string | null
    village: string | null
    lat: string
    lng: string
}

export type StandardToponim = {
    id: string
    element_id: number
    utm_zone: string
    nlp?: string | null
    lcode?: string | null
    local_name: string
    map_name: string
    other_name?: string | null
    language_origin?: string | null
    name_meaning?: string | null
    name_history?: string | null
    pronunciation?: string | null
    spelling?: string | null
    survey_at: string | null
    generic_element: string
    specific_element: string
    geometry_type: GeometryType
    location_point?: string | null
    location_line?: {
        type: string
        coordinates: number[][]
    } | null
    location_area?: unknown | null
    elevation_value?: string | null
    accuracy?: number | null
    scope?: unknown | null
    country: string
    province_id?: number | null
    regency_id?: number | null
    district_id?: number | null
    village_id?: number | null
    created_by: number
    surveyts?: string | null
    source: string
    notes?: string | null
    photos?: {
        url: string
        size: number
        filename: string
        uploaded_at: string
        original_name: string
    }[] | null
    sketch?: string | null
    status: string
    created_at: string
    updated_at: string
    deleted_at?: string | null
    element?: {
        id: number
        code: string
        name: string
        subcategory_id: number
        type?: string | null
        created_at: string
        updated_at?: string | null
        deleted_at?: string | null
    } | null
    province?: {
        id: number
        name: string
        code: string
    } | null
    regency?: {
        id: number
        name: string
        code: string
    } | null
    district?: {
        id: number
        name: string
        code: string
    } | null
    village?: {
        id: number
        name: string
        code: string
    } | null
}

export type PreStandarizedToponim = StandardToponim & {
    status?: string
    notes?: string
    source_person?: string
    survey_date?: Date
}

export type ToponymAnnouncementTabular = {
    id: string
    local_name: string
    map_name: string
    element?: {
        id: number
        code: string
        name: string
    }
    province?: {
        id: string
        code: string
        name: string
    } | null
    regency?: {
        id: string
        code: string
        name: string
    } | null
    district?: {
        id: string
        code: string
        name: string
    } | null
    village?: {
        id: string
        code: string
        name: string
    } | null
    location_point?: {
        type: 'Point'
        coordinates: [number, number]
    } | null
    created_at: string | Date
}