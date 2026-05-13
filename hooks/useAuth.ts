import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { registerAdmin } from '@/api/auth';

type LoginVariables = {
    email: string;
    password: string;
};

export const useLoginMutation = (
    options?: Omit<UseMutationOptions<any, Error, LoginVariables>, 'mutationFn'>
) => {
    const { login } = useAuthContext();

    return useMutation({
        mutationFn: async ({ email, password }: LoginVariables) => {
            // Gunakan metode login dari Context yang akan otomatis menyimpan Token dan Me-redirect route
            await login(email, password);
            return true;
        },
        ...options,
    });
};

type RegisterVariables = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone_number: string;
};

export const useRegisterMutation = (
    options?: Omit<UseMutationOptions<any, Error, RegisterVariables>, 'mutationFn'>
) => {
    const { register } = useAuthContext();

    return useMutation({
        mutationFn: async (vars: RegisterVariables) => {
            await register(
                vars.name, 
                vars.email, 
                vars.password, 
                vars.password_confirmation, 
                vars.phone_number
            );
            return true;
        },
        ...options,
    });
};

type RegisterAdminVariables = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    recommendation_file: File;
    ref_number: string;
    invite_token?: string | null;
};

export const useRegisterAdminMutation = (
    options?: Omit<UseMutationOptions<any, Error, RegisterAdminVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async (vars: RegisterAdminVariables) => {
            const result = await registerAdmin(vars);
            return result;
        },
        ...options,
    });
};