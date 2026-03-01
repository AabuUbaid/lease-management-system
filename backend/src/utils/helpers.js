/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date) => {
    return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

/**
 * Sanitize email (lowercase, trim)
 */
export const sanitizeEmail = (email) => {
    return email.trim().toLowerCase();
};

/**
 * Generate random password (for temporary passwords)
 */
export const generatePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};