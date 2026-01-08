import { format as dateFnsFormat } from 'date-fns';

/**
 * Safely format a date with fallback handling
 * @param date - Date value (string, Date, or null/undefined)
 * @param formatString - date-fns format string (default: 'PPP')
 * @param fallback - Fallback text if date is invalid (default: 'N/A')
 * @returns Formatted date string or fallback
 */
export const safeFormatDate = (
    date: string | Date | null | undefined,
    formatString: string = 'PPP',
    fallback: string = 'N/A'
): string => {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date value:', date);
            return fallback;
        }

        return dateFnsFormat(dateObj, formatString);
    } catch (error) {
        console.error('Error formatting date:', date, error);
        return fallback;
    }
};

/**
 * Safely format a date with time
 * @param date - Date value (string, Date, or null/undefined)
 * @param fallback - Fallback text if date is invalid (default: 'N/A')
 * @returns Formatted date and time string or fallback
 */
export const safeFormatDateTime = (
    date: string | Date | null | undefined,
    fallback: string = 'N/A'
): string => {
    return safeFormatDate(date, 'PPP p', fallback);
};

/**
 * Safely format a time only
 * @param date - Date value (string, Date, or null/undefined)
 * @param fallback - Fallback text if date is invalid (default: 'N/A')
 * @returns Formatted time string or fallback
 */
export const safeFormatTime = (
    date: string | Date | null | undefined,
    fallback: string = 'N/A'
): string => {
    return safeFormatDate(date, 'p', fallback);
};

/**
 * Check if a date value is valid
 * @param date - Date value to check
 * @returns true if date is valid, false otherwise
 */
export const isValidDate = (date: any): boolean => {
    if (!date) return false;

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return !isNaN(dateObj.getTime());
    } catch {
        return false;
    }
};

/**
 * Get a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - Date value
 * @param fallback - Fallback text if date is invalid
 * @returns Relative time string or fallback
 */
export const getRelativeTime = (
    date: string | Date | null | undefined,
    fallback: string = 'N/A'
): string => {
    if (!date || !isValidDate(date)) return fallback;

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
        if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) !== 1 ? 's' : ''} ago`;
        if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) !== 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) !== 1 ? 's' : ''} ago`;
    } catch (error) {
        console.error('Error calculating relative time:', date, error);
        return fallback;
    }
};

export default {
    safeFormatDate,
    safeFormatDateTime,
    safeFormatTime,
    isValidDate,
    getRelativeTime
};
