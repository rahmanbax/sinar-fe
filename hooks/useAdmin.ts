import { useQuery, useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { getOrganizations, createManualAdmin, createManualMember, importAdminData, getAdminUsers, getAdminUser, rejectAdminRegistration, approveAdminRegistration, updateAdminStatus } from "@/api/admin";


type UpdateStatusVariables = {
    token: string | null;
    id: string;
    status: boolean;
};

export const useUpdateAdminStatusMutation = (
    options?: Omit<UseMutationOptions<any, Error, UpdateStatusVariables>, 'mutationFn'>
) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (vars: UpdateStatusVariables) => {
            const result = await updateAdminStatus(vars.token, vars.id, vars.status);
            if (result.error) throw new Error(result.message);
            return result;
        },
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            if (options?.onSuccess) {
                options.onSuccess(...args);
            }
        },
    });
};

export const useOrganizations = () => {
    return useQuery({
        queryKey: ["admin", "organizations"],
        queryFn: () => getOrganizations(),
        staleTime: Infinity,
    });
};

export const useAdminUsers = (token: string | null, page: number = 1, search: string = "") => {
    return useQuery({
        queryKey: ["admin", "users", page, search],
        queryFn: () => getAdminUsers(token, page, search),
        enabled: !!token,
    });
};

export const useAdminUser = (token: string | null, id: string) => {
    return useQuery({
        queryKey: ["admin", "users", id],
        queryFn: () => getAdminUser(token, id),
        enabled: !!token && !!id,
    });
};

type ManualAdminVariables = {
    token: string | null;
    org_id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    recommendation_file: File;
    ref_number: string;
    is_admin_big: boolean;
};

export const useCreateManualAdminMutation = (
    options?: Omit<UseMutationOptions<any, Error, ManualAdminVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async (vars: ManualAdminVariables) => {
            const result = await createManualAdmin(vars.token, {
                org_id: vars.org_id,
                name: vars.name,
                email: vars.email,
                phone: vars.phone,
                password: vars.password,
                password_confirmation: vars.password_confirmation,
                recommendation_file: vars.recommendation_file,
                ref_number: vars.ref_number,
                is_admin_big: vars.is_admin_big,
            });
            if (result.error) throw new Error(result.message);
            return result;
        },
        ...options,
    });
};

type ManualMemberVariables = {
    token: string | null;
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    password_confirmation: string;
    recommendation_file: File;
    ref_number: string;
};

export const useCreateManualMemberMutation = (
    options?: Omit<UseMutationOptions<any, Error, ManualMemberVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async (vars: ManualMemberVariables) => {
            const result = await createManualMember(vars.token, {
                name: vars.name,
                email: vars.email,
                phone: vars.phone,
                role: vars.role,
                password: vars.password,
                password_confirmation: vars.password_confirmation,
                recommendation_file: vars.recommendation_file,
                ref_number: vars.ref_number,
            });
            if (result.error) throw new Error(result.message);
            return result;
        },
        ...options,
    });
};

type ImportAdminVariables = {
    token: string | null;
    org_id: string;
    user_file: File;
    recommendation_file: File;
    ref_number: string;
};

export const useImportAdminMutation = (
    options?: Omit<UseMutationOptions<any, Error, ImportAdminVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async (vars: ImportAdminVariables) => {
            const result = await importAdminData(vars.token, {
                org_id: vars.org_id,
                user_file: vars.user_file,
                recommendation_file: vars.recommendation_file,
                ref_number: vars.ref_number,
            });
            if (result.error) throw new Error(result.message);
            return result;
        },
        ...options,
    });
};

type RejectRegistrationVariables = {
    token: string | null;
    id: string;
    note: string;
};

export const useRejectRegistrationMutation = (
    options?: Omit<UseMutationOptions<any, Error, RejectRegistrationVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async (vars: RejectRegistrationVariables) => {
            const result = await rejectAdminRegistration(
                vars.token,
                vars.id,
                vars.note
            );
            if (result.error) throw new Error(result.message);
            return result;
        },
        ...options,
    });
};

type ApproveRegistrationVariables = {
    token: string | null;
    id: string;
};

export const useApproveRegistrationMutation = (
    options?: Omit<UseMutationOptions<any, Error, ApproveRegistrationVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async (vars: ApproveRegistrationVariables) => {
            const result = await approveAdminRegistration(vars.token, vars.id);
            if (result.error) throw new Error(result.message);
            return result;
        },
        ...options,
    });
};
