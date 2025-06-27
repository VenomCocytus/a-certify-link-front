// Validation utilities matching backend DTOs

export const ValidationRules = {
    // Email validation
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please provide a valid email address'
    },

    // Password validation (matches backend regex)
    password: {
        required: true,
        minLength: 8,
        maxLength: 100,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },

    // Name validation
    name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
        message: 'Name must contain only letters, spaces, hyphens, and apostrophes'
    },

    // Phone number validation
    phoneNumber: {
        minLength: 10,
        maxLength: 20,
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        message: 'Please enter a valid phone number'
    },

    // Two-factor code validation
    twoFactorCode: {
        required: true,
        length: 6,
        pattern: /^\d{6}$/,
        message: 'Two-factor code must be 6 digits'
    },

    // UUID validation
    uuid: {
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        message: 'Invalid ID format'
    }
};

export class Validator {
    constructor() {
        this.errors = {};
    }

    // Validate email
    validateEmail(value, fieldName = 'email') {
        const rule = ValidationRules.email;

        if (rule.required && (!value || !value.trim())) {
            this.errors[fieldName] = 'Email is required';
            return false;
        }

        if (value && !rule.pattern.test(value)) {
            this.errors[fieldName] = rule.message;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate password
    validatePassword(value, fieldName = 'password') {
        const rule = ValidationRules.password;

        if (rule.required && (!value || !value.trim())) {
            this.errors[fieldName] = 'Password is required';
            return false;
        }

        if (value && value.length < rule.minLength) {
            this.errors[fieldName] = `Password must be at least ${rule.minLength} characters long`;
            return false;
        }

        if (value && value.length > rule.maxLength) {
            this.errors[fieldName] = `Password cannot exceed ${rule.maxLength} characters`;
            return false;
        }

        if (value && !rule.pattern.test(value)) {
            this.errors[fieldName] = rule.message;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate name (first name, last name)
    validateName(value, fieldName = 'name') {
        const rule = ValidationRules.name;

        if (rule.required && (!value || !value.trim())) {
            this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            return false;
        }

        if (value && value.trim().length < rule.minLength) {
            this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rule.minLength} characters long`;
            return false;
        }

        if (value && value.trim().length > rule.maxLength) {
            this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${rule.maxLength} characters`;
            return false;
        }

        if (value && !rule.pattern.test(value.trim())) {
            this.errors[fieldName] = rule.message;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate phone number
    validatePhoneNumber(value, fieldName = 'phoneNumber') {
        const rule = ValidationRules.phoneNumber;

        // Phone number is optional in most cases
        if (!value || !value.trim()) {
            delete this.errors[fieldName];
            return true;
        }

        if (value.length < rule.minLength) {
            this.errors[fieldName] = `Phone number must be at least ${rule.minLength} characters long`;
            return false;
        }

        if (value.length > rule.maxLength) {
            this.errors[fieldName] = `Phone number cannot exceed ${rule.maxLength} characters`;
            return false;
        }

        if (!rule.pattern.test(value)) {
            this.errors[fieldName] = rule.message;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate two-factor code
    validateTwoFactorCode(value, fieldName = 'twoFactorCode') {
        const rule = ValidationRules.twoFactorCode;

        if (rule.required && (!value || !value.trim())) {
            this.errors[fieldName] = 'Two-factor code is required';
            return false;
        }

        if (value && !rule.pattern.test(value)) {
            this.errors[fieldName] = rule.message;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate password confirmation
    validatePasswordConfirmation(password, confirmPassword, fieldName = 'confirmPassword') {
        if (!confirmPassword || !confirmPassword.trim()) {
            this.errors[fieldName] = 'Password confirmation is required';
            return false;
        }

        if (password !== confirmPassword) {
            this.errors[fieldName] = 'Passwords do not match';
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate UUID
    validateUUID(value, fieldName = 'id') {
        const rule = ValidationRules.uuid;

        if (!value) {
            this.errors[fieldName] = 'ID is required';
            return false;
        }

        if (!rule.pattern.test(value)) {
            this.errors[fieldName] = rule.message;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate required field
    validateRequired(value, fieldName, customMessage = null) {
        if (!value || (typeof value === 'string' && !value.trim())) {
            this.errors[fieldName] = customMessage || `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Validate string length
    validateLength(value, fieldName, minLength = 0, maxLength = Infinity) {
        if (value && value.length < minLength) {
            this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters long`;
            return false;
        }

        if (value && value.length > maxLength) {
            this.errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${maxLength} characters`;
            return false;
        }

        delete this.errors[fieldName];
        return true;
    }

    // Get all errors
    getErrors() {
        return this.errors;
    }

    // Check if there are any errors
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    // Clear all errors
    clearErrors() {
        this.errors = {};
    }

    // Clear specific error
    clearError(fieldName) {
        delete this.errors[fieldName];
    }

    // Get error for specific field
    getError(fieldName) {
        return this.errors[fieldName];
    }
}

// Utility functions for common validations
export const isValidEmail = (email) => {
    return ValidationRules.email.pattern.test(email);
};

export const isValidPassword = (password) => {
    return ValidationRules.password.pattern.test(password) &&
        password.length >= ValidationRules.password.minLength &&
        password.length <= ValidationRules.password.maxLength;
};

export const isValidPhoneNumber = (phone) => {
    return ValidationRules.phoneNumber.pattern.test(phone);
};

export const isValidTwoFactorCode = (code) => {
    return ValidationRules.twoFactorCode.pattern.test(code);
};

export const isValidUUID = (uuid) => {
    return ValidationRules.uuid.pattern.test(uuid);
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
    const validator = new Validator();
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
        const rules = validationRules[fieldName];
        const value = formData[fieldName];

        if (rules.required && !value) {
            validator.errors[fieldName] = rules.message || `${fieldName} is required`;
            isValid = false;
            return;
        }

        if (value && rules.type) {
            switch (rules.type) {
                case 'email':
                    if (!validator.validateEmail(value, fieldName)) isValid = false;
                    break;
                case 'password':
                    if (!validator.validatePassword(value, fieldName)) isValid = false;
                    break;
                case 'name':
                    if (!validator.validateName(value, fieldName)) isValid = false;
                    break;
                case 'phoneNumber':
                    if (!validator.validatePhoneNumber(value, fieldName)) isValid = false;
                    break;
                case 'twoFactorCode':
                    if (!validator.validateTwoFactorCode(value, fieldName)) isValid = false;
                    break;
                case 'uuid':
                    if (!validator.validateUUID(value, fieldName)) isValid = false;
                    break;
                default:
                    break;
            }
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            validator.errors[fieldName] = `${fieldName} must be at least ${rules.minLength} characters long`;
            isValid = false;
        }

        if (value && rules.maxLength && value.length > rules.maxLength) {
            validator.errors[fieldName] = `${fieldName} cannot exceed ${rules.maxLength} characters`;
            isValid = false;
        }

        if (value && rules.pattern && !rules.pattern.test(value)) {
            validator.errors[fieldName] = rules.message || `${fieldName} format is invalid`;
            isValid = false;
        }
    });

    return {
        isValid,
        errors: validator.getErrors()
    };
};