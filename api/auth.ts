import { API_URL } from "@/lib/config";
import { UserType } from "@/types/User";

export const loginUser = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const registerUser = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone_number: string;
}) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const logoutUser = async (token: string) => {
    const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return res.json();
};

export const refreshAuthToken = async (currentToken: string) => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
        },
    });
    return res.json();
};

export const getUserProfile = async (token: string) => {
    const res = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return res;
};

export const registerAdmin = async (data: {
    institution_type: string;
    org_id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    recommendation_file: File;
    ref_number: string;
    invite_token?: string | null;
}) => {
    const formData = new FormData();
    formData.append("institution_type", data.institution_type);
    formData.append("org_id", data.org_id);
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);
    formData.append("password_confirmation", data.password_confirmation);
    formData.append("recommendation_file", data.recommendation_file);
    formData.append("ref_number", data.ref_number);
    if (data.invite_token) {
        formData.append("invite_token", data.invite_token);
    }

    const res = await fetch(`${API_URL}/auth/admin/register`, {
        method: "POST",
        body: formData,
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal mendaftar sebagai admin");
    }

    return res.json();
};
