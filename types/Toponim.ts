
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
    id: number
    name: string
    category: string
    element: string
    coordinates: Point
}

export type StandardToponim = { 
    id: number
    id_toponym: string
    utm_zone: string
    nlp? : string
    geometry_type: GeometryType
    location: {
        type: string
        coordinates : Point | Polygon | Line
    }
    elevation_value?: number
    accuracy?: number
    scope?: unknown
    country: string
    surveyor_code: string
    surveyor_name: string
    source_person: string
    survey_date: string
    data_source: string
    notes: string
    gazetteer?: {
        id: number
        code: string
        name: string
    }
    category: {
        id: number,
        name: string
    }
    sub_category: {
        id: number
        category_id: number
        code: string
        name: string
    }
    toponym_classification:{
        id: number
        code: string
        name: string
    }
    element: {
        id: number
        code: string
        name: string
    }
    standardization_status: {
        id: number
        name: string
    }
    lcode: string
    map_name: string
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
    province?: {id: number, code: string, name: string}
    regency?: {id: number, code: string, name: string}
    district?: {id: number, code: string, name: string}
    village: {id: number, code: string, name: string}
    source: string
    photos:  {
        filename:string
        url: string
    }[]
    created_at: Date
    official_at: Date
}

export type PreStandarizedToponim = StandardToponim & {
    status?: string
    notes?: string
    source_person?: string
    survey_date?: Date
}

export type ToponymAnnouncementTabular = {
    id: number
    element_type: string
    local_name: string
    map_name: string
    category: {
        id: string
        code: string
        name: string
    }
    province: {
        id: string
        code: string
        name: string
    }
    regency: {
        id: string
        code: string
        name: string
    }
    district: {
        id: string
        code: string
        name: string
    }
    village: {
        id: string
        code: string
        name: string
    }
    location: {
        type: 'Points'
        coordinates: [number, number]
    }
    created_at: string | Date
}