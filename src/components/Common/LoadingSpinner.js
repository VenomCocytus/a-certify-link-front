import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';

// Basic loading spinner
export const LoadingSpinner = ({
                                   size = 'normal',
                                   message = '',
                                   overlay = false,
                                   className = ''
                               }) => {
    const sizeMap = {
        small: { width: '20px', height: '20px' },
        normal: { width: '50px', height: '50px' },
        large: { width: '80px', height: '80px' }
    };

    const spinnerStyle = sizeMap[size] || sizeMap.normal;

    const content = (
        <div className={`loading-spinner ${className}`}>
            <div className="flex flex-column align-items-center justify-content-center">
                <ProgressSpinner
                    style={spinnerStyle}
                    strokeWidth="4"
                    animationDuration="1s"
                />
                {message && (
                    <p className="mt-3 text-600 text-center">{message}</p>
                )}
            </div>
        </div>
    );

    if (overlay) {
        return (
            <div className="loading-overlay">
                {content}
            </div>
        );
    }

    return content;
};

// Full page loading component
export const PageLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="page-loader">
            <div className="flex justify-content-center align-items-center min-h-screen">
                <div className="text-center">
                    <div className="mb-4">
                        <i className="pi pi-shield text-6xl text-primary mb-3"></i>
                        <h3 className="text-xl font-semibold text-900 mb-2">eAttestation Platform</h3>
                    </div>
                    <LoadingSpinner size="large" message={message} />
                </div>
            </div>
        </div>
    );
};

// Skeleton loader for cards
export const CardSkeleton = ({
                                 rows = 3,
                                 showHeader = true,
                                 showActions = false,
                                 className = ''
                             }) => {
    return (
        <div className={`card-skeleton p-4 ${className}`}>
            {showHeader && (
                <div className="mb-3">
                    <Skeleton width="60%" height="1.5rem" className="mb-2" />
                    <Skeleton width="40%" height="1rem" />
                </div>
            )}

            <div className="skeleton-content">
                {Array.from({ length: rows }, (_, index) => (
                    <Skeleton
                        key={index}
                        width={`${Math.random() * 40 + 60}%`}
                        height="1rem"
                        className="mb-2"
                    />
                ))}
            </div>

            {showActions && (
                <div className="flex gap-2 mt-3">
                    <Skeleton width="80px" height="2rem" />
                    <Skeleton width="80px" height="2rem" />
                </div>
            )}
        </div>
    );
};

// Table skeleton loader
export const TableSkeleton = ({
                                  rows = 5,
                                  columns = 4,
                                  showHeader = true,
                                  className = ''
                              }) => {
    return (
        <div className={`table-skeleton ${className}`}>
            {showHeader && (
                <div className="flex gap-3 p-3 border-bottom-1 surface-border mb-2">
                    {Array.from({ length: columns }, (_, index) => (
                        <Skeleton
                            key={`header-${index}`}
                            width="100px"
                            height="1rem"
                            className="flex-1"
                        />
                    ))}
                </div>
            )}

            {Array.from({ length: rows }, (_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-3 p-3 border-bottom-1 surface-border">
                    {Array.from({ length: columns }, (_, colIndex) => (
                        <Skeleton
                            key={`cell-${rowIndex}-${colIndex}`}
                            width="100%"
                            height="1rem"
                            className="flex-1"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

// Statistics card skeleton
export const StatsSkeleton = ({ count = 4, className = '' }) => {
    return (
        <div className={`grid ${className}`}>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="col-12 md:col-6 lg:col-3">
                    <div className="stats-skeleton p-4 border-round surface-card">
                        <div className="flex align-items-start justify-content-between">
                            <div className="flex-1">
                                <Skeleton width="80%" height="0.8rem" className="mb-2" />
                                <Skeleton width="60%" height="2rem" className="mb-2" />
                                <Skeleton width="70%" height="0.8rem" />
                            </div>
                            <Skeleton shape="circle" size="3rem" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Chart skeleton loader
export const ChartSkeleton = ({ type = 'bar', className = '' }) => {
    const renderBarChart = () => (
        <div className="flex align-items-end justify-content-around h-full">
            {Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                    key={index}
                    width="40px"
                    height={`${Math.random() * 60 + 40}%`}
                    className="border-round-top"
                />
            ))}
        </div>
    );

    const renderPieChart = () => (
        <div className="flex justify-content-center align-items-center h-full">
            <Skeleton shape="circle" size="200px" />
        </div>
    );

    const renderLineChart = () => (
        <div className="h-full relative">
            <svg width="100%" height="100%" className="absolute">
                <defs>
                    <linearGradient id="skeleton-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#e9ecef" stopOpacity="1" />
                        <stop offset="50%" stopColor="#f8f9fa" stopOpacity="1" />
                        <stop offset="100%" stopColor="#e9ecef" stopOpacity="1" />
                    </linearGradient>
                </defs>
                <path
                    d="M 0 80 Q 50 40 100 60 T 200 50 T 300 70"
                    stroke="url(#skeleton-gradient)"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse"
                />
            </svg>
        </div>
    );

    return (
        <div className={`chart-skeleton ${className}`}>
            <div className="mb-3">
                <Skeleton width="40%" height="1.5rem" className="mb-2" />
                <Skeleton width="25%" height="1rem" />
            </div>

            <div style={{ height: '300px' }}>
                {type === 'bar' && renderBarChart()}
                {type === 'pie' && renderPieChart()}
                {type === 'line' && renderLineChart()}
            </div>
        </div>
    );
};

// Form skeleton loader
export const FormSkeleton = ({
                                 fields = 4,
                                 showActions = true,
                                 className = ''
                             }) => {
    return (
        <div className={`form-skeleton ${className}`}>
            {Array.from({ length: fields }, (_, index) => (
                <div key={index} className="field mb-4">
                    <Skeleton width="30%" height="1rem" className="mb-2" />
                    <Skeleton width="100%" height="2.5rem" />
                </div>
            ))}

            {showActions && (
                <div className="flex gap-2 mt-4">
                    <Skeleton width="100px" height="2.5rem" />
                    <Skeleton width="80px" height="2.5rem" />
                </div>
            )}
        </div>
    );
};

// Generic content skeleton
export const ContentSkeleton = ({
                                    lines = 3,
                                    showTitle = true,
                                    showAvatar = false,
                                    className = ''
                                }) => {
    return (
        <div className={`content-skeleton ${className}`}>
            <div className="flex align-items-start gap-3">
                {showAvatar && (
                    <Skeleton shape="circle" size="3rem" />
                )}

                <div className="flex-1">
                    {showTitle && (
                        <Skeleton width="60%" height="1.5rem" className="mb-3" />
                    )}

                    {Array.from({ length: lines }, (_, index) => (
                        <Skeleton
                            key={index}
                            width={index === lines - 1 ? '70%' : '100%'}
                            height="1rem"
                            className="mb-2"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Conditional loading wrapper
export const ConditionalLoader = ({
                                      loading,
                                      skeleton,
                                      children,
                                      fallback = null
                                  }) => {
    if (loading) {
        return skeleton || fallback || <LoadingSpinner />;
    }

    return children;
};

export default LoadingSpinner;