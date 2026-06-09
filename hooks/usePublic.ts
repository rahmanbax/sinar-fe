import { useQuery } from "@tanstack/react-query";
import { getPublicNewsList, getPublicAgendasList } from "@/api/public";

export const usePublicNewsQuery = (page = 1, search = "") => {
    return useQuery({
        queryKey: ["public-news", { page, search }],
        queryFn: () => getPublicNewsList(page, search),
    });
};

export const usePublicAgendasQuery = (page = 1, search = "") => {
    return useQuery({
        queryKey: ["public-agendas", { page, search }],
        queryFn: () => getPublicAgendasList(page, search),
    });
};
