import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Get theme from localStorage or default to 'light'
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        // Apply theme to document
        applyTheme(theme);
        // Save theme to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const applyTheme = (themeName) => {
        // Remove existing theme links
        const existingThemeLinks = document.querySelectorAll('link[data-theme]');
        existingThemeLinks.forEach(link => link.remove());

        // Create new theme link
        const themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.setAttribute('data-theme', themeName);

        if (themeName === 'dark') {
            themeLink.href = 'https://unpkg.com/primereact/resources/themes/vela-blue/theme.css';
        } else {
            themeLink.href = 'https://unpkg.com/primereact/resources/themes/lara-light-indigo/theme.css';
        }

        document.head.appendChild(themeLink);

        // Update body class for additional styling
        document.body.className = document.body.className.replace(/theme-\w+/, '');
        document.body.classList.add(`theme-${themeName}`);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setThemeMode = (newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setTheme(newTheme);
        }
    };

    const value = {
        theme,
        toggleTheme,
        setThemeMode,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};