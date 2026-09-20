/**
 * Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date using date-fns
 */
export async function formatDate(date: Date | string, format?: string): Promise<string> {
  const { format: dateFnsFormat } = await import('date-fns');
  const defaultFormat = 'MMM d, yyyy';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateFnsFormat(dateObj, format || defaultFormat);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export async function formatRelativeTime(date: Date | string): Promise<string> {
  const { formatDistanceToNow } = await import('date-fns');
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '';
  
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate XP level from total XP
 */
export function calculateLevel(xp: number): number {
  const thresholds = [
    { level: 1, xp: 0 },
    { level: 2, xp: 500 },
    { level: 3, xp: 1500 },
    { level: 4, xp: 3000 },
    { level: 5, xp: 5000 },
    { level: 6, xp: 8000 },
    { level: 7, xp: 12000 },
    { level: 8, xp: 17000 },
    { level: 9, xp: 23000 },
    { level: 10, xp: 30000 },
    { level: 11, xp: 40000 },
    { level: 12, xp: 52000 },
    { level: 13, xp: 66000 },
    { level: 14, xp: 82000 },
    { level: 15, xp: 100000 },
  ];
  
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i].xp) {
      return thresholds[i].level;
    }
  }
  return 1;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

/**
 * Slugify a string for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
