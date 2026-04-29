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

export const getOrganizations = async (): Promise<{
    error: boolean;
    message: string;
    data: Organization[];
}> => {
    const res = await fetch(`${API_URL}/admin/organizations`);
    
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

export const createManualMember = async (
    token: string | null,
    data: {
        name: string;
        email: string;
        phone: string;
        role: string;
        password: string;
        password_confirmation: string;
        recommendation_file: File;
        ref_number: string;
    }
) => {
    if (!token) return { error: true, message: "No token provided" };

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('role', data.role);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('recommendation_file', data.recommendation_file);
    formData.append('ref_number', data.ref_number);

    const res = await fetch(`${API_URL}/admin/users/manual/create-member`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) {
        const errVal = await res.text();
        throw new Error(errVal || 'Failed to create manual member');
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

export const getAdminUsers = async (token: string | null, page: number = 1, search: string = "") => {
    if (!token) return { error: true, message: "No token provided", data: [], pagination: null };
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    const res = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch admin users');
    }
    
    return res.json();
};

export const getAdminUser = async (token: string | null, id: string) => {
    if (!token) return { error: true, message: "No token provided", data: null };
    
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch admin user detail');
    }
    
    return res.json();
};

export const rejectAdminRegistration = async (
    token: string | null,
    id: string,
    note: string
) => {
    if (!token) return { error: true, message: "No token provided" };

    const res = await fetch(`${API_URL}/admin/registrations/${id}/reject`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note })
    });

    if (!res.ok) {
        const errVal = await res.text();
        throw new Error(errVal || 'Failed to reject admin registration');
    }

    return res.json();
};

export const approveAdminRegistration = async (
    token: string | null,
    id: string
) => {
    if (!token) return { error: true, message: "No token provided" };

    const res = await fetch(`${API_URL}/admin/registrations/${id}/approve`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const errVal = await res.text();
        throw new Error(errVal || 'Failed to approve admin registration');
    }

    return res.json();
};

export const updateAdminStatus = async (
    token: string | null,
    id: string,
    status: boolean
) => {
    if (!token) return { error: true, message: "No token provided" };

    const formData = new FormData();
    formData.append("status_account", status ? "1" : "0");
    formData.append("_method", "PATCH");
    
    const res = await fetch(`${API_URL}/admin/users/${id}/status-account`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update admin status');
    }

    return res.json();
};
