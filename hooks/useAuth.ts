import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { loginUser, registerUser } from '@/api/auth';

type LoginVariables = {
    email: string;
    password: string;
};

export const useLoginMutation = (
    options?: Omit<UseMutationOptions<any, Error, LoginVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async ({ email, password }: LoginVariables) => {
            // Memanggil endpoint asli dari api/auth.ts
            const responseData = await loginUser(email, password);
            
            // Catatan: Karena `loginUser` mereturn `res.json()` mentah tanpa blok if(!res.ok), 
            // kita menangkap respons gagal secara dinamis di sini
            if (responseData && (responseData.error || responseData.statusCode >= 400 || responseData.message?.toLowerCase().includes('fail') || responseData.message?.toLowerCase().includes('unauthorized'))) {
                throw new Error(responseData.message || responseData.error || 'Terjadi kesalahan saat login.');
            }
            
            return responseData;
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
    user_type_id: string | number;
};

export const useRegisterMutation = (
    options?: Omit<UseMutationOptions<any, Error, RegisterVariables>, 'mutationFn'>
) => {
    return useMutation({
        mutationFn: async (vars: RegisterVariables) => {
            const responseData = await registerUser(vars);
            
            // Tangkap dan lemparkan status gagal dari parser error API
            if (responseData && (responseData.error || responseData.statusCode >= 400 || responseData.message?.toLowerCase().includes('fail') || responseData.message?.toLowerCase().includes('already') || responseData.message?.toLowerCase().includes('taken'))) {
                // Return respon error utama, atau coba mengekstrak objek "errors" yang biasanya dilempar validator form backend (seperti Laravel)
                const validationError = responseData.errors ? Object.values(responseData.errors)[0] : null;
                throw new Error(validationError ? String(validationError) : (responseData.message || responseData.error || 'Terjadi kesalahan saat pendaftaran.'));
            }
            
            return responseData;
        },
        ...options,
    });
};