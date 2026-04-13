import { useQuery } from "@tanstack/react-query";
import { getCompletedVerificationTransactions } from "@/api/verification";
import { useAuth } from "@/contexts/AuthContext";

export const useCompletedVerificationTransactions = () => {
    const { token } = useAuth();

    return useQuery({
        queryKey: ["completed-verification-transactions"],
        queryFn: () => getCompletedVerificationTransactions(token),
        enabled: !!token,
    });
};
