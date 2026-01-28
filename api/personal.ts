import { API_URL } from "@/lib/config";

export const getPersonalPerformance = async (token: string | null) => {
    if (!token) return { error: true, message: "No token provided", data: null };
    const res = await fetch(`${API_URL}/personal/performance`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.json();
};
