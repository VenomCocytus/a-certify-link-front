import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            const result = await login(formData.email, formData.password);

            if (result.success) {
                showSuccess('Login successful! Welcome to eAttestation Platform.');
                navigate('/dashboard');
            } else {
                showError(result.message || 'Invalid credentials');
            }
        } catch (error) {
            showError('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const cardHeader = (
        <div className="login-header">
            <i className="pi pi-shield text-6xl text-primary mb-3"></i>
            <h2 className="text-3xl font-bold text-900 mb-2">eAttestation Platform</h2>
            <p className="text-600 mb-0">Sign in to access your dashboard</p>
        </div>
    );

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