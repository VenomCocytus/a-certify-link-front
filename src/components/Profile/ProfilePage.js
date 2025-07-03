import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { TabView, TabPanel } from 'primereact/tabview';
import { FileUpload } from 'primereact/fileupload';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const { showSuccess, showError } = useToast();

    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    // Mock user data if user is not available
    const displayUser = user || {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@eattestation.com',
        phoneNumber: '+237 6XX XXX XXX',
        role: { name: 'Administrator' },
        createdAt: '2024-01-01T00:00:00.000Z',
        avatar: null
    };

    useEffect(() => {
        setProfileForm({
            firstName: displayUser.firstName || '',
            lastName: displayUser.lastName || '',
            email: displayUser.email || '',
            phoneNumber: displayUser.phoneNumber || ''
        });
    }, [displayUser]);

    const validateProfileForm = () => {
        const errors = {};

        if (!profileForm.firstName.trim()) {
            errors.firstName = 'First name is required';
        } else if (profileForm.firstName.length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }

        if (!profileForm.lastName.trim()) {
            errors.lastName = 'Last name is required';
        } else if (profileForm.lastName.length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }

        if (!profileForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
            errors.email = 'Email is invalid';
        }

        if (profileForm.phoneNumber && profileForm.phoneNumber.length < 10) {
            errors.phoneNumber = 'Phone number must be at least 10 characters';
        }

        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwordForm.newPassword)) {
            errors.newPassword = 'Password must contain uppercase, lowercase, number and special character';
        }

        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Password confirmation is required';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (!validateProfileForm()) {
            return;
        }

        setProfileLoading(true);

        try {
            const result = await updateProfile(profileForm);

            if (result.success) {
                showSuccess('Profile updated successfully');
            } else {
                showError(result.message || 'Failed to update profile');
            }
        } catch (error) {
            showError('An error occurred while updating profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            return;
        }

        setPasswordLoading(true);

        try {
            const result = await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            });

            if (result.success) {
                showSuccess('Password changed successfully');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                showError(result.message || 'Failed to change password');
            }
        } catch (error) {
            showError('An error occurred while changing password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleInputChange = (form, setForm, field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear errors when a user starts typing
        if (form === 'profile' && profileErrors[field]) {
            setProfileErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        } else if (form === 'password' && passwordErrors[field]) {
            setPasswordErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const onAvatarUpload = (event) => {
        // Handle avatar upload
        showSuccess('Avatar uploaded successfully');
    };

    const formatJoinDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="profile-page">
            <div className="profile-header mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">Profile Settings</h1>
                <p className="text-600">Manage your account settings and preferences</p>
            </div>

            <div className="grid">
                <div className="col-12 lg:col-4">
                    <Card className="profile-sidebar">
                        <div className="profile-avatar-section text-center">
                            <Avatar
                                image={displayUser?.avatar}
                                icon="pi pi-user"
                                size="xlarge"
                                shape="circle"
                                className="mb-3 user-avatar"
                                style={{
                                    backgroundColor: displayUser?.avatar ? 'transparent' : '#007ad9',
                                    color: 'white'
                                }}
                            />

                            <h3 className="text-xl font-semibold text-900 mb-1">
                                {displayUser?.firstName && displayUser?.lastName
                                    ? `${displayUser.firstName} ${displayUser.lastName}`
                                    : displayUser?.email || 'User'}
                            </h3>

                            <p className="text-600 mb-3">{displayUser?.role?.name || 'Member'}</p>

                            <FileUpload
                                mode="basic"
                                name="avatar"
                                accept="image/*"
                                maxFileSize={1000000}
                                onUpload={onAvatarUpload}
                                customUpload
                                auto
                                chooseLabel="Change Avatar"
                                className="p-button-outlined p-button-sm"
                            />
                        </div>

                        <Divider />

                        <div className="profile-info">
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{displayUser?.email || 'N/A'}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{displayUser?.phoneNumber || 'N/A'}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Role:</span>
                                <span className="info-value">{displayUser?.role?.name || 'N/A'}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Member Since:</span>
                                <span className="info-value">{formatJoinDate(displayUser?.createdAt)}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Status:</span>
                                <span className="info-value">
                                    <span className="status-badge active">Active</span>
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 lg:col-8">
                    <Card className="profile-content">
                        <TabView>
                            <TabPanel header="Personal Information" leftIcon="pi pi-user mr-2">
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="grid">
                                        <div className="col-12 md:col-6">
                                            <div className="field">
                                                <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                                                    First Name *
                                                </label>
                                                <InputText
                                                    id="firstName"
                                                    value={profileForm.firstName}
                                                    onChange={(e) => handleInputChange('profile', setProfileForm, 'firstName', e.target.value)}
                                                    className={`w-full ${profileErrors.firstName ? 'p-invalid' : ''}`}
                                                    disabled={profileLoading}
                                                />
                                                {profileErrors.firstName && (
                                                    <Message severity="error" text={profileErrors.firstName} className="mt-1" />
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
                                                    value={profileForm.lastName}
                                                    onChange={(e) => handleInputChange('profile', setProfileForm, 'lastName', e.target.value)}
                                                    className={`w-full ${profileErrors.lastName ? 'p-invalid' : ''}`}
                                                    disabled={profileLoading}
                                                />
                                                {profileErrors.lastName && (
                                                    <Message severity="error" text={profileErrors.lastName} className="mt-1" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 md:col-6">
                                            <div className="field">
                                                <label htmlFor="email" className="block text-900 font-medium mb-2">
                                                    Email Address *
                                                </label>
                                                <InputText
                                                    id="email"
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => handleInputChange('profile', setProfileForm, 'email', e.target.value)}
                                                    className={`w-full ${profileErrors.email ? 'p-invalid' : ''}`}
                                                    disabled={profileLoading}
                                                />
                                                {profileErrors.email && (
                                                    <Message severity="error" text={profileErrors.email} className="mt-1" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 md:col-6">
                                            <div className="field">
                                                <label htmlFor="phoneNumber" className="block text-900 font-medium mb-2">
                                                    Phone Number
                                                </label>
                                                <InputText
                                                    id="phoneNumber"
                                                    value={profileForm.phoneNumber}
                                                    onChange={(e) => handleInputChange('profile', setProfileForm, 'phoneNumber', e.target.value)}
                                                    className={`w-full ${profileErrors.phoneNumber ? 'p-invalid' : ''}`}
                                                    disabled={profileLoading}
                                                />
                                                {profileErrors.phoneNumber && (
                                                    <Message severity="error" text={profileErrors.phoneNumber} className="mt-1" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-content-end mt-4">
                                        <Button
                                            type="submit"
                                            label="Update Profile"
                                            icon="pi pi-save"
                                            loading={profileLoading}
                                        />
                                    </div>
                                </form>
                            </TabPanel>

                            <TabPanel header="Change Password" leftIcon="pi pi-lock mr-2">
                                <form onSubmit={handlePasswordChange}>
                                    <div className="grid">
                                        <div className="col-12">
                                            <div className="field">
                                                <label htmlFor="currentPassword" className="block text-900 font-medium mb-2">
                                                    Current Password *
                                                </label>
                                                <Password
                                                    id="currentPassword"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => handleInputChange('password', setPasswordForm, 'currentPassword', e.target.value)}
                                                    className={`w-full ${passwordErrors.currentPassword ? 'p-invalid' : ''}`}
                                                    inputClassName="w-full"
                                                    feedback={false}
                                                    toggleMask
                                                    disabled={passwordLoading}
                                                />
                                                {passwordErrors.currentPassword && (
                                                    <Message severity="error" text={passwordErrors.currentPassword} className="mt-1" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 md:col-6">
                                            <div className="field">
                                                <label htmlFor="newPassword" className="block text-900 font-medium mb-2">
                                                    New Password *
                                                </label>
                                                <Password
                                                    id="newPassword"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => handleInputChange('password', setPasswordForm, 'newPassword', e.target.value)}
                                                    className={`w-full ${passwordErrors.newPassword ? 'p-invalid' : ''}`}
                                                    inputClassName="w-full"
                                                    toggleMask
                                                    disabled={passwordLoading}
                                                    promptLabel="Enter a password"
                                                    weakLabel="Weak"
                                                    mediumLabel="Medium"
                                                    strongLabel="Strong"
                                                />
                                                {passwordErrors.newPassword && (
                                                    <Message severity="error" text={passwordErrors.newPassword} className="mt-1" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 md:col-6">
                                            <div className="field">
                                                <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
                                                    Confirm New Password *
                                                </label>
                                                <Password
                                                    id="confirmPassword"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => handleInputChange('password', setPasswordForm, 'confirmPassword', e.target.value)}
                                                    className={`w-full ${passwordErrors.confirmPassword ? 'p-invalid' : ''}`}
                                                    inputClassName="w-full"
                                                    feedback={false}
                                                    toggleMask
                                                    disabled={passwordLoading}
                                                />
                                                {passwordErrors.confirmPassword && (
                                                    <Message severity="error" text={passwordErrors.confirmPassword} className="mt-1" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="password-requirements mt-3 mb-4">
                                        <h5 className="text-900 mb-2">Password Requirements:</h5>
                                        <ul className="text-600">
                                            <li>At least 8 characters long</li>
                                            <li>Contains uppercase and lowercase letters</li>
                                            <li>Contains at least one number</li>
                                            <li>Contains at least one special character (@$!%*?&)</li>
                                        </ul>
                                    </div>

                                    <div className="flex justify-content-end">
                                        <Button
                                            type="submit"
                                            label="Change Password"
                                            icon="pi pi-key"
                                            loading={passwordLoading}
                                        />
                                    </div>
                                </form>
                            </TabPanel>
                        </TabView>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;