import { useQuery } from "@tanstack/react-query";
import { getRegions } from "@/api/region";
import { getElements, getGenericElements } from "@/api/classification";

export interface RegionResponse {
    error: boolean;
    message: string;
    data: {
        code: string;
        name: string;
        level: string;
        path: string;
    }[];
}

export const useProvinces = (token?: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "provinces"],
        queryFn: () => getRegions({ level: "PROVINCE" }),
        staleTime: Infinity,
    });
};

export const useCities = (parentCode: string | null, token?: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "cities", parentCode],
        queryFn: () => getRegions({ level: "CITY", parent: parentCode! }),
        enabled: !!parentCode,
        staleTime: Infinity,
    });
};

export const useDistricts = (parentCode: string | null, token?: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "districts", parentCode],
        queryFn: () => getRegions({ level: "DISTRICT", parent: parentCode! }),
        enabled: !!parentCode,
    });
};

export const useVillages = (parentCode: string | null, token?: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "villages", parentCode],
        queryFn: () => getRegions({ level: "VILLAGE", parent: parentCode! }),
        enabled: !!parentCode,
    });
};

export const useElements = (token: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["classification", "elements"],
        queryFn: () => getElements(token),
        enabled: !!token,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGenericElements = (token: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["classification", "generic-elements"],
        queryFn: () => getGenericElements(token),
        enabled: !!token,
        staleTime: 1000 * 60 * 60,
    });
};
