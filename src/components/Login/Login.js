import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Messages } from 'primereact/messages';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
        twoFactorCode: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    const { login, forgotPassword } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (showTwoFactor && !formData.twoFactorCode) {
            newErrors.twoFactorCode = 'Two-factor code is required';
        } else if (showTwoFactor && !/^\d{6}$/.test(formData.twoFactorCode)) {
            newErrors.twoFactorCode = 'Two-factor code must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForgotPasswordEmail = () => {
        if (!forgotPasswordEmail) {
            showError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
            showError('Please enter a valid email address');
            return false;
        }
        return true;
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
            const result = await login(
                formData.email,
                formData.password,
                formData.rememberMe,
                showTwoFactor ? formData.twoFactorCode : null
            );

            if (result.success) {
                showSuccess(result.message || 'Login successful! Welcome to eAttestation Platform.');
                navigate('/dashboard');
            } else {
                // Check if two-factor authentication is required
                if (result.message?.includes('two-factor') || result.message?.includes('2FA')) {
                    setShowTwoFactor(true);
                    showError('Please enter your two-factor authentication code');
                } else {
                    showError(result.message || 'Invalid credentials');

                    // Display validation errors if any
                    if (result.errors && result.errors.length > 0) {
                        const errorMessages = result.errors.map(error => error.message || error).join(', ');
                        showError(errorMessages);
                    }
                }
            }
        } catch (error) {
            showError('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!validateForgotPasswordEmail()) {
            return;
        }

        setForgotPasswordLoading(true);

        try {
            const result = await forgotPassword(forgotPasswordEmail);

            if (result.success) {
                showSuccess(result.message || 'Password reset instructions sent to your email');
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
            } else {
                showError(result.message || 'Failed to send reset instructions');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const cardHeader = (
        <div className="login-header">
            <i className="pi pi-shield text-6xl text-primary mb-3"></i>
            <h2 className="text-3xl font-bold text-900 mb-2">eAttestation Platform</h2>
            <p className="text-600 mb-0">
                {showForgotPassword
                    ? 'Reset your password'
                    : 'Sign in to access your dashboard'
                }
            </p>
        </div>
    );

    if (showForgotPassword) {
        return (
            <div className="login-container">
                <div className="login-content">
                    <Card className="login-card" header={cardHeader}>
                        <form onSubmit={handleForgotPassword}>
                            <div className="field">
                                <label htmlFor="forgotEmail" className="block text-900 font-medium mb-2">
                                    Email Address
                                </label>
                                <InputText
                                    id="forgotEmail"
                                    type="email"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full"
                                    disabled={forgotPasswordLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                label={forgotPasswordLoading ? 'Sending...' : 'Send Reset Instructions'}
                                icon={forgotPasswordLoading ? undefined : 'pi pi-send'}
                                className="w-full mt-4"
                                disabled={forgotPasswordLoading}
                            />

                            {forgotPasswordLoading && (
                                <div className="flex justify-content-center mt-3">
                                    <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                                </div>
                            )}
                        </form>

                        <Divider />

                        <div className="text-center">
                            <Button
                                label="Back to Login"
                                className="p-button-text"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotPasswordEmail('');
                                }}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-content">
                <Card className="login-card" header={cardHeader}>
                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="email" className="block text-900 font-medium mb-2">
                                Email Address
                            </label>
                            <InputText
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                                disabled={loading}
                            />
                            {errors.email && (
                                <Message severity="error" text={errors.email} className="mt-1" />
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="password" className="block text-900 font-medium mb-2">
                                Password
                            </label>
                            <Password
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                                inputClassName="w-full"
                                feedback={false}
                                toggleMask
                                disabled={loading}
                            />
                            {errors.password && (
                                <Message severity="error" text={errors.password} className="mt-1" />
                            )}
                        </div>

                        {showTwoFactor && (
                            <div className="field">
                                <label htmlFor="twoFactorCode" className="block text-900 font-medium mb-2">
                                    Two-Factor Authentication Code
                                </label>
                                <InputText
                                    id="twoFactorCode"
                                    name="twoFactorCode"
                                    value={formData.twoFactorCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter 6-digit code"
                                    className={`w-full ${errors.twoFactorCode ? 'p-invalid' : ''}`}
                                    maxLength={6}
                                    disabled={loading}
                                />
                                {errors.twoFactorCode && (
                                    <Message severity="error" text={errors.twoFactorCode} className="mt-1" />
                                )}
                            </div>
                        )}

                        <div className="field">
                            <div className="flex align-items-center justify-content-between">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="rememberMe" className="ml-2">Remember me</label>
                                </div>
                                <Button
                                    label="Forgot Password?"
                                    className="p-button-text p-button-sm"
                                    onClick={() => setShowForgotPassword(true)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            label={loading ? 'Signing in...' : 'Sign In'}
                            icon={loading ? undefined : 'pi pi-sign-in'}
                            className="w-full mt-4"
                            disabled={loading}
                        />

                        {loading && (
                            <div className="flex justify-content-center mt-3">
                                <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                            </div>
                        )}
                    </form>

                    <div className="login-footer mt-4 pt-4 border-top-1 surface-border">
                        <p className="text-center text-600 text-sm">
                            <i className="pi pi-info-circle mr-1"></i>
                            Contact your administrator for access credentials
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;