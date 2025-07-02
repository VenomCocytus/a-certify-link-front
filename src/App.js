import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import CreateEdition from './components/CreateEdition/CreateEdition';
import ProfilePage from './components/Profile/ProfilePage';
import SettingsPage from './components/Settings/SettingsPage';
import Layout from './components/Layout/Layout';

// PrimeReact styles (theme will be handled by ThemeProvider)
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <Router>
                        <div className="App">
                            <Routes>
                                <Route
                                    path="/login"
                                    element={
                                        <PublicRoute>
                                            <Login />
                                        </PublicRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Layout>
                                                <Dashboard />
                                            </Layout>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/create-edition"
                                    element={
                                        <ProtectedRoute>
                                            <Layout>
                                                <CreateEdition />
                                            </Layout>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <Layout>
                                                <ProfilePage />
                                            </Layout>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings"
                                    element={
                                        <ProtectedRoute>
                                            <Layout>
                                                <SettingsPage />
                                            </Layout>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </div>
                    </Router>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;