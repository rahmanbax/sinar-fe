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

export const getToponymsByBoundingBox = async (token: string | null, params: Record<string, string | number>) => {
    if (!token) return { error: true, message: "No token provided", data: { count: 0, results: [] } };
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/survey/bounding-box?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const getSpatialToponyms = async (params: Record<string, string | number>) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/toponyms/spatial/bounding-box?${query}`, {
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });
    if (!res.ok) throw new Error("Failed to fetch spatial toponyms");
    return res.json();
};

export const getToponymDetail = async (id: string) => {
    const res = await fetch(`${API_URL}/toponyms/${id}`, {
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });
    if (!res.ok) throw new Error("Failed to fetch toponym detail");
    return res.json();
};

export const getPublicToponyms = async (params: Record<string, string | number>) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/toponyms/?${query}`, {
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });
    if (!res.ok) throw new Error("Failed to fetch public toponyms");
    return res.json();
};
