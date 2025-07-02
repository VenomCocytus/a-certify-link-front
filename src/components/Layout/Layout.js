import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { user, logout } = useAuth();
    const { showSuccess } = useToast();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        showSuccess('Logged out successfully');
        navigate('/login');
    };

    // User menu items
    const userMenuItems = [
        {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => navigate('/profile')
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => navigate('/settings')
        },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: handleLogout
        }
    ];

    // Main navigation items
    const navigationItems = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => navigate('/dashboard')
        },
        {
            label: 'Create Edition',
            icon: 'pi pi-plus',
            command: () => navigate('/create-edition')
        },
        {
            label: 'Certificates',
            icon: 'pi pi-file-pdf',
            items: [
                {
                    label: 'View All',
                    icon: 'pi pi-list',
                    command: () => navigate('/dashboard')
                },
                {
                    label: 'Statistics',
                    icon: 'pi pi-chart-bar',
                    command: () => navigate('/dashboard')
                }
            ]
        },
        {
            label: 'Orders',
            icon: 'pi pi-shopping-cart',
            items: [
                {
                    label: 'View Orders',
                    icon: 'pi pi-list',
                    command: () => {
                        // Navigate to orders
                    }
                },
                {
                    label: 'Create Order',
                    icon: 'pi pi-plus',
                    command: () => {
                        // Navigate to create order
                    }
                }
            ]
        }
    ];

    // Sidebar navigation items
    const sidebarItems = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => {
                navigate('/dashboard');
                setSidebarVisible(false);
            }
        },
        {
            label: 'Create Edition',
            icon: 'pi pi-plus',
            command: () => {
                navigate('/create-edition');
                setSidebarVisible(false);
            }
        },
        {
            label: 'Certificates',
            icon: 'pi pi-file-pdf',
            command: () => {
                navigate('/dashboard');
                setSidebarVisible(false);
            }
        },
        {
            label: 'Orders',
            icon: 'pi pi-shopping-cart',
            command: () => setSidebarVisible(false)
        },
        {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => {
                navigate('/profile');
                setSidebarVisible(false);
            }
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => {
                navigate('/settings');
                setSidebarVisible(false);
            }
        }
    ];

    const start = (
        <div className="flex align-items-center">
            <Button
                icon="pi pi-bars"
                className="p-button-text p-button-rounded mr-2 lg:hidden"
                onClick={() => setSidebarVisible(true)}
            />
            <div className="flex align-items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                <i className="pi pi-shield text-2xl text-primary mr-2"></i>
                <span className="text-xl font-bold text-900">eAttestation</span>
            </div>
        </div>
    );

    const end = (
        <div className="flex align-items-center gap-2">
            <Button
                icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
                className="p-button-text p-button-rounded"
                onClick={toggleTheme}
                tooltip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            />
            <Button
                icon="pi pi-bell"
                className="p-button-text p-button-rounded"
                badge="3"
                badgeClassName="p-badge-danger"
            />
            <Menu
                model={userMenuItems}
                popup
                ref={(menu) => {
                    if (menu) {
                        window.userMenu = menu;
                    }
                }}
                id="user-menu"
            />
            <div
                className="flex align-items-center cursor-pointer user-menu-trigger"
                onClick={(event) => window.userMenu?.toggle(event)}
            >
                <Avatar
                    image={user?.avatar}
                    icon="pi pi-user"
                    className="mr-2"
                    shape="circle"
                />
                <div className="flex flex-column align-items-start user-info">
          <span className="font-medium text-900">
            {user?.firstName && user?.lastName
                ? `${user.fullName}`
                : user?.email || 'User'}
          </span>
                    <span className="text-sm text-600">
            {user?.role?.name || 'Member'}
          </span>
                </div>
                <i className="pi pi-chevron-down ml-2 text-600"></i>
            </div>
        </div>
    );

    return (
        <div className="layout-wrapper">
            {/* Top Navigation Bar */}
            <Menubar
                model={navigationItems}
                start={start}
                end={end}
                className="layout-topbar"
            />

            {/* Mobile Sidebar */}
            <Sidebar
                visible={sidebarVisible}
                onHide={() => setSidebarVisible(false)}
                className="layout-sidebar"
            >
                <div className="sidebar-header">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-shield text-3xl text-primary mr-2"></i>
                        <span className="text-xl font-bold text-900">eAttestation</span>
                    </div>
                </div>
                <div className="sidebar-content">
                    <Menu model={sidebarItems} className="w-full border-none" />
                </div>
            </Sidebar>

            {/* Main Content Area */}
            <div className="layout-main">
                <div className="layout-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;