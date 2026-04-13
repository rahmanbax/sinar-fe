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

export const useProvinces = (token: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "provinces"],
        queryFn: () => getRegions({ level: "PROVINCE", token }),
        enabled: !!token,
        staleTime: 1000 * 60 * 60, // 1 hour as provinces don't change often
    });
};

export const useCities = (parentCode: string | null, token: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "cities", parentCode],
        queryFn: () => getRegions({ level: "CITY", parent: parentCode!, token }),
        enabled: !!token && !!parentCode,
    });
};

export const useDistricts = (parentCode: string | null, token: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "districts", parentCode],
        queryFn: () => getRegions({ level: "DISTRICT", parent: parentCode!, token }),
        enabled: !!token && !!parentCode,
    });
};

export const useVillages = (parentCode: string | null, token: string | null) => {
    return useQuery<RegionResponse>({
        queryKey: ["regions", "villages", parentCode],
        queryFn: () => getRegions({ level: "VILLAGE", parent: parentCode!, token }),
        enabled: !!token && !!parentCode,
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
