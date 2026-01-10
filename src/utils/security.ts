import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a cryptographically secure device ID
 */
export const generateSecureDeviceId = async (): Promise<string> => {
  try {
    // Try to use the database function for maximum security
    const { data } = await supabase.rpc('generate_secure_device_id');
    if (data) return data;
  } catch (error) {
    console.warn('Failed to generate device ID from database:', error);
  }
  
  // Fallback to crypto API if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return 'device_' + Array.from(array, val => val.toString(36)).join('_');
  }
  
  // Final fallback (less secure)
  console.warn('Using less secure device ID generation method');
  return 'device_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
};

/**
 * Validate ZIP code format
 */
export const validateZipCode = (zipCode: string): boolean => {
  if (!zipCode || typeof zipCode !== 'string') return false;
  // US ZIP code format: 5 digits or 5+4 format
  return /^[0-9]{5}(-[0-9]{4})?$/.test(zipCode.trim());
};

/**
 * Sanitize ZIP code input
 */
export const sanitizeZipCode = (zipCode: string): string => {
  return zipCode.trim().replace(/[^0-9-]/g, '');
};

/**
 * Rate limiting helper for client-side operations
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();