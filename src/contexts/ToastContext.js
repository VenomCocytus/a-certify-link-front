import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const toast = useRef(null);

    const showSuccess = (detail, summary = 'Success') => {
        toast.current?.show({
            severity: 'success',
            summary,
            detail,
            life: 3000
        });
    };

    const showError = (detail, summary = 'Error') => {
        toast.current?.show({
            severity: 'error',
            summary,
            detail,
            life: 5000
        });
    };

    const showInfo = (detail, summary = 'Info') => {
        toast.current?.show({
            severity: 'info',
            summary,
            detail,
            life: 3000
        });
    };

    const showWarn = (detail, summary = 'Warning') => {
        toast.current?.show({
            severity: 'warn',
            summary,
            detail,
            life: 4000
        });
    };

    const value = {
        showSuccess,
        showError,
        showInfo,
        showWarn
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toast ref={toast} />
        </ToastContext.Provider>
    );
};