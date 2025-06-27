import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    return format(dateObj, formatString);
};

export const formatDateTime = (date, formatString = 'dd/MM/yyyy HH:mm') => {
    return formatDate(date, formatString);
};

export const formatTime = (date, formatString = 'HH:mm') => {
    return formatDate(date, formatString);
};

export const formatRelativeTime = (date) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const formatRelativeDate = (date) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    return formatRelative(dateObj, new Date());
};

// Currency formatting utilities
export const formatCurrency = (amount, currency = 'XAF', locale = 'fr-CM') => {
    if (amount === null || amount === undefined) return '';

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    } catch (error) {
        return `${amount} ${currency}`;
    }
};

export const formatNumber = (number, locale = 'fr-CM') => {
    if (number === null || number === undefined) return '';

    try {
        return new Intl.NumberFormat(locale).format(number);
    } catch (error) {
        return number.toString();
    }
};

export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '';

    return `${Number(value).toFixed(decimals)}%`;
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';

    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 10) {
        // Format as: (XXX) XXX-XXXX
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        // Format as: +1 (XXX) XXX-XXXX
        return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    } else if (cleaned.startsWith('237')) {
        // Cameroon format
        return cleaned.replace(/(\d{3})(\d{1})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
    }

    return phoneNumber;
};

// Name formatting
export const formatName = (firstName, lastName) => {
    if (!firstName && !lastName) return '';
    if (!firstName) return lastName;
    if (!lastName) return firstName;
    return `${firstName} ${lastName}`;
};

export const formatInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
};

// Text formatting utilities
export const truncateText = (text, maxLength = 50, suffix = '...') => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirst = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

export const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// File size formatting
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Certificate status formatting
export const formatCertificateStatus = (status) => {
    const statusMap = {
        active: 'Active',
        pending: 'Pending',
        suspended: 'Suspended',
        cancelled: 'Cancelled',
        expired: 'Expired'
    };

    return statusMap[status] || capitalizeFirst(status);
};

// Order status formatting
export const formatOrderStatus = (status) => {
    const statusMap = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        cancelled: 'Cancelled',
        delivered: 'Delivered',
        processing: 'Processing'
    };

    return statusMap[status] || capitalizeFirst(status);
};

// Reference number formatting
export const formatReference = (reference, prefix = '') => {
    if (!reference) return '';

    if (prefix && !reference.startsWith(prefix)) {
        return `${prefix}-${reference}`;
    }

    return reference;
};

// Vehicle registration formatting
export const formatVehicleRegistration = (registration) => {
    if (!registration) return '';

    // Format as CM-XXX-ABC or similar pattern
    const cleaned = registration.replace(/\s+/g, '').toUpperCase();

    if (cleaned.match(/^[A-Z]{2}\d{3}[A-Z]{3}$/)) {
        return cleaned.replace(/([A-Z]{2})(\d{3})([A-Z]{3})/, '$1-$2-$3');
    }

    return registration.toUpperCase();
};

// Address formatting
export const formatAddress = (address) => {
    if (!address) return '';

    if (typeof address === 'string') return address;

    const parts = [
        address.street,
        address.city,
        address.region,
        address.country
    ].filter(Boolean);

    return parts.join(', ');
};

// Error message formatting
export const formatErrorMessage = (error) => {
    if (typeof error === 'string') return error;

    if (error?.message) return error.message;

    if (error?.detail) return error.detail;

    if (Array.isArray(error)) {
        return error.map(err => formatErrorMessage(err)).join(', ');
    }

    return 'An unexpected error occurred';
};

// Validation error formatting
export const formatValidationErrors = (errors) => {
    if (!errors || typeof errors !== 'object') return [];

    return Object.entries(errors).map(([field, message]) => ({
        field,
        message: Array.isArray(message) ? message[0] : message
    }));
};

// URL formatting
export const formatApiUrl = (endpoint) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || '/api';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

// Query parameters formatting
export const formatQueryParams = (params) => {
    if (!params || typeof params !== 'object') return '';

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, v));
            } else {
                searchParams.append(key, value.toString());
            }
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

// Duration formatting
export const formatDuration = (milliseconds) => {
    if (!milliseconds) return '0s';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

// Mask sensitive data
export const maskEmail = (email) => {
    if (!email) return '';

    const [username, domain] = email.split('@');
    if (!domain) return email;

    const maskedUsername = username.length > 2
        ? username.substring(0, 2) + '*'.repeat(username.length - 2)
        : '*'.repeat(username.length);

    return `${maskedUsername}@${domain}`;
};

export const maskPhoneNumber = (phone) => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;

    const start = cleaned.substring(0, 3);
    const end = cleaned.substring(cleaned.length - 2);
    const masked = '*'.repeat(cleaned.length - 5);

    return `${start}${masked}${end}`;
};