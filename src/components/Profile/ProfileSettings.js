import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const ProfileSettings = ({ visible, onHide }) => {
    const { user, updateProfile, changePassword, setupTwoFactor, enableTwoFactor, disableTwoFactor } = useAuth();
    const { showSuccess, showError } = useToast();

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [twoFactorData, setTwoFactorData] = useState({
        qrCode: '',
        secret: '',
        code: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState({});
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const handleTwoFactorInputChange = (e) => {
        const { name, value } = e.target;
        setTwoFactorData(prev => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateProfileForm = () => {
        const newErrors = {};

        if (!profileData.firstName?.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (profileData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        if (!profileData.lastName?.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (profileData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        if (profileData.phoneNumber && profileData.phoneNumber.length < 10) {
            newErrors.phoneNumber = 'Phone number must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwordData.newPassword)) {
            newErrors.newPassword = 'Password must contain uppercase, lowercase, number and special character';
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Password confirmation is required';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!validateProfileForm()) return;

        setLoading(prev => ({ ...prev, profile: true }));

        try {
            const result = await updateProfile(profileData);
            if (result.success) {
                showSuccess(result.message);
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('Failed to update profile');
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) return;

        setLoading(prev => ({ ...prev, password: true }));

        try {
            const result = await changePassword(passwordData);
            if (result.success) {
                showSuccess(result.message);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('Failed to change password');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    const handleSetupTwoFactor = async () => {
        setLoading(prev => ({ ...prev, twoFactorSetup: true }));

        try {
            const result = await setupTwoFactor();
            if (result.success) {
                setTwoFactorData(prev => ({
                    ...prev,
                    qrCode: result.qrCode,
                    secret: result.secret
                }));
                setShowTwoFactorSetup(true);
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('Failed to setup two-factor authentication');
        } finally {
            setLoading(prev => ({ ...prev, twoFactorSetup: false }));
        }
    };

    const handleEnableTwoFactor = async () => {
        if (!twoFactorData.code || !/^\d{6}$/.test(twoFactorData.code)) {
            setErrors({ code: 'Please enter a valid 6-digit code' });
            return;
        }

        setLoading(prev => ({ ...prev, twoFactorEnable: true }));

        try {
            const result = await enableTwoFactor(twoFactorData.code);
            if (result.success) {
                showSuccess(result.message);
                setShowTwoFactorSetup(false);
                setTwoFactorData({ qrCode: '', secret: '', code: '', password: '' });
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('Failed to enable two-factor authentication');
        } finally {
            setLoading(prev => ({ ...prev, twoFactorEnable: false }));
        }
    };

    const handleDisableTwoFactor = async () => {
        if (!twoFactorData.password || !twoFactorData.code) {
            setErrors({
                password: !twoFactorData.password ? 'Password is required' : '',
                code: !twoFactorData.code ? 'Two-factor code is required' : ''
            });
            return;
        }

        setLoading(prev => ({ ...prev, twoFactorDisable: true }));

        try {
            const result = await disableTwoFactor(twoFactorData.password, twoFactorData.code);
            if (result.success) {
                showSuccess(result.message);
                setTwoFactorData({ qrCode: '', secret: '', code: '', password: '' });
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('Failed to disable two-factor authentication');
        } finally {
            setLoading(prev => ({ ...prev, twoFactorDisable: false }));
        }
    };

    const dialogHeader = (
        <div className="flex align-items-center">
            <i className="pi pi-user text-2xl mr-3 text-primary"></i>
            <div>
                <h3 className="m-0">Profile Settings</h3>
                <small className="text-600">{user?.email}</small>
            </div>
        </div>
    );

    return (
        <>
            <Dialog
                header={dialogHeader}
                visible={visible}
                onHide={onHide}
                style={{ width: '90vw', maxWidth: '800px' }}
                modal
                className="profile-settings-dialog"
            >
                <TabView>
                    <TabPanel header="Profile Information" leftIcon="pi pi-user mr-2">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                                            First Name *
                                        </label>
                                        <InputText
                                            id="firstName"
                                            name="firstName"
                                            value={profileData.firstName}
                                            onChange={handleProfileInputChange}
                                            className={`w-full ${errors.firstName ? 'p-invalid' : ''}`}
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
                                            value={profileData.lastName}
                                            onChange={handleProfileInputChange}
                                            className={`w-full ${errors.lastName ? 'p-invalid' : ''}`}
                                        />
                                        {errors.lastName && (
                                            <Message severity="error" text={errors.lastName} className="mt-1" />
                                        )}
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="email" className="block text-900 font-medium mb-2">
                                            Email Address
                                        </label>
                                        <InputText
                                            id="email"
                                            value={user?.email || ''}
                                            className="w-full"
                                            disabled
                                        />
                                        <small className="text-500">Email cannot be changed</small>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="phoneNumber" className="block text-900 font-medium mb-2">
                                            Phone Number
                                        </label>
                                        <InputText
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={profileData.phoneNumber}
                                            onChange={handleProfileInputChange}
                                            className={`w-full ${errors.phoneNumber ? 'p-invalid' : ''}`}
                                        />
                                        {errors.phoneNumber && (
                                            <Message severity="error" text={errors.phoneNumber} className="mt-1" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-content-end mt-4">
                                <Button
                                    type="submit"
                                    label="Update Profile"
                                    icon="pi pi-save"
                                    loading={loading.profile}
                                />
                            </div>
                        </form>
                    </TabPanel>

                    <TabPanel header="Change Password" leftIcon="pi pi-lock mr-2">
                        <form onSubmit={handleChangePassword}>
                            <div className="field">
                                <label htmlFor="currentPassword" className="block text-900 font-medium mb-2">
                                    Current Password *
                                </label>
                                <Password
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    className={`w-full ${errors.currentPassword ? 'p-invalid' : ''}`}
                                    inputClassName="w-full"
                                    feedback={false}
                                    toggleMask
                                />
                                {errors.currentPassword && (
                                    <Message severity="error" text={errors.currentPassword} className="mt-1" />
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="newPassword" className="block text-900 font-medium mb-2">
                                    New Password *
                                </label>
                                <Password
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordInputChange}
                                    className={`w-full ${errors.newPassword ? 'p-invalid' : ''}`}
                                    inputClassName="w-full"
                                    toggleMask
                                />
                                {errors.newPassword && (
                                    <Message severity="error" text={errors.newPassword} className="mt-1" />
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
                                    Confirm New Password *
                                </label>
                                <Password
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordInputChange}
                                    className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
                                    inputClassName="w-full"
                                    feedback={false}
                                    toggleMask
                                />
                                {errors.confirmPassword && (
                                    <Message severity="error" text={errors.confirmPassword} className="mt-1" />
                                )}
                            </div>

                            <div className="flex justify-content-end mt-4">
                                <Button
                                    type="submit"
                                    label="Change Password"
                                    icon="pi pi-lock"
                                    loading={loading.password}
                                />
                            </div>
                        </form>
                    </TabPanel>

                    <TabPanel header="Two-Factor Authentication" leftIcon="pi pi-shield mr-2">
                        <div className="field">
                            <h4>Two-Factor Authentication</h4>
                            <p className="text-600 mb-4">
                                Add an extra layer of security to your account by enabling two-factor authentication.
                            </p>

                            {!user?.twoFactorEnabled ? (
                                <div className="p-3 surface-100 border-round">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Enable Two-Factor Authentication</h5>
                                            <p className="mt-1 mb-0 text-600">
                                                Secure your account with an authenticator app
                                            </p>
                                        </div>
                                        <Button
                                            label="Setup"
                                            icon="pi pi-cog"
                                            onClick={handleSetupTwoFactor}
                                            loading={loading.twoFactorSetup}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 surface-100 border-round">
                                    <div className="flex align-items-center justify-content-between mb-3">
                                        <div>
                                            <h5 className="m-0 text-900">Two-Factor Authentication Enabled</h5>
                                            <p className="mt-1 mb-0 text-600">
                                                Your account is protected with two-factor authentication
                                            </p>
                                        </div>
                                        <Button
                                            label="Disable"
                                            icon="pi pi-times"
                                            className="p-button-danger"
                                            onClick={() => setTwoFactorData(prev => ({ ...prev, showDisable: true }))}
                                        />
                                    </div>

                                    {twoFactorData.showDisable && (
                                        <div className="grid">
                                            <div className="col-12 md:col-6">
                                                <div className="field">
                                                    <label className="block text-900 font-medium mb-2">
                                                        Current Password *
                                                    </label>
                                                    <Password
                                                        name="password"
                                                        value={twoFactorData.password}
                                                        onChange={handleTwoFactorInputChange}
                                                        className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                                                        inputClassName="w-full"
                                                        feedback={false}
                                                        toggleMask
                                                    />
                                                    {errors.password && (
                                                        <Message severity="error" text={errors.password} className="mt-1" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12 md:col-6">
                                                <div className="field">
                                                    <label className="block text-900 font-medium mb-2">
                                                        Two-Factor Code *
                                                    </label>
                                                    <InputText
                                                        name="code"
                                                        value={twoFactorData.code}
                                                        onChange={handleTwoFactorInputChange}
                                                        className={`w-full ${errors.code ? 'p-invalid' : ''}`}
                                                        placeholder="Enter 6-digit code"
                                                        maxLength={6}
                                                    />
                                                    {errors.code && (
                                                        <Message severity="error" text={errors.code} className="mt-1" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="flex gap-2">
                                                    <Button
                                                        label="Disable 2FA"
                                                        icon="pi pi-times"
                                                        className="p-button-danger"
                                                        onClick={handleDisableTwoFactor}
                                                        loading={loading.twoFactorDisable}
                                                    />
                                                    <Button
                                                        label="Cancel"
                                                        className="p-button-text"
                                                        onClick={() => setTwoFactorData(prev => ({
                                                            ...prev,
                                                            showDisable: false,
                                                            password: '',
                                                            code: ''
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabPanel>
                </TabView>
            </Dialog>

            {/* Two-Factor Setup Dialog */}
            <Dialog
                header="Setup Two-Factor Authentication"
                visible={showTwoFactorSetup}
                onHide={() => setShowTwoFactorSetup(false)}
                style={{ width: '90vw', maxWidth: '500px' }}
                modal
            >
                <div className="text-center">
                    <h4>Scan QR Code</h4>
                    <p className="text-600 mb-4">
                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>

                    {twoFactorData.qrCode && (
                        <div className="mb-4">
                            <Image
                                src={twoFactorData.qrCode}
                                alt="QR Code"
                                width="200"
                                height="200"
                                className="border-round"
                            />
                        </div>
                    )}

                    {twoFactorData.secret && (
                        <div className="mb-4">
                            <p className="text-sm text-600">Or enter this secret manually:</p>
                            <div className="p-2 surface-100 border-round font-mono text-sm">
                                {twoFactorData.secret}
                            </div>
                        </div>
                    )}

                    <Divider />

                    <div className="field">
                        <label className="block text-900 font-medium mb-2">
                            Enter the 6-digit code from your authenticator app:
                        </label>
                        <InputText
                            name="code"
                            value={twoFactorData.code}
                            onChange={handleTwoFactorInputChange}
                            className={`w-full ${errors.code ? 'p-invalid' : ''}`}
                            placeholder="000000"
                            maxLength={6}
                        />
                        {errors.code && (
                            <Message severity="error" text={errors.code} className="mt-1" />
                        )}
                    </div>

                    <div className="flex gap-2 justify-content-center mt-4">
                        <Button
                            label="Enable 2FA"
                            icon="pi pi-check"
                            onClick={handleEnableTwoFactor}
                            loading={loading.twoFactorEnable}
                        />
                        <Button
                            label="Cancel"
                            className="p-button-text"
                            onClick={() => setShowTwoFactorSetup(false)}
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default ProfileSettings;