import { useMutation, useQuery, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import {
    getNewsList,
    getNewsDetail,
    createNews,
    updateNews,
    deleteNews,
    NewsItem,
    getPopupAnnouncement,
    updatePopupAnnouncement,
    getOrgList,
    getOrgDetail,
    createOrgNode,
    updateOrgNode,
    deleteOrgNode,
    getAboutApp,
    updateAboutApp,
    getGalleryList,
    getGalleryDetail,
    createGallery,
    updateGallery,
    deleteGallery,
    getContactSetting,
    updateContactSetting,
    getFaqList,
    getFaqDetail,
    createFaq,
    updateFaq,
    deleteFaq,
    getAgendaList,
    getAgendaDetail,
    createAgenda,
    updateAgenda,
    deleteAgenda,
    getUserGuideList,
    getUserGuideDetail,
    createUserGuide,
    updateUserGuide,
    deleteUserGuide,
} from "@/api/cms";

export const useNewsList = (
    token: string | null,
    page = 1,
    search = "",
    status = ""
) => {
    return useQuery({
        queryKey: ["cms", "news", page, search, status],
        queryFn: () => getNewsList(token, page, search, status),
        enabled: !!token,
    });
};

export const useNewsDetail = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["cms", "news", id],
        queryFn: () => getNewsDetail(token, id),
        enabled: !!token && !!id,
    });
};

type CreateNewsVars = {
    token: string | null;
    data: { title: string; content: string; thumbnail_url?: string; status?: string };
};

export const useCreateNewsMutation = (
    options?: Omit<UseMutationOptions<any, Error, CreateNewsVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: CreateNewsVars) => createNews(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "news"] });
            options?.onSuccess?.(...args);
        },
    });
};

type UpdateNewsVars = {
    token: string | null;
    id: string;
    data: { title: string; content: string; thumbnail_url?: string; status?: string };
};

export const useUpdateNewsMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateNewsVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, data }: UpdateNewsVars) => updateNews(token, id, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "news"] });
            options?.onSuccess?.(...args);
        },
    });
};

type DeleteNewsVars = { token: string | null; id: string };

export const useDeleteNewsMutation = (
    options?: Omit<UseMutationOptions<any, Error, DeleteNewsVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteNewsVars) => deleteNews(token, id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "news"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── Pengumuman Popup ────────────────────────────────────────────────────────

export const usePopupAnnouncement = (token: string | null) => {
    return useQuery({
        queryKey: ["cms", "popup-announcement"],
        queryFn: () => getPopupAnnouncement(token),
        enabled: !!token,
        retry: false,
    });
};

type UpdatePopupVars = {
    token: string | null;
    data: { title?: string; photo_url?: string; is_active?: boolean };
};

export const useUpdatePopupAnnouncementMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdatePopupVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: UpdatePopupVars) => updatePopupAnnouncement(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "popup-announcement"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── Struktur Kelembagaan ────────────────────────────────────────────────────

export const useOrgList = (token: string | null) => {
    return useQuery({
        queryKey: ["cms", "org-structures"],
        queryFn: () => getOrgList(token),
        enabled: !!token,
    });
};

export const useOrgDetail = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["cms", "org-structures", id],
        queryFn: () => getOrgDetail(token, id),
        enabled: !!token && !!id,
    });
};

type CreateOrgVars = {
    token: string | null;
    data: { name: string; position: string; photo_url?: string; parent_id?: string; order?: number };
};

export const useCreateOrgNodeMutation = (
    options?: Omit<UseMutationOptions<any, Error, CreateOrgVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: CreateOrgVars) => createOrgNode(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "org-structures"] });
            options?.onSuccess?.(...args);
        },
    });
};

type UpdateOrgVars = {
    token: string | null;
    id: string;
    data: { name: string; position: string; photo_url?: string; parent_id?: string; order?: number };
};

export const useUpdateOrgNodeMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateOrgVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, data }: UpdateOrgVars) => updateOrgNode(token, id, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "org-structures"] });
            options?.onSuccess?.(...args);
        },
    });
};

type DeleteOrgVars = { token: string | null; id: string };

export const useDeleteOrgNodeMutation = (
    options?: Omit<UseMutationOptions<any, Error, DeleteOrgVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteOrgVars) => deleteOrgNode(token, id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "org-structures"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── Tentang Aplikasi ────────────────────────────────────────────────────────

export const useAboutApp = (token: string | null) => {
    return useQuery({
        queryKey: ["cms", "about-app"],
        queryFn: () => getAboutApp(token),
        enabled: !!token,
        retry: false,
    });
};

type UpdateAboutAppVars = { token: string | null; data: { title?: string; content?: string } };

export const useUpdateAboutAppMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateAboutAppVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: UpdateAboutAppVars) => updateAboutApp(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "about-app"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── Galeri ──────────────────────────────────────────────────────────────────

export const useGalleryList = (token: string | null, page = 1, search = "") => {
    return useQuery({
        queryKey: ["cms", "galleries", page, search],
        queryFn: () => getGalleryList(token, page, search),
        enabled: !!token,
    });
};

export const useGalleryDetail = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["cms", "galleries", id],
        queryFn: () => getGalleryDetail(token, id),
        enabled: !!token && !!id,
    });
};

type CreateGalleryVars = { token: string | null; data: { title: string; photo_url: string; order?: number } };

export const useCreateGalleryMutation = (
    options?: Omit<UseMutationOptions<any, Error, CreateGalleryVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: CreateGalleryVars) => createGallery(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "galleries"] });
            options?.onSuccess?.(...args);
        },
    });
};

type UpdateGalleryVars = { token: string | null; id: string; data: { title: string; photo_url: string; order?: number } };

export const useUpdateGalleryMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateGalleryVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, data }: UpdateGalleryVars) => updateGallery(token, id, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "galleries"] });
            options?.onSuccess?.(...args);
        },
    });
};

type DeleteGalleryVars = { token: string | null; id: string };

export const useDeleteGalleryMutation = (
    options?: Omit<UseMutationOptions<any, Error, DeleteGalleryVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteGalleryVars) => deleteGallery(token, id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "galleries"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── Kontak Kami ─────────────────────────────────────────────────────────────

export const useContactSetting = (token: string | null) => {
    return useQuery({
        queryKey: ["cms", "contact-setting"],
        queryFn: () => getContactSetting(token),
        enabled: !!token,
        retry: false,
    });
};

type UpdateContactVars = {
    token: string | null;
    data: {
        email?: string;
        phone?: string;
        fax?: string;
        address?: string;
        operational_hours?: string;
    };
};

export const useUpdateContactSettingMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateContactVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: UpdateContactVars) => updateContactSetting(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "contact-setting"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export const useFaqList = (token: string | null, page = 1, search = "") => {
    return useQuery({
        queryKey: ["cms", "faqs", page, search],
        queryFn: () => getFaqList(token, page, search),
        enabled: !!token,
    });
};

export const useFaqDetail = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["cms", "faqs", id],
        queryFn: () => getFaqDetail(token, id),
        enabled: !!token && !!id,
    });
};

type CreateFaqVars = { token: string | null; data: { question: string; answer: string; order?: number } };

export const useCreateFaqMutation = (
    options?: Omit<UseMutationOptions<any, Error, CreateFaqVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: CreateFaqVars) => createFaq(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "faqs"] });
            options?.onSuccess?.(...args);
        },
    });
};

type UpdateFaqVars = { token: string | null; id: string; data: { question: string; answer: string; order?: number } };

export const useUpdateFaqMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateFaqVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, data }: UpdateFaqVars) => updateFaq(token, id, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "faqs"] });
            options?.onSuccess?.(...args);
        },
    });
};

type DeleteFaqVars = { token: string | null; id: string };

export const useDeleteFaqMutation = (
    options?: Omit<UseMutationOptions<any, Error, DeleteFaqVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteFaqVars) => deleteFaq(token, id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "faqs"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── Agenda ──────────────────────────────────────────────────────────────────

export const useAgendaList = (token: string | null, page = 1, search = "") => {
    return useQuery({
        queryKey: ["cms", "agendas", page, search],
        queryFn: () => getAgendaList(token, page, search),
        enabled: !!token,
    });
};

export const useAgendaDetail = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["cms", "agendas", id],
        queryFn: () => getAgendaDetail(token, id),
        enabled: !!token && !!id,
    });
};

type CreateAgendaVars = {
    token: string | null;
    data: { title: string; date: string; photo_url?: string };
};

export const useCreateAgendaMutation = (
    options?: Omit<UseMutationOptions<any, Error, CreateAgendaVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: CreateAgendaVars) => createAgenda(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "agendas"] });
            options?.onSuccess?.(...args);
        },
    });
};

type UpdateAgendaVars = {
    token: string | null;
    id: string;
    data: { title: string; date: string; photo_url?: string };
};

export const useUpdateAgendaMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateAgendaVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, data }: UpdateAgendaVars) => updateAgenda(token, id, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "agendas"] });
            options?.onSuccess?.(...args);
        },
    });
};

type DeleteAgendaVars = { token: string | null; id: string };

export const useDeleteAgendaMutation = (
    options?: Omit<UseMutationOptions<any, Error, DeleteAgendaVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteAgendaVars) => deleteAgenda(token, id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "agendas"] });
            options?.onSuccess?.(...args);
        },
    });
};

// ─── Petunjuk Penggunaan ─────────────────────────────────────────────────────

export const useUserGuideList = (token: string | null) => {
    return useQuery({
        queryKey: ["cms", "user-guides"],
        queryFn: () => getUserGuideList(token),
        enabled: !!token,
    });
};

export const useUserGuideDetail = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["cms", "user-guides", id],
        queryFn: () => getUserGuideDetail(token, id),
        enabled: !!token && !!id,
    });
};

type CreateGuideVars = {
    token: string | null;
    data: { title: string; file_url: string; order?: number };
};

export const useCreateUserGuideMutation = (
    options?: Omit<UseMutationOptions<any, Error, CreateGuideVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: CreateGuideVars) => createUserGuide(token, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "user-guides"] });
            options?.onSuccess?.(...args);
        },
    });
};

type UpdateGuideVars = {
    token: string | null;
    id: string;
    data: { title: string; file_url: string; order?: number };
};

export const useUpdateUserGuideMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateGuideVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, data }: UpdateGuideVars) => updateUserGuide(token, id, data),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "user-guides"] });
            options?.onSuccess?.(...args);
        },
    });
};

type DeleteGuideVars = { token: string | null; id: string };

export const useDeleteUserGuideMutation = (
    options?: Omit<UseMutationOptions<any, Error, DeleteGuideVars>, "mutationFn">
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteGuideVars) => deleteUserGuide(token, id),
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "user-guides"] });
            options?.onSuccess?.(...args);
        },
    });
};
