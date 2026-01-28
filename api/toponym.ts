import { API_URL } from "@/lib/config";

export const getToponyms = async (token: string | null, params?: Record<string, string>) => {
    if (!token) return { error: true, message: "No token provided", data: [] };
    let url = `${API_URL}/survey/toponyms`;
    if (params) {
        const query = new URLSearchParams(params).toString();
        url += `?${query}`;
    }

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const getToponymById = async (id: string, token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: null };
    const res = await fetch(`${API_URL}/survey/toponyms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const createToponym = async (payload: any, token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: null };
    const res = await fetch(`${API_URL}/survey/toponyms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    return res.json();
};

export const updateToponym = async (id: string, payload: any, token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: null };
    const res = await fetch(`${API_URL}/survey/toponyms/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    return res.json();
};
