import { useQuery } from "@tanstack/react-query";
import { getPersonalPerformance } from "@/api/personal";

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
