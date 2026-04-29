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

export const getMyTeams = async (token: string | null, page: number = 1, search: string = "") => {
    if (!token) return { error: true, message: "No token provided", data: [], pagination: null };
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    const res = await fetch(`${API_URL}/personal/my-teams?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch teams');
    }
    
    return res.json();
};
