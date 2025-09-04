// Application constants

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
    TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Authentication Constants
export const AUTH_CONFIG = {
    TOKEN_KEY: 'accessToken',
    USER_KEY: 'user',
    REFRESH_TOKEN_KEY: 'refreshToken',
    SESSION_TIMEOUT: parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000, // 1 hour
    IDLE_TIMEOUT: parseInt(process.env.REACT_APP_IDLE_TIMEOUT) || 1800000, // 30 minutes
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 100,
    TWO_FACTOR_CODE_LENGTH: 6
};

// Application Routes
export const ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    CERTIFICATES: '/certificates',
    ORDERS: '/orders',
    PRODUCTIONS: '/productions',
    ORGANIZATIONS: '/organizations',
    USERS: '/users',
    SETTINGS: '/settings',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email'
};

// Certificate Status
export const CERTIFICATE_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
};

export const CERTIFICATE_STATUS_LABELS = {
    [CERTIFICATE_STATUS.ACTIVE]: 'Active',
    [CERTIFICATE_STATUS.PENDING]: 'Pending',
    [CERTIFICATE_STATUS.SUSPENDED]: 'Suspended',
    [CERTIFICATE_STATUS.CANCELLED]: 'Cancelled',
    [CERTIFICATE_STATUS.EXPIRED]: 'Expired'
};

export const CERTIFICATE_STATUS_COLORS = {
    [CERTIFICATE_STATUS.ACTIVE]: 'success',
    [CERTIFICATE_STATUS.PENDING]: 'warning',
    [CERTIFICATE_STATUS.SUSPENDED]: 'danger',
    [CERTIFICATE_STATUS.CANCELLED]: 'secondary',
    [CERTIFICATE_STATUS.EXPIRED]: 'danger'
};

// Certificate Types
export const CERTIFICATE_TYPES = {
    CIMA: 'cima',
    POOLTPV: 'pooltpv',
    MATCA: 'matca',
    POOLTPVBLEU: 'pooltpvbleu'
};

export const CERTIFICATE_TYPE_LABELS = {
    [CERTIFICATE_TYPES.CIMA]: 'CIMA',
    [CERTIFICATE_TYPES.POOLTPV]: 'Pool TPV',
    [CERTIFICATE_TYPES.MATCA]: 'MATCA',
    [CERTIFICATE_TYPES.POOLTPVBLEU]: 'Pool TPV Bleu'
};

// Certificate Colors
export const CERTIFICATE_COLORS = {
    CIMA_JAUNE: 'cima-jaune',
    CIMA_VERTE: 'cima-verte',
    POOLTPV_ROUGE: 'pooltpv-rouge',
    POOLTPV_BLEU: 'pooltpv-bleu',
    POOLTPV_MARRON: 'pooltpv-marron',
    MATCA_BLEU: 'matca-bleu'
};

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    DELIVERED: 'delivered',
    PROCESSING: 'processing',
    CONFIRMED: 'confirmed'
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.APPROVED]: 'Approved',
    [ORDER_STATUS.REJECTED]: 'Rejected',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.PROCESSING]: 'Processing',
    [ORDER_STATUS.CONFIRMED]: 'Confirmed'
};

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: 'warning',
    [ORDER_STATUS.APPROVED]: 'success',
    [ORDER_STATUS.REJECTED]: 'danger',
    [ORDER_STATUS.CANCELLED]: 'secondary',
    [ORDER_STATUS.DELIVERED]: 'info',
    [ORDER_STATUS.PROCESSING]: 'primary',
    [ORDER_STATUS.CONFIRMED]: 'success'
};

// Production/Transaction Types
export const TRANSACTION_TYPES = {
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw'
};

export const PRODUCTION_CHANNELS = {
    API: 'api',
    WEB: 'web'
};

// Vehicle Types and Categories
export const VEHICLE_CODES = {
    // Usage Vehicle
    UV01: 'UV01', UV02: 'UV02', UV03: 'UV03', UV04: 'UV04', UV05: 'UV05',
    UV06: 'UV06', UV07: 'UV07', UV08: 'UV08', UV09: 'UV09', UV10: 'UV10',

    // Special Transport
    ST01: 'ST01', ST02: 'ST02', ST03: 'ST03', ST04: 'ST04', ST05: 'ST05',
    ST06: 'ST06', ST07: 'ST07', ST08: 'ST08', ST09: 'ST09', ST10: 'ST10',
    ST11: 'ST11', ST12: 'ST12',

    // Transport Categories
    TAPP: 'TAPP', TAPM: 'TAPM', TSPP: 'TSPP', TSPM: 'TSPM',

    // Tourism Vehicle
    TV01: 'TV01', TV02: 'TV02', TV03: 'TV03', TV04: 'TV04', TV05: 'TV05',
    TV06: 'TV06', TV07: 'TV07', TV08: 'TV08', TV09: 'TV09', TV10: 'TV10',
    TV11: 'TV11', TV12: 'TV12', TV13: 'TV13',

    // Goods Vehicle
    GV01: 'GV01', GV02: 'GV02', GV03: 'GV03', GV04: 'GV04', GV05: 'GV05',
    GV06: 'GV06', GV07: 'GV07', GV08: 'GV08', GV09: 'GV09', GV10: 'GV10',
    GV11: 'GV11', GV12: 'GV12',

    // Numeric Categories
    '01': '01', '02': '02', '03': '03', '04': '04', '05': '05',
    '06': '06', '07': '07', '08': '08', '09': '09', '10': '10',
    '11': '11', '12': '12',

    // Special Energy Types
    SEES: 'SEES', SEDI: 'SEDI', SEHY: 'SEHY', SEEL: 'SEEL'
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    AGENT: 'agent',
    USER: 'user',
    VIEWER: 'viewer'
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.MANAGER]: 'Manager',
    [USER_ROLES.AGENT]: 'Agent',
    [USER_ROLES.USER]: 'User',
    [USER_ROLES.VIEWER]: 'Viewer'
};

// File Upload Constants
export const FILE_UPLOAD = {
    MAX_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760, // 10MB
    ALLOWED_TYPES: (process.env.REACT_APP_ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png').split(','),
    MIME_TYPES: {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif'
    }
};

// Pagination Constants
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 10,
    MAX_PAGE_SIZE: parseInt(process.env.REACT_APP_MAX_PAGE_SIZE) || 100,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
};

// Notification Types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Theme Colors
export const THEME_COLORS = {
    PRIMARY: '#007ad9',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40'
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
    API: 'yyyy-MM-dd',
    API_TIME: 'yyyy-MM-dd HH:mm:ss',
    TIME_ONLY: 'HH:mm',
    MONTH_YEAR: 'MM/yyyy',
    FULL_DATE: 'EEEE, dd MMMM yyyy'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    USER_DATA: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
    PREFERENCES: 'userPreferences',
    FILTERS: 'savedFilters',
    LAST_ACTIVITY: 'lastActivity'
};

// Error Codes
export const ERROR_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500,
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

// Loading States
export const LOADING_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
};

// Feature Flags
export const FEATURES = {
    TWO_FACTOR: process.env.REACT_APP_ENABLE_TWO_FACTOR === 'true',
    EMAIL_VERIFICATION: process.env.REACT_APP_ENABLE_EMAIL_VERIFICATION === 'true',
    PROFILE_PICTURES: process.env.REACT_APP_ENABLE_PROFILE_PICTURES === 'true',
    NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true'
};

// Statistics Time Ranges
export const TIME_RANGES = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
    ALL_TIME: 'all_time'
};

export const TIME_RANGE_LABELS = {
    [TIME_RANGES.TODAY]: 'Today',
    [TIME_RANGES.WEEK]: 'This Week',
    [TIME_RANGES.MONTH]: 'This Month',
    [TIME_RANGES.QUARTER]: 'This Quarter',
    [TIME_RANGES.YEAR]: 'This Year',
    [TIME_RANGES.ALL_TIME]: 'All Time'
};

// Chart Colors
export const CHART_COLORS = [
    '#007ad9', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#6c757d', '#343a40'
];

// Currency Settings
export const CURRENCY = {
    CODE: 'XAF',
    SYMBOL: 'FCFA',
    LOCALE: 'fr-CM',
    DECIMAL_PLACES: 0
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    NAME: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    VEHICLE_REGISTRATION: /^[A-Z]{2}-\d{3}-[A-Z]{3}$/,
    TWO_FACTOR_CODE: /^\d{6}$/
};

// HTTP Methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
};

// Menu Items Configuration
export const MENU_ITEMS = {
    DASHBOARD: {
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: ROUTES.DASHBOARD
    },
    CERTIFICATES: {
        label: 'Certificates',
        icon: 'pi pi-file-pdf',
        route: ROUTES.CERTIFICATES,
        children: [
            { label: 'View All', icon: 'pi pi-list' },
            { label: 'Statistics', icon: 'pi pi-chart-bar' }
        ]
    },
    ORDERS: {
        label: 'Orders',
        icon: 'pi pi-shopping-cart',
        route: ROUTES.ORDERS,
        children: [
            { label: 'View Orders', icon: 'pi pi-list' },
            { label: 'Create Order', icon: 'pi pi-plus' }
        ]
    },
    PRODUCTIONS: {
        label: 'Productions',
        icon: 'pi pi-cog',
        route: ROUTES.PRODUCTIONS,
        children: [
            { label: 'View Productions', icon: 'pi pi-list' },
            { label: 'Create Production', icon: 'pi pi-plus' }
        ]
    }
};

// Export all constants as default
export default {
    API_CONFIG,
    AUTH_CONFIG,
    ROUTES,
    CERTIFICATE_STATUS,
    CERTIFICATE_STATUS_LABELS,
    CERTIFICATE_STATUS_COLORS,
    CERTIFICATE_TYPES,
    CERTIFICATE_TYPE_LABELS,
    CERTIFICATE_COLORS,
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS,
    TRANSACTION_TYPES,
    PRODUCTION_CHANNELS,
    VEHICLE_CODES,
    USER_ROLES,
    USER_ROLE_LABELS,
    FILE_UPLOAD,
    PAGINATION,
    NOTIFICATION_TYPES,
    THEME_COLORS,
    DATE_FORMATS,
    STORAGE_KEYS,
    ERROR_CODES,
    LOADING_STATES,
    FEATURES,
    TIME_RANGES,
    TIME_RANGE_LABELS,
    CHART_COLORS,
    CURRENCY,
    VALIDATION_PATTERNS,
    HTTP_METHODS,
    MENU_ITEMS
};