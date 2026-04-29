import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getVerificationCandidates,
    getVerificationTransactions,
    createVerificationTransaction,
    acceptVerificationToponym,
    rejectVerificationToponym,
    updateVerificationToponym,
    getOutgoingRecommendationData,
    getVerificationTransactionToponyms,
    getVerificationToponymDetail,
} from "@/api/verification";

// ... existing interfaces

export const useOutgoingRecommendationData = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["outgoing-recommendation-data", id],
        queryFn: () => getOutgoingRecommendationData(token, id),
        enabled: !!token && !!id,
        retry: false,
    });
};

export const useVerificationTransactionToponyms = (token: string | null, transactionId: string, params: { page: number; per_page: number }) => {
    return useQuery({
        queryKey: ["verification-transaction-toponyms", transactionId, params],
        queryFn: () => getVerificationTransactionToponyms(token, transactionId, params),
        enabled: !!token && !!transactionId,
        retry: false,
    });
};

export const useVerificationToponymDetail = (token: string | null, transactionId: string, toponymId: string) => {
    return useQuery({
        queryKey: ["verification-toponym-detail", transactionId, toponymId],
        queryFn: () => getVerificationToponymDetail(token, transactionId, toponymId),
        enabled: !!token && !!transactionId && !!toponymId,
        retry: false,
    });
};

export interface VerificationCandidate {
    count: number;
    element_code: string;
    element_name: string;
}

export interface VerificationCandidatesResponse {
    error: boolean;
    message: string;
    data: VerificationCandidate[];
}

export const useVerificationCandidates = (token: string | null) => {
    return useQuery<VerificationCandidatesResponse>({
        queryKey: ["verification-candidates"],
        queryFn: () => getVerificationCandidates(token),
        enabled: !!token,
        retry: false,
    });
};

export const useVerificationTransactions = (token: string | null) => {
    return useQuery({
        queryKey: ["verification-transactions"],
        queryFn: () => getVerificationTransactions(token),
        enabled: !!token,
        retry: false,
    });
};

export const useCreateVerificationTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            token,
            data,
        }: {
            token: string | null;
            data: { title: string; elements: string[]; due_at: string };
        }) => createVerificationTransaction(token, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["verification-transactions"] });
        },
    });
};

export const useAcceptVerificationToponym = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            token,
            transactionId,
            toponymId,
        }: {
            token: string | null;
            transactionId: string;
            toponymId: string;
        }) => acceptVerificationToponym(token, transactionId, toponymId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["verification-transactions"] });
        },
    });
};

export const useRejectVerificationToponym = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            token,
            transactionId,
            toponymId,
        }: {
            token: string | null;
            transactionId: string;
            toponymId: string;
        }) => rejectVerificationToponym(token, transactionId, toponymId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["verification-transactions"] });
        },
    });
};

export const useUpdateVerificationToponym = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            token,
            transactionId,
            toponymId,
            payload,
        }: {
            token: string | null;
            transactionId: string;
            toponymId: string;
            payload: any;
        }) => updateVerificationToponym(token, transactionId, toponymId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["verification-transactions"] });
        },
    });
};
