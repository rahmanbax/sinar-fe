
export enum GeometryType {
    POINT = 'point',
    LINE = 'line', 
    POLYGON = 'polygon'
}

export type Point = {
    longitude: number
    latitude: number
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
    toponim_name: string
    point: Point
    element_id: number
    element_name: string
    classification_id: number
    classification_name: string
}

export type StandardToponim = { 
    id: number
    standard_id: string
    geometry_type: GeometryType
    point: Point
    line?: Line
    polygon?: Polygon
    altitude?: number
    gazeter?: {
        id: number
        title: number
    }
    category: {
        id: number,
        name: string
    }
    sub_category: {
        id: number
        category_id: number
        name: string
    }
    classification:{
        id: number
        name: number
    }
    element: {
        id: number
        name: number
    }
    lcode: string
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
    province?: {id: number, name: string}
    regency?: {id: number, name: string}
    district?: {id: number, name: string}
    village: {id: number, name: string}
    source_person?: string
    source: string
    pictures: [string?, string?, string?, string?]
    created_at: Date
    official_at: Date
}

export type PreStandarizedToponim = StandardToponim & {
    status?: string
    notes?: string
    source_person?: string
    survey_date?: Date
}