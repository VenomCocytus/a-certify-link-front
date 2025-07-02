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

    // **NEW**: Show toast for download operations
    const showDownloadSuccess = (source = 'external') => {
        const sourceText = source === 'database' ? 'database' : 'external API';
        showSuccess(`Certificate downloaded successfully from ${sourceText}`);
    };

    const showDownloadError = (source = 'external') => {
        const sourceText = source === 'database' ? 'database' : 'external API';
        showError(`Failed to download certificate from ${sourceText}`);
    };

    // **NEW**: Show toast for API operation results
    const showApiSuccess = (operation, detail) => {
        showSuccess(detail || `${operation} completed successfully`);
    };

    const showApiError = (operation, detail) => {
        showError(detail || `Failed to ${operation.toLowerCase()}`);
    };

    // **NEW**: Show toast for production operations
    const showProductionSuccess = (operation) => {
        const messages = {
            create: 'Production request created successfully',
            update: 'Production updated successfully',
            delete: 'Production deleted successfully',
            download: 'Production downloaded successfully',
            suspend: 'Production suspended successfully',
            cancel: 'Production cancelled successfully'
        };
        showSuccess(messages[operation] || 'Production operation completed successfully');
    };

    const showProductionError = (operation, error) => {
        const messages = {
            create: 'Failed to create production request',
            update: 'Failed to update production',
            delete: 'Failed to delete production',
            download: 'Failed to download production',
            suspend: 'Failed to suspend production',
            cancel: 'Failed to cancel production'
        };

        let detail = messages[operation] || 'Production operation failed';

        // **NEW**: Handle specific API error responses
        if (error?.response?.data?.errors) {
            const apiError = error.response.data.errors[0];
            if (apiError?.detail) {
                detail = apiError.detail;
            }
        } else if (error?.message) {
            detail = error.message;
        }

        showError(detail);
    };

    // **NEW**: Show toast for authentication operations
    const showAuthSuccess = (operation) => {
        const messages = {
            login: 'Logged in successfully',
            logout: 'Logged out successfully',
            register: 'Account created successfully',
            forgotPassword: 'Password reset email sent',
            resetPassword: 'Password reset successfully',
            updateProfile: 'Profile updated successfully'
        };
        showSuccess(messages[operation] || 'Authentication operation completed');
    };

    const showAuthError = (operation, error) => {
        const messages = {
            login: 'Login failed',
            logout: 'Logout failed',
            register: 'Registration failed',
            forgotPassword: 'Failed to send reset email',
            resetPassword: 'Password reset failed',
            updateProfile: 'Profile update failed'
        };

        let detail = messages[operation] || 'Authentication failed';

        // Handle API error responses
        if (error?.response?.status === 401) {
            detail = 'Invalid credentials or session expired';
        } else if (error?.response?.data?.errors) {
            const apiError = error.response.data.errors[0];
            if (apiError?.detail) {
                detail = apiError.detail;
            }
        }

        showError(detail);
    };

    const value = {
        showSuccess,
        showError,
        showInfo,
        showWarn,
        showDownloadSuccess, // **NEW**
        showDownloadError, // **NEW**
        showApiSuccess, // **NEW**
        showApiError, // **NEW**
        showProductionSuccess, // **NEW**
        showProductionError, // **NEW**
        showAuthSuccess, // **NEW**
        showAuthError // **NEW**
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toast ref={toast} />
        </ToastContext.Provider>
    );
};