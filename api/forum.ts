import { API_URL } from "@/lib/config";

export interface ForumRoom {
    id: string;
    title: string;
    description: string | null;
    order: number;
    is_active: boolean;
    topics_count?: number;
    created_at: string;
    updated_at: string;
}

export interface ForumTopic {
    id: string;
    forum_room_id: string;
    title: string;
    content: string;
    author_name: string;
    author_email: string | null;
    user_id: number | null;
    status: "pending" | "approved" | "rejected";
    replies_count?: number;
    room?: { id: string; title: string } | null;
    replies?: ForumReply[];
    created_at: string;
    updated_at: string;
}

export interface ForumReply {
    id: string;
    forum_topic_id: string;
    content: string;
    author_name: string;
    author_email: string | null;
    is_admin_reply: boolean;
    status: "pending" | "approved";
    created_at: string;
    updated_at: string;
}

interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminGetRooms = async (token: string | null): Promise<{ error: boolean; data: ForumRoom[] }> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/rooms`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Gagal mengambil rooms");
    return res.json();
};

export const adminGetRoom = async (token: string | null, id: string): Promise<{ error: boolean; data: ForumRoom }> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/rooms/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Gagal mengambil room");
    return res.json();
};

export const adminCreateRoom = async (token: string | null, data: { title: string; description?: string; order?: number; is_active?: boolean }) => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/rooms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || "Gagal membuat room"); }
    return res.json();
};

export const adminUpdateRoom = async (token: string | null, id: string, data: { title: string; description?: string; order?: number; is_active?: boolean }) => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/rooms/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || "Gagal update room"); }
    return res.json();
};

export const adminDeleteRoom = async (token: string | null, id: string) => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/rooms/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Gagal hapus room");
    return res.json();
};

export const adminGetTopics = async (
    token: string | null,
    params: { page?: number; status?: string; room_id?: string; search?: string }
): Promise<{ error: boolean; data: ForumTopic[]; pagination: Pagination }> => {
    if (!token) throw new Error("No token");
    const p = new URLSearchParams();
    if (params.page) p.set("page", String(params.page));
    if (params.status) p.set("status", params.status);
    if (params.room_id) p.set("room_id", params.room_id);
    if (params.search) p.set("search", params.search);
    const res = await fetch(`${API_URL}/cms/forum/topics?${p}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Gagal mengambil topik");
    return res.json();
};

export const adminGetTopic = async (token: string | null, id: string): Promise<{ error: boolean; data: ForumTopic }> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/topics/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Gagal mengambil topik");
    return res.json();
};

export const adminUpdateTopicStatus = async (token: string | null, id: string, status: "pending" | "approved" | "rejected") => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/topics/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Gagal update status topik");
    return res.json();
};

export const adminDeleteTopic = async (token: string | null, id: string) => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/topics/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Gagal hapus topik");
    return res.json();
};

export const adminReplyTopic = async (token: string | null, topicId: string, content: string) => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/topics/${topicId}/replies`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || "Gagal kirim reply"); }
    return res.json();
};

export const adminUpdateReplyStatus = async (token: string | null, id: string, status: "pending" | "approved") => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/replies/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Gagal update status reply");
    return res.json();
};

export const adminDeleteReply = async (token: string | null, id: string) => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/forum/replies/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Gagal hapus reply");
    return res.json();
};
