import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console or error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Report error to monitoring service
        if (process.env.NODE_ENV === 'production') {
            // Here you would send error to monitoring service like Sentry
            this.reportError(error, errorInfo);
        }
    }

    reportError = (error, errorInfo) => {
        // Implement error reporting logic here
        // Example: Sentry.captureException(error, { extra: errorInfo });
        console.log('Error reported:', { error, errorInfo });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    handleGoToLogin = () => {
        window.location.href = '/login';
    };

    isAuthError = (error) => {
        return error?.message?.includes('token') || 
               error?.message?.includes('auth') ||
               error?.message?.includes('Unauthorized') ||
               error?.status === 401 ||
               error?.response?.status === 401;
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            const isDevelopment = process.env.NODE_ENV === 'development';
            const isAuthenticationError = this.isAuthError(this.state.error);

            return (
                <div className="error-boundary-container p-4">
                    <div className="flex justify-content-center align-items-center min-h-screen">
                        <Card className="text-center" style={{ maxWidth: '600px', width: '100%' }}>
                            <div className="mb-4">
                                <i className={`pi ${isAuthenticationError ? 'pi-lock' : 'pi-exclamation-triangle'} text-6xl ${isAuthenticationError ? 'text-orange-500' : 'text-red-500'} mb-3`}></i>
                                <h2 className="text-2xl font-bold text-900 mb-2">
                                    {isAuthenticationError ? 'Authentication Error' : 'Oops! Something went wrong'}
                                </h2>
                                <p className="text-600 mb-4">
                                    {isAuthenticationError 
                                        ? 'There was a problem with your authentication. Please try logging in again.'
                                        : 'We re sorry, but something unexpected happened. The error has been reported and were working to fix it.'
                                    }
                                </p>
                            </div>

                            <div className="flex gap-2 justify-content-center mb-4">
                                <Button
                                    label="Reload Page"
                                    icon="pi pi-refresh"
                                    onClick={this.handleReload}
                                    className="p-button-primary"
                                />
                                {isAuthenticationError ? (
                                    <Button
                                        label="Login"
                                        icon="pi pi-sign-in"
                                        onClick={this.handleGoToLogin}
                                        className="p-button-outlined"
                                    />
                                ) : (
                                    <Button
                                        label="Go to Dashboard"
                                        icon="pi pi-home"
                                        onClick={this.handleGoHome}
                                        className="p-button-outlined"
                                    />
                                )}
                            </div>

                            {isDevelopment && this.state.error && (
                                <div className="mt-4">
                                    <Message
                                        severity="error"
                                        text="Development Mode - Error Details Below"
                                        className="mb-3"
                                    />

                                    <div className="text-left p-3 bg-gray-100 border-round">
                                        <h4>Error Details:</h4>
                                        <pre className="text-sm overflow-auto max-h-20rem">
                      {this.state.error && this.state.error.toString()}
                                            <br />
                                            {this.state.errorInfo.componentStack}
                    </pre>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-top-1 surface-border">
                                <p className="text-xs text-500">
                                    If this problem persists, please contact support with the error details.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            );
        }

        // If there's no error, render children normally
        return this.props.children;
    }
}

export default ErrorBoundary;