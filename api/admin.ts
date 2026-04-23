import { API_URL } from "@/lib/config";

export interface Organization {
    id: string;
    code: string;
    level: number;
    name: string;
    region_id: string | null;
    created_at: string;
    updated_at: string | null;
    region: {
        code: string;
        name: string;
        level: string;
        path: string;
    } | null;
}

export const getOrganizations = async (token: string | null): Promise<{
    error: boolean;
    message: string;
    data: Organization[];
}> => {
    // Assuming backend returns { error, message, data } based on the provided JSON payload
    if (!token) return { error: true, message: "No token provided", data: [] };
    
    const res = await fetch(`${API_URL}/admin/organizations`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch organizations data');
    }
    
    return res.json();
};

export const createManualAdmin = async (
    token: string | null,
    data: {
        org_id: string;
        name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
        recommendation_file: File;
        ref_number: string;
        is_admin_big: boolean;
    }
) => {
    if (!token) return { error: true, message: "No token provided" };

    const formData = new FormData();
    formData.append('org_id', data.org_id);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('recommendation_file', data.recommendation_file);
    formData.append('ref_number', data.ref_number);
    formData.append('is_admin_big', String(data.is_admin_big));

    const res = await fetch(`${API_URL}/admin/users/manual/create-admin`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) {
        const errVal = await res.text();
        throw new Error(errVal || 'Failed to create manual admin');
    }

    return res.json();
};

export const importAdminData = async (
    token: string | null,
    data: {
        org_id: string;
        user_file: File;
        recommendation_file: File;
        ref_number: string;
    }
) => {
    if (!token) return { error: true, message: "No token provided" };

    const formData = new FormData();
    formData.append('org_id', data.org_id);
    formData.append('user_file', data.user_file);
    formData.append('recommendation_file', data.recommendation_file);
    formData.append('ref_number', data.ref_number);

    const res = await fetch(`${API_URL}/admin/users/imports/admin-imports`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) {
        const errVal = await res.text();
        throw new Error(errVal || 'Failed to import admin data');
    }

    return res.json();
};
