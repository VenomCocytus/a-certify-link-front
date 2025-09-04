import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Checkbox } from 'primereact/checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Validator } from '../../utils/validation';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const validateForm = () => {
        const validator = new Validator();

        // Validate email
        validator.validateEmail(formData.email, 'email');

        // Validate names
        validator.validateName(formData.firstName, 'firstName');
        validator.validateName(formData.lastName, 'lastName');

        // Validate phone number (optional)
        if (formData.phoneNumber) {
            validator.validatePhoneNumber(formData.phoneNumber, 'phoneNumber');
        }

        // Validate password
        validator.validatePassword(formData.password, 'password');

        // Validate password confirmation
        validator.validatePasswordConfirmation(formData.password, formData.confirmPassword, 'confirmPassword');

        // Validate terms agreement
        if (!formData.agreeToTerms) {
            validator.errors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        setErrors(validator.getErrors());
        return !validator.hasErrors();
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare payload without confirmPassword (frontend validation only)
            const registrationPayload = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password
            };

            // Only include phoneNumber if it's not empty
            if (formData.phoneNumber && formData.phoneNumber.trim()) {
                registrationPayload.phoneNumber = formData.phoneNumber.trim();
            }

            const result = await register(registrationPayload);

            if (result.success) {
                showSuccess(result.message || 'Registration successful! Welcome to eAttestation Platform.');
                navigate('/dashboard');
            } else {
                showError(result.message || 'Registration failed');

                // Display validation errors if any
                if (result.errors && result.errors.length > 0) {
                    const newErrors = {};
                    result.errors.forEach(error => {
                        if (error.field) {
                            newErrors[error.field] = error.message;
                        }
                    });
                    setErrors(prev => ({ ...prev, ...newErrors }));
                }
            }
        } catch (error) {
            showError('An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passwordHeader = <div className="font-bold mb-3">Pick a password</div>;
    const passwordFooter = (
        <>
            <Divider />
            <p className="mt-2">Suggestions:</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>At least one lowercase letter</li>
                <li>At least one uppercase letter</li>
                <li>At least one numeric character</li>
                <li>At least one special character</li>
                <li>Minimum 8 characters</li>
            </ul>
        </>
    );

    const cardHeader = (
        <div className="login-header">
            <i className="pi pi-user-plus text-6xl text-primary mb-3"></i>
            <h2 className="text-3xl font-bold text-900 mb-2">Create Account</h2>
            <p className="text-600 mb-0">Join the eAttestation Platform</p>
        </div>
    );

    return (
        <div className="login-container">
            <div className="login-content" style={{ maxWidth: '500px' }}>
                <Card className="login-card" header={cardHeader}>
                    <form onSubmit={handleSubmit}>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                                        First Name *
                                    </label>
                                    <InputText
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your first name"
                                        className={`w-full ${errors.firstName ? 'p-invalid' : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.firstName && (
                                        <Message severity="error" text={errors.firstName} className="mt-1" />
                                    )}
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="lastName" className="block text-900 font-medium mb-2">
                                        Last Name *
                                    </label>
                                    <InputText
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your last name"
                                        className={`w-full ${errors.lastName ? 'p-invalid' : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.lastName && (
                                        <Message severity="error" text={errors.lastName} className="mt-1" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="email" className="block text-900 font-medium mb-2">
                                Email Address *
                            </label>
                            <InputText
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email address"
                                className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                                disabled={loading}
                            />
                            {errors.email && (
                                <Message severity="error" text={errors.email} className="mt-1" />
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="phoneNumber" className="block text-900 font-medium mb-2">
                                Phone Number
                            </label>
                            <InputText
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number (optional)"
                                className={`w-full ${errors.phoneNumber ? 'p-invalid' : ''}`}
                                disabled={loading}
                            />
                            {errors.phoneNumber && (
                                <Message severity="error" text={errors.phoneNumber} className="mt-1" />
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="password" className="block text-900 font-medium mb-2">
                                Password *
                            </label>
                            <Password
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Create a password"
                                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                                inputClassName="w-full"
                                header={passwordHeader}
                                footer={passwordFooter}
                                toggleMask
                                disabled={loading}
                            />
                            {errors.password && (
                                <Message severity="error" text={errors.password} className="mt-1" />
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
                                Confirm Password *
                            </label>
                            <Password
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
                                inputClassName="w-full"
                                feedback={false}
                                toggleMask
                                disabled={loading}
                            />
                            {errors.confirmPassword && (
                                <Message severity="error" text={errors.confirmPassword} className="mt-1" />
                            )}
                        </div>

                        <div className="field">
                            <div className="flex align-items-start">
                                <Checkbox
                                    id="agreeToTerms"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    className={`mr-2 ${errors.agreeToTerms ? 'p-invalid' : ''}`}
                                    disabled={loading}
                                />
                                <label htmlFor="agreeToTerms" className="text-sm">
                                    I agree to the{' '}
                                    <a href="/terms" target="_blank" className="text-primary font-medium">
                                        Terms and Conditions
                                    </a>{' '}
                                    and{' '}
                                    <a href="/privacy" target="_blank" className="text-primary font-medium">
                                        Privacy Policy
                                    </a>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                            </div>
                            {errors.agreeToTerms && (
                                <Message severity="error" text={errors.agreeToTerms} className="mt-1" />
                            )}
                        </div>

                        <Button
                            type="submit"
                            label={loading ? 'Creating Account...' : 'Create Account'}
                            icon={loading ? undefined : 'pi pi-user-plus'}
                            className="w-full mt-4"
                            disabled={loading}
                        />

                        {loading && (
                            <div className="flex justify-content-center mt-3">
                                <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                            </div>
                        )}
                    </form>

                    <Divider />

                    <div className="text-center">
                        <p className="text-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Register;