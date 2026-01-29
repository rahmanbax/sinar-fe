import { API_URL } from "@/lib/config";

export interface UploadResponse {
    error: boolean;
    message: string;
    data: {
        url: string;
        filename: string;
    };
}

export const uploadImage = async (file: File, token: string | null): Promise<UploadResponse> => {
    if (!token) return { error: true, message: "No token provided", data: { url: "", filename: "" } };
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/media/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    return res.json();
};

export const uploadAudio = async (file: File, token: string | null): Promise<UploadResponse> => {
    if (!token) return { error: true, message: "No token provided", data: { url: "", filename: "" } };
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/media/upload/audio`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    return res.json();
};

export const uploadDocs = async (file: File, token: string | null): Promise<UploadResponse> => {
    if (!token) return { error: true, message: "No token provided", data: { url: "", filename: "" } };
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/media/upload/docs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    return res.json();
};

export const uploadVideo = async (file: File, token: string | null): Promise<UploadResponse> => {
    if (!token) return { error: true, message: "No token provided", data: { url: "", filename: "" } };
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/media/upload/video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    return res.json();
};
