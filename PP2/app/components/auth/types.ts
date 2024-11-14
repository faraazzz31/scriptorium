export interface UserData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar: string;
    phone?: string;
}

export interface AuthContextType {
    user: UserData | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    loading: boolean;
    refetchUser: () => Promise<void>;
}