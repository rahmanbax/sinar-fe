import { API_URL } from "@/lib/config";

export interface Element {
    id: number;
    code: string;
    name: string;
    subcategory_id: number;
}

export const getElements = async (token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: [] };
    const res = await fetch(`${API_URL}/classification/elements?sort_by=name&sort_order=asc`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};
