import React, { useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ProfileSettings from '../Profile/ProfileSettings';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [profileVisible, setProfileVisible] = useState(false);
    const { user, logout } = useAuth();
    const { showSuccess } = useToast();

    const handleLogout = async () => {
        await logout();
        showSuccess('Logged out successfully');
    };

    // User menu items
    const userMenuItems = [
        {
            label: 'Profile Settings',
            icon: 'pi pi-user',
            command: () => setProfileVisible(true)
        },
        {
            label: 'Account Settings',
            icon: 'pi pi-cog',
            command: () => {
                // Handle account settings
            }
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
            command: () => {
                // Navigate to dashboard
            }
        },
        {
            label: 'Certificates',
            icon: 'pi pi-file-pdf',
            items: [
                {
                    label: 'View All',
                    icon: 'pi pi-list',
                    command: () => {
                        // Navigate to certificates list
                    }
                },
                {
                    label: 'Statistics',
                    icon: 'pi pi-chart-bar',
                    command: () => {
                        // Navigate to statistics
                    }
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
        },
        {
            label: 'Productions',
            icon: 'pi pi-cog',
            items: [
                {
                    label: 'View Productions',
                    icon: 'pi pi-list',
                    command: () => {
                        // Navigate to productions
                    }
                },
                {
                    label: 'Create Production',
                    icon: 'pi pi-plus',
                    command: () => {
                        // Navigate to create production
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
            command: () => setSidebarVisible(false)
        },
        {
            label: 'Certificates',
            icon: 'pi pi-file-pdf',
            command: () => setSidebarVisible(false)
        },
        {
            label: 'Orders',
            icon: 'pi pi-shopping-cart',
            command: () => setSidebarVisible(false)
        },
        {
            label: 'Productions',
            icon: 'pi pi-cog',
            command: () => setSidebarVisible(false)
        },
        {
            label: 'Organizations',
            icon: 'pi pi-building',
            command: () => setSidebarVisible(false)
        },
        {
            label: 'Users',
            icon: 'pi pi-users',
            command: () => setSidebarVisible(false)
        }
    ];

    const start = (
        <div className="flex align-items-center">
            <Button
                icon="pi pi-bars"
                className="p-button-text p-button-rounded mr-2 lg:hidden"
                onClick={() => setSidebarVisible(true)}
            />
            <div className="flex align-items-center">
                <i className="pi pi-shield text-2xl text-primary mr-2"></i>
                <span className="text-xl font-bold text-900">eAttestation</span>
            </div>
        </div>
    );

    const end = (
        <div className="flex align-items-center gap-2">
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
                className="flex align-items-center cursor-pointer p-2 border-round hover:surface-100"
                onClick={(event) => window.userMenu?.toggle(event)}
            >
                <Avatar
                    image={user?.avatar}
                    icon="pi pi-user"
                    className="mr-2"
                    shape="circle"
                    size="normal"
                />
                <div className="flex flex-column align-items-start">
          <span className="font-medium text-900">
            {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'User'
            }
          </span>
                    <span className="text-sm text-600">
            {user?.role?.name || user?.role || 'Member'}
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

            {/* Profile Settings Dialog */}
            <ProfileSettings
                visible={profileVisible}
                onHide={() => setProfileVisible(false)}
            />
        </div>
    );
};

export default Layout;