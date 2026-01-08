import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    return (
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`} />
    );
};

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
                <LoadingSpinner size="xl" />
                <p className="mt-4 text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
};

interface PageLoadingProps {
    message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="xl" className="mx-auto" />
                <p className="mt-4 text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
};

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
    );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
    rows = 5,
    cols = 4
}) => {
    return (
        <div className="space-y-3">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-10" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12" />
                    ))}
                </div>
            ))}
        </div>
    );
};

interface ButtonLoadingProps {
    loading: boolean;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
    loading,
    children,
    className = '',
    disabled = false,
    onClick,
    type = 'button'
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`relative ${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                </span>
            )}
            <span className={loading ? 'invisible' : ''}>{children}</span>
        </button>
    );
};

export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
};

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
    return (
        <div className="text-center py-12">
            {icon && <div className="flex justify-center mb-4">{icon}</div>}
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default {
    LoadingSpinner,
    LoadingOverlay,
    PageLoading,
    Skeleton,
    CardSkeleton,
    TableSkeleton,
    ButtonLoading,
    PropertyGridSkeleton,
    EmptyState
};
