import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getVerificationCandidates,
    getVerificationTransactions,
    createVerificationTransaction,
} from "@/api/verification";

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
