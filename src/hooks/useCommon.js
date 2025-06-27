import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/apiService';
import { LOADING_STATES } from '../utils/constants';

// Custom hook for API calls with loading states
export const useApiCall = (apiFunction, dependencies = [], options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showError } = useToast();
    const mountedRef = useRef(true);

    const {
        immediate = true,
        onSuccess,
        onError,
        errorMessage = 'An error occurred while fetching data'
    } = options;

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiFunction(...args);

            if (mountedRef.current) {
                setData(result.data);
                onSuccess?.(result.data);
            }

            return result.data;
        } catch (err) {
            if (mountedRef.current) {
                setError(err);
                onError?.(err);
                showError(err.response?.data?.message || errorMessage);
            }
            throw err;
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [apiFunction, onSuccess, onError, errorMessage, showError]);

    useEffect(() => {
        if (immediate) {
            execute();
        }

        return () => {
            mountedRef.current = false;
        };
    }, dependencies);

    return { data, loading, error, execute, refetch: execute };
};

// Custom hook for form state management
export const useForm = (initialValues, validationSchema = null) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const setFieldTouched = useCallback((name, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    const validateField = useCallback((name, value) => {
        if (!validationSchema || !validationSchema[name]) return '';

        const rules = validationSchema[name];

        if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            return rules.requiredMessage || `${name} is required`;
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            return rules.minLengthMessage || `${name} must be at least ${rules.minLength} characters`;
        }

        if (value && rules.maxLength && value.length > rules.maxLength) {
            return rules.maxLengthMessage || `${name} cannot exceed ${rules.maxLength} characters`;
        }

        if (value && rules.pattern && !rules.pattern.test(value)) {
            return rules.patternMessage || `${name} format is invalid`;
        }

        if (rules.custom) {
            return rules.custom(value, values);
        }

        return '';
    }, [validationSchema, values]);

    const validateForm = useCallback(() => {
        if (!validationSchema) return true;

        const newErrors = {};
        let isValid = true;

        Object.keys(validationSchema).forEach(fieldName => {
            const error = validateField(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [validationSchema, values, validateField]);

    const handleSubmit = useCallback(async (onSubmit) => {
        setIsSubmitting(true);

        try {
            const isValid = validateForm();
            if (!isValid) return false;

            await onSubmit(values);
            return true;
        } catch (error) {
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        setValue,
        setFieldTouched,
        setFieldError,
        validateField,
        validateForm,
        handleSubmit,
        reset
    };
};

// Custom hook for pagination
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [total, setTotal] = useState(0);

    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const goToPage = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }, [totalPages]);

    const goToNextPage = useCallback(() => {
        if (hasNextPage) {
            setPage(prev => prev + 1);
        }
    }, [hasNextPage]);

    const goToPreviousPage = useCallback(() => {
        if (hasPreviousPage) {
            setPage(prev => prev - 1);
        }
    }, [hasPreviousPage]);

    const changePageSize = useCallback((newPageSize) => {
        setPageSize(newPageSize);
        setPage(1); // Reset to first page when changing page size
    }, []);

    const reset = useCallback(() => {
        setPage(initialPage);
        setPageSize(initialPageSize);
        setTotal(0);
    }, [initialPage, initialPageSize]);

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        setPage: goToPage,
        setPageSize: changePageSize,
        setTotal,
        goToNextPage,
        goToPreviousPage,
        reset
    };
};

// Custom hook for local storage
export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    const setStoredValue = useCallback((newValue) => {
        try {
            setValue(newValue);
            window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    const removeValue = useCallback(() => {
        try {
            setValue(defaultValue);
            window.localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, defaultValue]);

    return [value, setStoredValue, removeValue];
};

// Custom hook for debounced values
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Custom hook for previous value
export const usePrevious = (value) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
};

// Custom hook for async operation with loading state
export const useAsyncOperation = () => {
    const [loading, setLoading] = useState(false);
    const { showError, showSuccess } = useToast();

    const execute = useCallback(async (asyncFunction, options = {}) => {
        const {
            loadingMessage,
            successMessage,
            errorMessage = 'Operation failed',
            onSuccess,
            onError
        } = options;

        try {
            setLoading(true);

            if (loadingMessage) {
                // Could show loading toast if needed
            }

            const result = await asyncFunction();

            if (successMessage) {
                showSuccess(successMessage);
            }

            onSuccess?.(result);
            return result;
        } catch (error) {
            const message = error.response?.data?.message || errorMessage;
            showError(message);
            onError?.(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [showError, showSuccess]);

    return { loading, execute };
};

// Custom hook for window dimensions
export const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
};

// Custom hook for media queries
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);

        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};

// Custom hook for online status
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

// Custom hook for copying to clipboard
export const useClipboard = (timeout = 2000) => {
    const [copied, setCopied] = useState(false);
    const { showSuccess, showError } = useToast();

    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            showSuccess('Copied to clipboard');

            setTimeout(() => setCopied(false), timeout);
        } catch (error) {
            showError('Failed to copy to clipboard');
        }
    }, [timeout, showSuccess, showError]);

    return { copied, copy };
};

// Custom hook for intersection observer
export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [options]);

    return [ref, isIntersecting];
};