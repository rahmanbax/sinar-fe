import { useMutation, useQuery, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import {
    adminGetRooms, adminGetRoom, adminCreateRoom, adminUpdateRoom, adminDeleteRoom,
    adminGetTopics, adminGetTopic, adminUpdateTopicStatus, adminDeleteTopic,
    adminReplyTopic, adminUpdateReplyStatus, adminDeleteReply,
} from "@/api/forum";

// ─── Rooms ───────────────────────────────────────────────────────────────────

export const useAdminRooms = (token: string | null) =>
    useQuery({ queryKey: ["forum", "rooms"], queryFn: () => adminGetRooms(token), enabled: !!token });

export const useAdminRoom = (token: string | null, id: string) =>
    useQuery({ queryKey: ["forum", "rooms", id], queryFn: () => adminGetRoom(token, id), enabled: !!token && !!id });

type CreateRoomVars = { token: string | null; data: { title: string; description?: string; order?: number; is_active?: boolean } };
export const useCreateRoomMutation = (options?: Omit<UseMutationOptions<any, Error, CreateRoomVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, data }: CreateRoomVars) => adminCreateRoom(token, data),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "rooms"] }); options?.onSuccess?.(...a); },
    });
};

type UpdateRoomVars = { token: string | null; id: string; data: { title: string; description?: string; order?: number; is_active?: boolean } };
export const useUpdateRoomMutation = (options?: Omit<UseMutationOptions<any, Error, UpdateRoomVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, data }: UpdateRoomVars) => adminUpdateRoom(token, id, data),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "rooms"] }); options?.onSuccess?.(...a); },
    });
};

type DeleteRoomVars = { token: string | null; id: string };
export const useDeleteRoomMutation = (options?: Omit<UseMutationOptions<any, Error, DeleteRoomVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteRoomVars) => adminDeleteRoom(token, id),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "rooms"] }); options?.onSuccess?.(...a); },
    });
};

// ─── Topics ──────────────────────────────────────────────────────────────────

export const useAdminTopics = (token: string | null, params: { page?: number; status?: string; room_id?: string; search?: string }) =>
    useQuery({
        queryKey: ["forum", "topics", params],
        queryFn: () => adminGetTopics(token, params),
        enabled: !!token,
    });

export const useAdminTopic = (token: string | null, id: string) =>
    useQuery({ queryKey: ["forum", "topics", id], queryFn: () => adminGetTopic(token, id), enabled: !!token && !!id });

type TopicStatusVars = { token: string | null; id: string; status: "pending" | "approved" | "rejected" };
export const useUpdateTopicStatusMutation = (options?: Omit<UseMutationOptions<any, Error, TopicStatusVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, status }: TopicStatusVars) => adminUpdateTopicStatus(token, id, status),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "topics"] }); options?.onSuccess?.(...a); },
    });
};

type DeleteTopicVars = { token: string | null; id: string };
export const useDeleteTopicMutation = (options?: Omit<UseMutationOptions<any, Error, DeleteTopicVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteTopicVars) => adminDeleteTopic(token, id),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "topics"] }); options?.onSuccess?.(...a); },
    });
};

type AdminReplyVars = { token: string | null; topicId: string; content: string };
export const useAdminReplyMutation = (options?: Omit<UseMutationOptions<any, Error, AdminReplyVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, topicId, content }: AdminReplyVars) => adminReplyTopic(token, topicId, content),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "topics"] }); options?.onSuccess?.(...a); },
    });
};

// ─── Replies ─────────────────────────────────────────────────────────────────

type ReplyStatusVars = { token: string | null; id: string; status: "pending" | "approved" };
export const useUpdateReplyStatusMutation = (options?: Omit<UseMutationOptions<any, Error, ReplyStatusVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id, status }: ReplyStatusVars) => adminUpdateReplyStatus(token, id, status),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "topics"] }); options?.onSuccess?.(...a); },
    });
};

type DeleteReplyVars = { token: string | null; id: string };
export const useDeleteReplyMutation = (options?: Omit<UseMutationOptions<any, Error, DeleteReplyVars>, "mutationFn">) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: DeleteReplyVars) => adminDeleteReply(token, id),
        ...options,
        onSuccess: (...a) => { qc.invalidateQueries({ queryKey: ["forum", "topics"] }); options?.onSuccess?.(...a); },
    });
};
