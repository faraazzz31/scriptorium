import { createContext, useContext } from 'react';

export interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}