import React, { useState, useEffect } from 'react';
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
import ErrorBoundary from './components/Common/ErrorBoundary';
import AuthDebugPanel from './components/Debug/AuthDebugPanel';

// PrimeReact styles (theme will be handled by ThemeProvider)
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

// Enhanced loading component for authentication checks
const AuthLoadingSpinner = ({ message = "Checking authentication...", showRetry = false, onRetry = null }) => (
    <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center max-w-md">
            <i className="pi pi-spinner pi-spin text-4xl text-primary mb-3"></i>
            <p className="text-600 mb-2">{message}</p>
            {showRetry && onRetry && (
                <button 
                    className="p-button p-button-text p-button-sm"
                    onClick={onRetry}
                >
                    <i className="pi pi-refresh mr-2"></i>
                    Retry
                </button>
            )}
        </div>
    </div>
);

// Error display component for auth failures
const AuthErrorDisplay = ({ error, onRetry, onLogin }) => (
    <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center max-w-md p-4">
            <i className="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
            <h3 className="text-xl font-semibold mb-2">Connection Issue</h3>
            <p className="text-600 mb-4">{error}</p>
            <div className="flex justify-content-center gap-2">
                {onRetry && (
                    <button 
                        className="p-button p-button-outlined p-button-sm"
                        onClick={onRetry}
                    >
                        <i className="pi pi-refresh mr-2"></i>
                        Retry
                    </button>
                )}
                {onLogin && (
                    <button 
                        className="p-button p-button-sm"
                        onClick={onLogin}
                    >
                        <i className="pi pi-sign-in mr-2"></i>
                        Login
                    </button>
                )}
            </div>
        </div>
    </div>
);

// Enhanced Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, authError } = useAuth();
    const [retryCount, setRetryCount] = useState(0);
    const [showRetry, setShowRetry] = useState(false);
    const maxRetries = 3;
    
    // Show retry option after initial load attempt fails
    useEffect(() => {
        if (!loading && !isAuthenticated && authError && retryCount < maxRetries) {
            const timer = setTimeout(() => {
                setShowRetry(true);
            }, 2000); // Show retry after 2 seconds
            
            return () => clearTimeout(timer);
        }
    }, [loading, isAuthenticated, authError, retryCount, maxRetries]);
    
    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setShowRetry(false);
        // Trigger a page refresh to restart the auth check
        window.location.reload();
    };
    
    const handleLogin = () => {
        window.location.href = '/login';
    };
    
    // Still loading
    if (loading) {
        const loadingMessage = authError 
            ? `${authError} - Please wait...` 
            : "Checking authentication...";
        return (
            <AuthLoadingSpinner 
                message={loadingMessage}
                showRetry={showRetry && !authError.includes('retrying')}
                onRetry={handleRetry}
            />
        );
    }
    
    // Authentication failed with error
    if (!isAuthenticated && authError) {
        const isNetworkError = authError.includes('Network') || 
                              authError.includes('API') || 
                              authError.includes('server');
        const isAuthError = authError.includes('Authentication') || 
                           authError.includes('Token') || 
                           authError.includes('login');
        
        return (
            <AuthErrorDisplay 
                error={authError}
                onRetry={isNetworkError && retryCount < maxRetries ? handleRetry : null}
                onLogin={isAuthError ? handleLogin : null}
            />
        );
    }
    
    // Not authenticated (no error - normal redirect)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Authenticated - show content
    return children;
};

// Enhanced Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, authError } = useAuth();
    
    if (loading) {
        const loadingMessage = authError 
            ? `${authError} - Please wait...` 
            : "Checking authentication...";
        return <AuthLoadingSpinner message={loadingMessage} />;
    }
    
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Debug key combination handler component
const DebugKeyHandler = () => {
    const [showDebugPanel, setShowDebugPanel] = useState(false);

    useEffect(() => {
        const handleKeyPress = (event) => {
            // Ctrl+Shift+D to open debug panel (Cmd+Shift+D on Mac)
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                setShowDebugPanel(true);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Only show in development or when debug mode is enabled
    const shouldShowDebug = process.env.NODE_ENV === 'development' || 
                            process.env.REACT_APP_DEBUG_MODE === 'true';

    return shouldShowDebug ? (
        <AuthDebugPanel 
            visible={showDebugPanel} 
            onHide={() => setShowDebugPanel(false)} 
        />
    ) : null;
};

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <ToastProvider>
                    <Router>
                        <div className="App">
                            <DebugKeyHandler />
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
        </ErrorBoundary>
    );
}

export default App;