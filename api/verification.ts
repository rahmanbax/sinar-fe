import { API_URL } from "@/lib/config";

export interface VerificationTransaction {
    id: string;
    title: string;
    due_at: string;
    status: string;
    total_data: number;
    handled_data: number;
    accepted_data: number;
    rejected_data: number;
    accepted_rate: number;
    rejected_rate: number;
    element_count: number;
    district_count: number;
    verificator_count: number;
}

export interface VerificationPagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export const getVerificationTransactions = async (token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: [] };
    const response = await fetch(`${API_URL}/verifications/transaction`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const createVerificationTransaction = async (token: string | null, data: { title: string; elements: string[]; due_at: string }) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/transaction`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const finishVerificationTransaction = async (token: string | null, id: string) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/transaction/${id}/finish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.json();
};

export const getVerificationCandidates = async (token: string | null) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/transaction/candidates`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getAllVerificationToponyms = async (token: string | null, params: { page: number; per_page: number }) => {
    if (!token) return { error: true, message: "No token provided" };
    const { page, per_page } = params;
    const response = await fetch(`${API_URL}/verifications/transaction/toponyms?page=${page}&per_page=${per_page}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getVerificationTransactionToponyms = async (token: string | null, transactionId: string, params: { page: number; per_page: number }) => {
    if (!token) return { error: true, message: "No token provided" };
    const { page, per_page } = params;
    const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms?page=${page}&per_page=${per_page}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getVerificationToponymDetail = async (token: string | null, transactionId: string, toponymId: string) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const updateVerificationToponym = async (token: string | null, transactionId: string, toponymId: string, data: any) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const acceptVerificationToponym = async (token: string | null, transactionId: string, toponymId: string) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}/accept`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const rejectVerificationToponym = async (token: string | null, transactionId: string, toponymId: string) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/transaction/${transactionId}/toponyms/${toponymId}/reject`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getCompletedVerificationTransactions = async (token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: [] };
    const response = await fetch(`${API_URL}/verifications/transaction?status_num=2`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getRecommendations = async (token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: [] };
    const response = await fetch(`${API_URL}/verifications/recommendation/outgoing`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const createRecommendation = async (token: string | null, data: { ref_number: string; recommendation_doc_url: string; transaction_ids: string[] }) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/recommendation/outgoing`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getIncomingRecommendations = async (token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: [] };
    const response = await fetch(`${API_URL}/verifications/recommendation/incoming`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getIncomingRecommendationDetail = async (token: string | null, id: string) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/recommendation/incoming/${id}/data`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const acceptIncomingRecommendation = async (token: string | null, id: string, data: { transaction_ids: string[]; is_sesuai: boolean; alasan?: string }) => {
    if (!token) return { error: true, message: "No token provided" };
    // Menggunakan endpoint outgoing/{id}/accept sesuai instruksi user
    const response = await fetch(`${API_URL}/verifications/recommendation/outgoing/${id}/accept`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
};
export const getOutgoingRecommendationData = async (token: string | null, id: string) => {
    if (!token) return { error: true, message: "No token provided" };
    const response = await fetch(`${API_URL}/verifications/recommendation/outgoing/${id}/data`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};
