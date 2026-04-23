import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getCompletedVerificationTransactions, 
    createRecommendation, 
    getRecommendations, 
    getIncomingRecommendations,
    getIncomingRecommendationDetail,
    acceptIncomingRecommendation
} from "@/api/verification";
import { useAuth } from "@/contexts/AuthContext";

export const useCompletedVerificationTransactions = () => {
    const { token } = useAuth();

    return useQuery({
        queryKey: ["completed-verification-transactions"],
        queryFn: () => getCompletedVerificationTransactions(token),
        enabled: !!token,
    });
};

export const useRecommendations = () => {
    const { token } = useAuth();

    return useQuery({
        queryKey: ["recommendations"],
        queryFn: () => getRecommendations(token),
        enabled: !!token,
    });
};

export const useCreateRecommendationMutation = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { ref_number: string; recommendation_doc_url: string; transaction_ids: string[] }) => createRecommendation(token, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recommendations"] });
            queryClient.invalidateQueries({ queryKey: ["completed-verification-transactions"] });
        },
    });
};

export const useIncomingRecommendations = () => {
    const { token } = useAuth();
    return useQuery({
        queryKey: ["incoming-recommendations"],
        queryFn: () => getIncomingRecommendations(token),
        enabled: !!token,
    });
};

export const useIncomingRecommendationDetail = (id: string) => {
    const { token } = useAuth();

    return useQuery({
        queryKey: ["incoming-recommendation-detail", id],
        queryFn: () => getIncomingRecommendationDetail(token, id),
        enabled: !!token && !!id,
    });
};

export const useAcceptIncomingRecommendation = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { id: string; data: { transaction_ids: string[]; is_sesuai: boolean; alasan?: string } }) =>
            acceptIncomingRecommendation(token, payload.id, payload.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incoming-recommendations"] });
        },
    });
};
