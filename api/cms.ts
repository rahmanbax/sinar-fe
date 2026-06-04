import { API_URL } from "@/lib/config";

export interface NewsItem {
    id: string;
    title: string;
    slug: string;
    content: string;
    thumbnail_url: string | null;
    status: "draft" | "published";
    published_at: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    creator?: { id: number; name: string } | null;
}

export interface NewsPaginated {
    error: boolean;
    message: string;
    data: NewsItem[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
}

export interface NewsResponse {
    error: boolean;
    message: string;
    data: NewsItem;
}

export const getNewsList = async (
    token: string | null,
    page = 1,
    search = "",
    status = ""
): Promise<NewsPaginated> => {
    if (!token) throw new Error("No token");

    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const res = await fetch(`${API_URL}/cms/news?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal mengambil data berita");
    return res.json();
};

export const getNewsDetail = async (
    token: string | null,
    id: string
): Promise<NewsResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal mengambil detail berita");
    return res.json();
};

export const createNews = async (
    token: string | null,
    data: { title: string; content: string; thumbnail_url?: string; status?: string }
): Promise<NewsResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/news`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal membuat berita");
    }
    return res.json();
};

export const updateNews = async (
    token: string | null,
    id: string,
    data: { title: string; content: string; thumbnail_url?: string; status?: string }
): Promise<NewsResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/news/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui berita");
    }
    return res.json();
};

// ─── Pengumuman Popup ────────────────────────────────────────────────────────

export interface PopupAnnouncement {
    id: number;
    title: string | null;
    photo_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PopupAnnouncementResponse {
    error: boolean;
    message: string;
    data: PopupAnnouncement;
}

export const getPopupAnnouncement = async (token: string | null): Promise<PopupAnnouncementResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/popup-announcement`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data popup");
    return res.json();
};

export const updatePopupAnnouncement = async (
    token: string | null,
    data: { title?: string; photo_url?: string; is_active?: boolean }
): Promise<PopupAnnouncementResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/popup-announcement`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui popup");
    }
    return res.json();
};

// ─── Struktur Kelembagaan ────────────────────────────────────────────────────

export interface OrgNode {
    id: string;
    name: string;
    position: string;
    photo_url: string | null;
    parent_id: string | null;
    order: number;
    created_at: string;
    updated_at: string;
    parent?: { id: string; name: string; position: string } | null;
    children?: OrgNode[];
}

export interface OrgListResponse {
    error: boolean;
    message: string;
    data: OrgNode[];
}

export interface OrgResponse {
    error: boolean;
    message: string;
    data: OrgNode;
}

export const getOrgList = async (token: string | null): Promise<OrgListResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/org-structures`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data struktur kelembagaan");
    return res.json();
};

export const getOrgTree = async (token: string | null): Promise<OrgListResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/org-structures/tree`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil tree struktur kelembagaan");
    return res.json();
};

export const getOrgDetail = async (token: string | null, id: string): Promise<OrgResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/org-structures/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil detail node");
    return res.json();
};

export const createOrgNode = async (
    token: string | null,
    data: { name: string; position: string; photo_url?: string; parent_id?: string; order?: number }
): Promise<OrgResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/org-structures`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal membuat node");
    }
    return res.json();
};

export const updateOrgNode = async (
    token: string | null,
    id: string,
    data: { name: string; position: string; photo_url?: string; parent_id?: string; order?: number }
): Promise<OrgResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/org-structures/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui node");
    }
    return res.json();
};

export const deleteOrgNode = async (
    token: string | null,
    id: string
): Promise<{ error: boolean; message: string }> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/org-structures/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal menghapus node");
    return res.json();
};

// ─── Tentang Aplikasi ────────────────────────────────────────────────────────

export interface AboutApp {
    id: number;
    title: string | null;
    content: string | null;
    created_at: string;
    updated_at: string;
}

export interface AboutAppResponse {
    error: boolean;
    message: string;
    data: AboutApp;
}

export const getAboutApp = async (token: string | null): Promise<AboutAppResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/about-app`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data tentang aplikasi");
    return res.json();
};

export const updateAboutApp = async (
    token: string | null,
    data: { title?: string; content?: string }
): Promise<AboutAppResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/about-app`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui tentang aplikasi");
    }
    return res.json();
};

// ─── Galeri ──────────────────────────────────────────────────────────────────

export interface GalleryItem {
    id: string;
    title: string;
    photo_url: string;
    order: number;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    creator?: { id: number; name: string } | null;
}

export interface GalleryPaginated {
    error: boolean;
    message: string;
    data: GalleryItem[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
}

export interface GalleryResponse {
    error: boolean;
    message: string;
    data: GalleryItem;
}

export const getGalleryList = async (
    token: string | null,
    page = 1,
    search = ""
): Promise<GalleryPaginated> => {
    if (!token) throw new Error("No token");
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "12");
    if (search) params.set("search", search);
    const res = await fetch(`${API_URL}/cms/galleries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data galeri");
    return res.json();
};

export const getGalleryDetail = async (
    token: string | null,
    id: string
): Promise<GalleryResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/galleries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil detail galeri");
    return res.json();
};

export const createGallery = async (
    token: string | null,
    data: { title: string; photo_url: string; order?: number }
): Promise<GalleryResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/galleries`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal menambah foto galeri");
    }
    return res.json();
};

export const updateGallery = async (
    token: string | null,
    id: string,
    data: { title: string; photo_url: string; order?: number }
): Promise<GalleryResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/galleries/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui foto galeri");
    }
    return res.json();
};

export const deleteGallery = async (
    token: string | null,
    id: string
): Promise<{ error: boolean; message: string }> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/galleries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal menghapus foto galeri");
    return res.json();
};

// ─── Kontak Kami ─────────────────────────────────────────────────────────────

export interface ContactSetting {
    id: number;
    email: string | null;
    phone: string | null;
    fax: string | null;
    address: string | null;
    operational_hours: string | null;
    created_at: string;
    updated_at: string;
}

export interface ContactSettingResponse {
    error: boolean;
    message: string;
    data: ContactSetting;
}

export const getContactSetting = async (
    token: string | null
): Promise<ContactSettingResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/contact-setting`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data kontak");
    return res.json();
};

export const updateContactSetting = async (
    token: string | null,
    data: {
        email?: string;
        phone?: string;
        fax?: string;
        address?: string;
        operational_hours?: string;
    }
): Promise<ContactSettingResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/contact-setting`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui data kontak");
    }
    return res.json();
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    order: number;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    creator?: { id: number; name: string } | null;
}

export interface FaqPaginated {
    error: boolean;
    message: string;
    data: FaqItem[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
}

export interface FaqResponse {
    error: boolean;
    message: string;
    data: FaqItem;
}

export const getFaqList = async (
    token: string | null,
    page = 1,
    search = ""
): Promise<FaqPaginated> => {
    if (!token) throw new Error("No token");
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    const res = await fetch(`${API_URL}/cms/faqs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data FAQ");
    return res.json();
};

export const getFaqDetail = async (
    token: string | null,
    id: string
): Promise<FaqResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil detail FAQ");
    return res.json();
};

export const createFaq = async (
    token: string | null,
    data: { question: string; answer: string; order?: number }
): Promise<FaqResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/faqs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal membuat FAQ");
    }
    return res.json();
};

export const updateFaq = async (
    token: string | null,
    id: string,
    data: { question: string; answer: string; order?: number }
): Promise<FaqResponse> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/faqs/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui FAQ");
    }
    return res.json();
};

export const deleteFaq = async (
    token: string | null,
    id: string
): Promise<{ error: boolean; message: string }> => {
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_URL}/cms/faqs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal menghapus FAQ");
    return res.json();
};

// ─── Agenda ──────────────────────────────────────────────────────────────────

export interface AgendaItem {
    id: string;
    title: string;
    date: string;
    photo_url: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    creator?: { id: number; name: string } | null;
}

export interface AgendaPaginated {
    error: boolean;
    message: string;
    data: AgendaItem[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
}

export interface AgendaResponse {
    error: boolean;
    message: string;
    data: AgendaItem;
}

export const getAgendaList = async (
    token: string | null,
    page = 1,
    search = ""
): Promise<AgendaPaginated> => {
    if (!token) throw new Error("No token");

    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);

    const res = await fetch(`${API_URL}/cms/agendas?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal mengambil data agenda");
    return res.json();
};

export const getAgendaDetail = async (
    token: string | null,
    id: string
): Promise<AgendaResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/agendas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal mengambil detail agenda");
    return res.json();
};

export const createAgenda = async (
    token: string | null,
    data: { title: string; date: string; photo_url?: string }
): Promise<AgendaResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/agendas`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal membuat agenda");
    }
    return res.json();
};

export const updateAgenda = async (
    token: string | null,
    id: string,
    data: { title: string; date: string; photo_url?: string }
): Promise<AgendaResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/agendas/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui agenda");
    }
    return res.json();
};

export const deleteAgenda = async (
    token: string | null,
    id: string
): Promise<{ error: boolean; message: string }> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/agendas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal menghapus agenda");
    return res.json();
};

// ─── Petunjuk Penggunaan ─────────────────────────────────────────────────────

export interface UserGuideItem {
    id: string;
    title: string;
    file_url: string;
    order: number;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    creator?: { id: number; name: string } | null;
}

export interface UserGuideListResponse {
    error: boolean;
    message: string;
    data: UserGuideItem[];
}

export interface UserGuideResponse {
    error: boolean;
    message: string;
    data: UserGuideItem;
}

export const getUserGuideList = async (
    token: string | null
): Promise<UserGuideListResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/user-guides`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal mengambil data petunjuk penggunaan");
    return res.json();
};

export const getUserGuideDetail = async (
    token: string | null,
    id: string
): Promise<UserGuideResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/user-guides/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal mengambil detail petunjuk penggunaan");
    return res.json();
};

export const createUserGuide = async (
    token: string | null,
    data: { title: string; file_url: string; order?: number }
): Promise<UserGuideResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/user-guides`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal membuat petunjuk penggunaan");
    }
    return res.json();
};

export const updateUserGuide = async (
    token: string | null,
    id: string,
    data: { title: string; file_url: string; order?: number }
): Promise<UserGuideResponse> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/user-guides/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Gagal memperbarui petunjuk penggunaan");
    }
    return res.json();
};

export const deleteUserGuide = async (
    token: string | null,
    id: string
): Promise<{ error: boolean; message: string }> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/user-guides/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal menghapus petunjuk penggunaan");
    return res.json();
};

export const deleteNews = async (
    token: string | null,
    id: string
): Promise<{ error: boolean; message: string }> => {
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_URL}/cms/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Gagal menghapus berita");
    return res.json();
};
