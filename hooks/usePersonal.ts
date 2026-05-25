import { useQuery } from "@tanstack/react-query";
import { getPersonalPerformance, getMyTeams } from "@/api/personal";

export interface PersonalPerformanceResponse {
    error: boolean;
    message: string;
    data: {
        user_id: string;
        summary: {
            submitted_data: number;
            survey_data: number;
            antara_data: number;
            standarized: number;
        };
        five_top_elements: {
            element_code: string;
            element_name: string;
            count: number;
        }[];
    };
}

export const usePersonalPerformance = (token: string | null) => {
    return useQuery<PersonalPerformanceResponse>({
        queryKey: ["personal-performance"],
        queryFn: () => getPersonalPerformance(token),
        enabled: !!token,
        retry: false,
    });
};

export const useMyTeams = (token: string | null, page: number = 1, search: string = "", role?: string) => {
    return useQuery({
        queryKey: ["my-teams", page, search, role],
        queryFn: () => getMyTeams(token, page, search, role),
        enabled: !!token,
    });
};
