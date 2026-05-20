import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpatialToponyms, getToponymDetail, getPublicToponyms, getToponymById, createToponym, updateToponym, getToponymsByBoundingBox } from "@/api/toponym";

export interface SpatialToponym {
    id: string;
    local_name: string;
    map_name: string;
    other_name: string | null;
    element_name: string;
    province: string | null;
    regency: string | null;
    district: string | null;
    village: string | null;
    status: string;
    lat: number;
    lng: number;
    submitted_at: string;
}

export interface SpatialToponymResponse {
    error: boolean;
    message: string;
    data: {
        count: number;
        results: SpatialToponym[];
    };
}

export interface ToponymDetail {
    id: string;
    element_id: string;
    nlp: string | null;
    lcode: string | null;
    generic_element: string | null;
    specific_element: string | null;
    local_name: string;
    map_name: string;
    other_name: string | null;
    language_origin: string | null;
    name_meaning: string | null;
    name_history: string | null;
    pronounciation: string | null;
    spelling: string | null;
    geometry_type: string;
    location_point: {
        type: string;
        coordinates: [number, number];
    } | null;
    location_line: any;
    location_area: any;
    elevation_value: string | null;
    country: string;
    province_id: string;
    regency_id: string;
    district_id: string;
    village_id: string | null;
    created_by: number;
    survey_at: string | null;
    source: string;
    notes: string | null;
    photos: {
        url: string;
        size: number;
        filename: string;
        uploaded_at: string;
        original_name: string;
    }[];
    sketch: string | null;
    pronounciation_audio: string | null;
    video: string | null;
    support_document: string | null;
    sync_uid: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    utm_zone: string;
    element: {
        code: string;
        name: string;
        subcategory_id: string;
        type: string | null;
        created_at: string;
        updated_at: string | null;
        deleted_at: string | null;
    };
    province?: {
        code: string;
        name: string;
        level: string;
        path: string;
    };
    regency?: {
        code: string;
        name: string;
        level: string;
        path: string;
    };
    district?: {
        code: string;
        name: string;
        level: string;
        path: string;
    };
    village?: {
        code: string;
        name: string;
        level: string;
        path: string;
    } | null;
}

export interface ToponymDetailResponse {
    error: boolean;
    message: string;
    data: ToponymDetail;
}

export const useSpatialToponyms = (params: {
    min_lat: string;
    max_lat: string;
    min_lng: string;
    max_lng: string;
    limit?: string;
    province_id?: string;
    regency_id?: string;
    element_id?: string;
}) => {
    return useQuery<SpatialToponymResponse>({
        queryKey: ["toponyms", "spatial", params],
        queryFn: () => getSpatialToponyms(params),
        enabled: !!params.min_lat && !!params.min_lng, // Only fetch if we have basic bounds
        retry: false, // Prevent retrying on failure
    });
};

export const useToponymDetail = (id: string | null) => {
    return useQuery<ToponymDetailResponse>({
        queryKey: ["toponym", id],
        queryFn: () => getToponymDetail(id!),
        enabled: !!id,
        retry: false, // Prevent retrying on failure
    });
};

export const useSurveyToponymDetail = (id: string | null, token: string | null) => {
    return useQuery<ToponymDetailResponse>({
        queryKey: ["survey-toponym", id],
        queryFn: () => getToponymById(id!, token),
        enabled: !!id && !!token,
        retry: false,
    });
};

export const useCreateToponym = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ payload, token }: { payload: any, token: string | null }) => createToponym(payload, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["toponyms"] });
        },
    });
};

export const useUpdateToponym = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload, token }: { id: string, payload: any, token: string | null }) => updateToponym(id, payload, token),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["toponyms"] });
            queryClient.invalidateQueries({ queryKey: ["toponym", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["survey-toponym", variables.id] });
        },
    });
};

export interface PaginationMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

export interface PublicToponym {
    id: string;
    element_id: string;
    generic_element: string | null;
    specific_element: string | null;
    local_name: string | null;
    map_name: string;
    other_name: string | null;
    name_meaning: string | null;
    language_origin: string | null;
    status: string;
    source: string;
    location_point: {
        type: string;
        coordinates: [number, number];
    } | null;
    province_id: string;
    regency_id: string;
    district_id: string;
    village_id: string | null;
    survey_at: string | null;
    created_at: string;
    created_by: number;
    updated_at: string;
    sync_uid: string;
    utm_zone: string;
    element: {
        code: string;
        name: string;
        subcategory_id: string;
        type: string | null;
        created_at: string;
        updated_at: string | null;
        deleted_at: string | null;
    };
    province?: {
        code: string;
        name: string;
        level: string;
        path: string;
    };
    regency?: {
        code: string;
        name: string;
        level: string;
        path: string;
    };
    district?: {
        code: string;
        name: string;
        level: string;
        path: string;
    };
    village?: {
        code: string;
        name: string;
        level: string;
        path: string;
    } | null;
    standard?: any;
    gazetteer?: any;
    published_at?: string;
}

export interface PublicToponymResponse {
    error: boolean;
    message: string;
    data: PublicToponym[];
    pagination: PaginationMeta;
}

export const usePublicToponyms = (params: {
    page: string;
    limit: string;
    [key: string]: any;
}) => {
    return useQuery<PublicToponymResponse>({
        queryKey: ["toponyms", "public", params],
        queryFn: () => getPublicToponyms(params),
        retry: false,
    });
};

export const useSurveyBoundingBox = (token: string | null) => {
    return useQuery<SpatialToponymResponse>({
        queryKey: ["toponyms", "survey", "bounding-box", token],
        queryFn: () => getToponymsByBoundingBox(token, {
            min_lat: -12,
            max_lat: 12,
            min_lng: 91,
            max_lng: 142,
        }),
        enabled: !!token,
        retry: false,
    });
};
