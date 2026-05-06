import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBeritaAcaraData, submitBeritaAcara } from "@/api/verification";

export interface ProvinceData {
    province_id: string;
    name: string;
    total_data: number;
    handled_data: number;
    accepted_data: number;
    rejected_data: number;
}

export interface BeritaAcaraData {
    ba_file_url?: string;
    province_data: ProvinceData[];
    transaction: {
        total_data: number;
        handled_data: number;
    };
    elements: string[];
    news?: {
        news_number: string;
        news_opener_name: string;
        news_opener_position: string;
        involved_agencies: string;
        file_url: string;
    };
}

export const useBeritaAcaraData = (token: string | null, transactionId: string | null) => {
    return useQuery({
        queryKey: ["berita-acara-data", transactionId],
        queryFn: async () => {
            if (!token || !transactionId) return null;
            try {
                const result = await getBeritaAcaraData(token, transactionId);
                if (!result || result.error || !result.data) {
                    // If the API returns an error or no data, we return null instead of undefined
                    // to satisfy TanStack Query's requirement.
                    if (result?.error) throw new Error(result.message || "Failed to fetch data");
                    return null;
                }
                return result.data as BeritaAcaraData;
            } catch (err) {
                console.error(`Error fetching BA data for ${transactionId}:`, err);
                throw err;
            }
        },
        enabled: !!token && !!transactionId,
        retry: false, // Avoid infinite retries on 500 errors
    });
};

export const useSubmitBeritaAcara = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            token,
            transactionId,
            data,
        }: {
            token: string | null;
            transactionId: string;
            data: {
                news_number: string;
                news_opener_name: string;
                news_opener_position: string;
                file_url: string;
            };
        }) => submitBeritaAcara(token, transactionId, data),
        onSuccess: (_, { transactionId }) => {
            queryClient.invalidateQueries({ queryKey: ["berita-acara-data", transactionId] });
            queryClient.invalidateQueries({ queryKey: ["verification-transactions"] });
        },
    });
};
