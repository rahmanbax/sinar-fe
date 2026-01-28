import { API_URL } from "@/lib/config";

export interface Region {
    id: number;
    name: string;
    code: string;
    level: string;
    parent_id: number;
    path: string;
}

export const getRegions = async (params: {
    level: "PROVINCE" | "CITY" | "DISTRICT" | "VILLAGE";
    parent?: string;
    limit?: number;
    token: string | null;
}) => {
    const { level, parent, limit = 100, token } = params;
    if (!token) return { error: true, message: "No token provided", data: [] };

    let url = `${API_URL}/regions?level=${level}&limit=${limit}`;
    if (parent) url += `&parent=${parent}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};
