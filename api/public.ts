import { API_URL } from "@/lib/config";
import { NewsPaginated, AgendaPaginated } from "./cms";

export const getPublicNewsList = async (
    page = 1,
    search = ""
): Promise<NewsPaginated> => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);

    const res = await fetch(`${API_URL}/public/news?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Gagal mengambil data berita publik");
    return res.json();
};

export const getPublicAgendasList = async (
    page = 1,
    search = ""
): Promise<AgendaPaginated> => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);

    const res = await fetch(`${API_URL}/public/agendas?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Gagal mengambil data agenda publik");
    return res.json();
};
