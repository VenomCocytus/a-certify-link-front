import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { SelectButton } from 'primereact/selectbutton';
import { Slider } from 'primereact/slider';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './SettingsPage.css';

const SettingsPage = () => {
    const { theme, toggleTheme, setThemeMode } = useTheme();
    const { user, logout } = useAuth();
    const { showSuccess, showError, showInfo } = useToast();

    const [preferences, setPreferences] = useState({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        currency: 'XAF',
        itemsPerPage: 10,
        autoSave: true,
        soundNotifications: true,
        emailNotifications: true,
        desktopNotifications: false,
        marketingEmails: false
    });

    const [security, setSecurity] = useState({
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginAlerts: true,
        deviceManagement: true
    });

    const [loading, setLoading] = useState(false);

    const themeOptions = [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' }
    ];

    const languageOptions = [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' },
        { label: 'Español', value: 'es' }
    ];

    const timezoneOptions = [
        { label: 'UTC', value: 'UTC' },
        { label: 'WAT (West Africa)', value: 'Africa/Lagos' },
        { label: 'CET (Central Europe)', value: 'Europe/Paris' },
        { label: 'EST (Eastern US)', value: 'America/New_York' }
    ];

    const dateFormatOptions = [
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
    ];

    const currencyOptions = [
        { label: 'XAF (Central African CFA Franc)', value: 'XAF' },
        { label: 'EUR (Euro)', value: 'EUR' },
        { label: 'USD (US Dollar)', value: 'USD' },
        { label: 'GBP (British Pound)', value: 'GBP' }
    ];

    const itemsPerPageOptions = [
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 }
    ];

    useEffect(() => {
        // Load settings from localStorage or API
        loadSettings();
    }, []);

    useEffect(() => {
        // Update theme when preferences change
        setPreferences(prev => ({ ...prev, theme }));
    }, [theme]);

    const loadSettings = () => {
        // Load from localStorage
        const savedPreferences = localStorage.getItem('userPreferences');
        const savedSecurity = localStorage.getItem('userSecurity');

        if (savedPreferences) {
            setPreferences(JSON.parse(savedPreferences));
        }

        if (savedSecurity) {
            setSecurity(JSON.parse(savedSecurity));
        }

        // Set theme from context
        setPreferences(prev => ({ ...prev, theme }));
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            // Save to localStorage
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            localStorage.setItem('userSecurity', JSON.stringify(security));

            // Apply theme change
            if (preferences.theme !== theme) {
                setThemeMode(preferences.theme);
            }

            showSuccess('Settings saved successfully');
        } catch (error) {
            showError('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const resetSettings = () => {
        confirmDialog({
            message: 'Are you sure you want to reset all settings to default?',
            header: 'Reset Settings',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setPreferences({
                    theme: 'light',
                    language: 'en',
                    timezone: 'UTC',
                    dateFormat: 'DD/MM/YYYY',
                    currency: 'XAF',
                    itemsPerPage: 10,
                    autoSave: true,
                    soundNotifications: true,
                    emailNotifications: true,
                    desktopNotifications: false,
                    marketingEmails: false
                });

                setSecurity({
                    twoFactorEnabled: false,
                    sessionTimeout: 30,
                    loginAlerts: true,
                    deviceManagement: true
                });

                setThemeMode('light');
                showInfo('Settings reset to default');
            }
        });
    };

    const exportSettings = () => {
        const settingsData = {
            preferences,
            security,
            exportDate: new Date().toISOString(),
            user: user?.email
        };

        const dataStr = JSON.stringify(settingsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eattestation-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        showSuccess('Settings exported successfully');
    };

    const handleLogoutAllDevices = () => {
        confirmDialog({
            message: 'This will log you out from all devices. You will need to sign in again.',
            header: 'Logout All Devices',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                await logout(true); // logoutAll = true
                showSuccess('Logged out from all devices');
            }
        });
    };

    return (
        <div className="settings-page">
            <div className="settings-header mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">Settings</h1>
                <p className="text-600">Customize your application preferences and security settings</p>
            </div>

            <Card className="settings-card">
                <TabView>
                    <TabPanel header="General" leftIcon="pi pi-cog mr-2">
                        <div className="settings-section">
                            <h3 className="section-title">Appearance</h3>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-900 font-medium mb-2">Theme</label>
                                        <SelectButton
                                            value={preferences.theme}
                                            options={themeOptions}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-900 font-medium mb-2">Language</label>
                                        <Dropdown
                                            value={preferences.language}
                                            options={languageOptions}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, language: e.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <h3 className="section-title">Regional Settings</h3>

                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <div className="field">
                                        <label className="block text-900 font-medium mb-2">Timezone</label>
                                        <Dropdown
                                            value={preferences.timezone}
                                            options={timezoneOptions}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 md:col-4">
                                    <div className="field">
                                        <label className="block text-900 font-medium mb-2">Date Format</label>
                                        <Dropdown
                                            value={preferences.dateFormat}
                                            options={dateFormatOptions}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 md:col-4">
                                    <div className="field">
                                        <label className="block text-900 font-medium mb-2">Currency</label>
                                        <Dropdown
                                            value={preferences.currency}
                                            options={currencyOptions}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <h3 className="section-title">Interface</h3>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-900 font-medium mb-2">Items per Page</label>
                                        <Dropdown
                                            value={preferences.itemsPerPage}
                                            options={itemsPerPageOptions}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, itemsPerPage: e.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="field flex align-items-center">
                                        <div className="flex-1">
                                            <label className="block text-900 font-medium mb-1">Auto Save</label>
                                            <small className="text-600">Automatically save form data</small>
                                        </div>
                                        <InputSwitch
                                            checked={preferences.autoSave}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, autoSave: e.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Notifications" leftIcon="pi pi-bell mr-2">
                        <div className="settings-section">
                            <h3 className="section-title">Notification Preferences</h3>

                            <div className="notification-settings">
                                <div className="notification-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Sound Notifications</h5>
                                            <p className="mt-1 mb-0 text-600">Play sounds for notifications</p>
                                        </div>
                                        <InputSwitch
                                            checked={preferences.soundNotifications}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, soundNotifications: e.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="notification-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Email Notifications</h5>
                                            <p className="mt-1 mb-0 text-600">Receive important updates via email</p>
                                        </div>
                                        <InputSwitch
                                            checked={preferences.emailNotifications}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="notification-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Desktop Notifications</h5>
                                            <p className="mt-1 mb-0 text-600">Show browser notifications</p>
                                        </div>
                                        <InputSwitch
                                            checked={preferences.desktopNotifications}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, desktopNotifications: e.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="notification-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Marketing Emails</h5>
                                            <p className="mt-1 mb-0 text-600">Receive product updates and promotions</p>
                                        </div>
                                        <InputSwitch
                                            checked={preferences.marketingEmails}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, marketingEmails: e.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Security" leftIcon="pi pi-shield mr-2">
                        <div className="settings-section">
                            <h3 className="section-title">Security Settings</h3>

                            <div className="security-settings">
                                <div className="security-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Two-Factor Authentication</h5>
                                            <p className="mt-1 mb-0 text-600">Add an extra layer of security to your account</p>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <InputSwitch
                                                checked={security.twoFactorEnabled}
                                                onChange={(e) => setSecurity(prev => ({ ...prev, twoFactorEnabled: e.value }))}
                                            />
                                            {security.twoFactorEnabled && (
                                                <Button
                                                    label="Configure"
                                                    size="small"
                                                    className="p-button-outlined"
                                                    onClick={() => showInfo('2FA configuration would open here')}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="security-item">
                                    <div>
                                        <h5 className="text-900 mb-2">Session Timeout</h5>
                                        <p className="text-600 mb-3">Automatically log out after period of inactivity</p>
                                        <div className="flex align-items-center gap-3">
                                            <Slider
                                                value={security.sessionTimeout}
                                                onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.value }))}
                                                min={5}
                                                max={120}
                                                step={5}
                                                className="flex-1"
                                            />
                                            <span className="text-900 font-medium">{security.sessionTimeout} min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="security-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Login Alerts</h5>
                                            <p className="mt-1 mb-0 text-600">Get notified of new login attempts</p>
                                        </div>
                                        <InputSwitch
                                            checked={security.loginAlerts}
                                            onChange={(e) => setSecurity(prev => ({ ...prev, loginAlerts: e.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="security-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Device Management</h5>
                                            <p className="mt-1 mb-0 text-600">Manage and monitor your active sessions</p>
                                        </div>
                                        <Button
                                            label="Manage Devices"
                                            size="small"
                                            className="p-button-outlined"
                                            onClick={() => showInfo('Device management would open here')}
                                        />
                                    </div>
                                </div>

                                <Divider />

                                <div className="security-actions">
                                    <h4 className="text-900 mb-3">Security Actions</h4>
                                    <div className="flex gap-2">
                                        <Button
                                            label="Logout All Devices"
                                            icon="pi pi-sign-out"
                                            className="p-button-outlined p-button-danger"
                                            onClick={handleLogoutAllDevices}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Data & Privacy" leftIcon="pi pi-database mr-2">
                        <div className="settings-section">
                            <h3 className="section-title">Data Management</h3>

                            <div className="data-actions">
                                <div className="action-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Export Settings</h5>
                                            <p className="mt-1 mb-0 text-600">Download your settings as a JSON file</p>
                                        </div>
                                        <Button
                                            label="Export"
                                            icon="pi pi-download"
                                            className="p-button-outlined"
                                            onClick={exportSettings}
                                        />
                                    </div>
                                </div>

                                <div className="action-item">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0 text-900">Reset Settings</h5>
                                            <p className="mt-1 mb-0 text-600">Reset all settings to default values</p>
                                        </div>
                                        <Button
                                            label="Reset"
                                            icon="pi pi-refresh"
                                            className="p-button-outlined p-button-warning"
                                            onClick={resetSettings}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <h3 className="section-title">Privacy Information</h3>
                            <div className="privacy-info">
                                <p className="text-600 mb-3">
                                    We take your privacy seriously. Your data is encrypted and stored securely.
                                    We do not share your personal information with third parties without your consent.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        label="Privacy Policy"
                                        className="p-button-text"
                                        onClick={() => showInfo('Privacy policy would open here')}
                                    />
                                    <Button
                                        label="Terms of Service"
                                        className="p-button-text"
                                        onClick={() => showInfo('Terms of service would open here')}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>

                <Divider />

                <div className="settings-footer">
                    <div className="flex justify-content-between">
                        <Button
                            label="Reset to Defaults"
                            icon="pi pi-refresh"
                            className="p-button-outlined"
                            onClick={resetSettings}
                        />
                        <Button
                            label="Save Settings"
                            icon="pi pi-save"
                            onClick={saveSettings}
                            loading={loading}
                        />
                    </div>
                </div>
            </Card>

            <ConfirmDialog />
        </div>
    );
};

export default SettingsPage;