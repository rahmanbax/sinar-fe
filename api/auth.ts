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
