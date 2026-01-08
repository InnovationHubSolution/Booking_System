import React from 'react';

// Empty State Components for Premium UX

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionButton?: {
        label: string;
        onClick: () => void;
    };
    illustration?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionButton,
    illustration
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {illustration ? (
                <div className="w-64 h-64 mb-6">
                    <img src={illustration} alt={title} className="w-full h-full object-contain" />
                </div>
            ) : (
                <div className="text-6xl mb-6 opacity-50">{icon}</div>
            )}
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
            {actionButton && (
                <button
                    onClick={actionButton.onClick}
                    className="bg-vanuatu-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    {actionButton.label}
                </button>
            )}
        </div>
    );
};

// Specific Empty States

export const NoBookingsEmptyState: React.FC<{ onSearch: () => void }> = ({ onSearch }) => (
    <EmptyState
        icon="📅"
        title="No Bookings Yet"
        description="Your adventure in Vanuatu awaits! Start exploring amazing accommodations and experiences."
        actionButton={{
            label: "Start Exploring",
            onClick: onSearch
        }}
    />
);

export const NoWishlistEmptyState: React.FC<{ onBrowse: () => void }> = ({ onBrowse }) => (
    <EmptyState
        icon="❤️"
        title="Your Wishlist is Empty"
        description="Save your favorite properties and experiences to easily find them later. Start browsing to add items to your wishlist!"
        actionButton={{
            label: "Browse Properties",
            onClick: onBrowse
        }}
    />
);

export const NoSearchResultsEmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
    <EmptyState
        icon="🔍"
        title="No Results Found"
        description="We couldn't find any properties matching your search criteria. Try adjusting your filters or search in a different location."
        actionButton={{
            label: "Clear Filters",
            onClick: onReset
        }}
    />
);

export const NoMessagesEmptyState: React.FC = () => (
    <EmptyState
        icon="💬"
        title="No Messages Yet"
        description="Once you make a booking or connect with a host, your conversations will appear here."
    />
);

export const NoReviewsEmptyState: React.FC = () => (
    <EmptyState
        icon="⭐"
        title="No Reviews Yet"
        description="Be the first to share your experience! Your review helps other travelers make informed decisions."
    />
);

export const NoListingsEmptyState: React.FC<{ onCreateListing: () => void }> = ({ onCreateListing }) => (
    <EmptyState
        icon="🏡"
        title="No Listings Yet"
        description="Ready to start hosting? Create your first listing and start welcoming guests to your property."
        actionButton={{
            label: "Create Listing",
            onClick: onCreateListing
        }}
    />
);

export const NoNotificationsEmptyState: React.FC = () => (
    <EmptyState
        icon="🔔"
        title="All Caught Up!"
        description="You don't have any notifications right now. We'll notify you when there's something new."
    />
);

// Toast Notification Component for Friendly Messages

interface ToastProps {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-slide-in`}>
            <span className="text-2xl">{icons[type]}</span>
            <span className="font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
                ✕
            </button>
        </div>
    );
};

// Friendly Confirmation Messages

interface ConfirmationProps {
    icon: string;
    title: string;
    message: string;
    onClose: () => void;
}

export const SuccessConfirmation: React.FC<ConfirmationProps> = ({
    icon,
    title,
    message,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-scale-in">
                <div className="text-6xl mb-4">{icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-vanuatu-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
};

// Specific Confirmation Messages

export const BookingConfirmed: React.FC<{ bookingNumber: string; onClose: () => void }> = ({
    bookingNumber,
    onClose
}) => (
    <SuccessConfirmation
        icon="🎉"
        title="Booking Confirmed!"
        message={`Your booking (${bookingNumber}) has been confirmed. Check your email for details and prepare for an amazing experience in Vanuatu!`}
        onClose={onClose}
    />
);

export const AddedToWishlist: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <SuccessConfirmation
        icon="❤️"
        title="Added to Wishlist!"
        message="This property has been saved to your wishlist. You can view it anytime from your profile."
        onClose={onClose}
    />
);

export const ChangesSaved: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <SuccessConfirmation
        icon="✓"
        title="Changes Saved!"
        message="Your changes have been saved successfully."
        onClose={onClose}
    />
);

export const MessageSent: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <SuccessConfirmation
        icon="📨"
        title="Message Sent!"
        message="Your message has been sent. The host will typically respond within 24 hours."
        onClose={onClose}
    />
);

// Error Message Component with Friendly Explanations

interface ErrorMessageProps {
    error: string | Error;
    onRetry?: () => void;
    onClose?: () => void;
}

export const FriendlyErrorMessage: React.FC<ErrorMessageProps> = ({
    error,
    onRetry,
    onClose
}) => {
    const errorMessage = typeof error === 'string' ? error : error.message;

    // Convert technical errors to user-friendly messages
    const getFriendlyMessage = (err: string): { title: string; message: string; icon: string } => {
        // Network errors
        if (err.includes('Network Error') || err.includes('Failed to fetch')) {
            return {
                icon: '📡',
                title: 'Connection Issue',
                message: "We're having trouble connecting. Please check your internet connection and try again."
            };
        }

        // Authentication errors
        if (err.includes('401') || err.includes('Unauthorized')) {
            return {
                icon: '🔒',
                title: 'Session Expired',
                message: 'Your session has expired. Please log in again to continue.'
            };
        }

        // Not found errors
        if (err.includes('404') || err.includes('Not Found')) {
            return {
                icon: '🔍',
                title: 'Not Found',
                message: "We couldn't find what you're looking for. It may have been removed or the link is incorrect."
            };
        }

        // Server errors
        if (err.includes('500') || err.includes('Server Error')) {
            return {
                icon: '⚠️',
                title: 'Something Went Wrong',
                message: "We're experiencing technical difficulties. Our team has been notified. Please try again in a few minutes."
            };
        }

        // Payment errors
        if (err.includes('payment') || err.includes('card')) {
            return {
                icon: '💳',
                title: 'Payment Issue',
                message: 'There was a problem processing your payment. Please check your card details and try again.'
            };
        }

        // Validation errors
        if (err.includes('validation') || err.includes('invalid')) {
            return {
                icon: '📝',
                title: 'Invalid Input',
                message: 'Please check the information you entered and try again.'
            };
        }

        // Rate limit errors
        if (err.includes('429') || err.includes('Too Many Requests')) {
            return {
                icon: '⏱️',
                title: 'Slow Down',
                message: "You're making requests too quickly. Please wait a moment and try again."
            };
        }

        // Default friendly error
        return {
            icon: '😕',
            title: 'Oops!',
            message: 'Something unexpected happened. Please try again. If the problem persists, contact our support team.'
        };
    };

    const friendly = getFriendlyMessage(errorMessage);

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <div className="flex items-start">
                <span className="text-4xl mr-4">{friendly.icon}</span>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-1">{friendly.title}</h3>
                    <p className="text-red-700 mb-4">{friendly.message}</p>
                    <div className="flex space-x-3">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Loading States with Friendly Messages

interface LoadingStateProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    size = 'medium'
}) => {
    const sizes = {
        small: 'w-8 h-8',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`${sizes[size]} border-4 border-vanuatu-blue border-t-transparent rounded-full animate-spin mb-4`}></div>
            <p className="text-gray-600 font-medium">{message}</p>
        </div>
    );
};

// Specific Loading States

export const SearchingProperties: React.FC = () => (
    <LoadingState message="Finding the perfect places for you..." size="large" />
);

export const ProcessingPayment: React.FC = () => (
    <LoadingState message="Processing your payment securely..." size="medium" />
);

export const LoadingBookings: React.FC = () => (
    <LoadingState message="Loading your bookings..." size="medium" />
);

// Confirmation Dialog Component

interface ConfirmationDialogProps {
    icon: string;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    confirmColor?: 'blue' | 'red' | 'green';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    icon,
    title,
    message,
    confirmText,
    cancelText,
    confirmColor = 'blue',
    onConfirm,
    onCancel
}) => {
    const colors = {
        blue: 'bg-vanuatu-blue hover:bg-blue-700',
        red: 'bg-red-600 hover:bg-red-700',
        green: 'bg-green-600 hover:bg-green-700'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 animate-scale-in">
                <div className="text-5xl mb-4 text-center">{icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</h2>
                <p className="text-gray-600 mb-6 text-center">{message}</p>
                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 ${colors[confirmColor]} text-white px-4 py-3 rounded-lg font-medium transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Typography Components for Consistency

export const Heading1: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 ${className}`}>{children}</h1>
);

export const Heading2: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 ${className}`}>{children}</h2>
);

export const Heading3: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-2xl md:text-3xl font-semibold text-gray-900 ${className}`}>{children}</h3>
);

export const Heading4: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h4 className={`text-xl md:text-2xl font-semibold text-gray-900 ${className}`}>{children}</h4>
);

export const BodyText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <p className={`text-base text-gray-700 leading-relaxed ${className}`}>{children}</p>
);

export const SmallText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

export const Caption: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <p className={`text-xs text-gray-500 ${className}`}>{children}</p>
);

// Badge Component

interface BadgeProps {
    children: React.ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
    size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', size = 'medium' }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800'
    };

    const sizes = {
        small: 'text-xs px-2 py-1',
        medium: 'text-sm px-3 py-1',
        large: 'text-base px-4 py-2'
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${colors[color]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

// Export all components
export default {
    EmptyState,
    NoBookingsEmptyState,
    NoWishlistEmptyState,
    NoSearchResultsEmptyState,
    NoMessagesEmptyState,
    NoReviewsEmptyState,
    NoListingsEmptyState,
    NoNotificationsEmptyState,
    Toast,
    SuccessConfirmation,
    BookingConfirmed,
    AddedToWishlist,
    ChangesSaved,
    MessageSent,
    FriendlyErrorMessage,
    LoadingState,
    SearchingProperties,
    ProcessingPayment,
    LoadingBookings,
    ConfirmationDialog,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    BodyText,
    SmallText,
    Caption,
    Badge
};
