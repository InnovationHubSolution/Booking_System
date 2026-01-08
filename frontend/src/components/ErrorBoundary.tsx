import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // Log to error reporting service (e.g., Sentry)
        if (import.meta.env.PROD) {
            // Send to error tracking service
            console.error('Production error:', { error, errorInfo });
        }
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                            <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                        </div>

                        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                            Oops! Something went wrong
                        </h2>

                        <p className="mt-2 text-center text-gray-600">
                            We apologize for the inconvenience. An unexpected error has occurred.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-md">
                                <p className="text-sm font-mono text-red-600 break-words">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-sm text-gray-700 cursor-pointer">
                                            Stack trace
                                        </summary>
                                        <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Go to Homepage
                            </button>
                        </div>

                        <p className="mt-4 text-center text-sm text-gray-500">
                            If the problem persists, please contact{' '}
                            <a href="mailto:support@vanuatubooking.com" className="text-blue-600 hover:underline">
                                support@vanuatubooking.com
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
