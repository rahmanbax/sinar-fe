import { useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getOrganizations, createManualAdmin, importAdminData } from "@/api/admin";

export const useOrganizations = (token: string | null) => {
    return useQuery({
        queryKey: ["admin", "organizations"],
        queryFn: () => getOrganizations(token),
        enabled: !!token,
        staleTime: Infinity,
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
