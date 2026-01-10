/**
 * Secure device ID generation utilities
 * Implements cryptographically secure device identification
 */

/**
 * Generates a cryptographically secure device ID
 * Uses Web Crypto API for better security than Math.random()
 */
export const generateSecureDeviceId = (): string => {
  try {
    // Use crypto.getRandomValues for secure random generation
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Convert to hexadecimal string
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Web Crypto API not available, falling back to less secure method:', error);
    
    // Fallback to timestamp + random for older browsers
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
  }
};

/**
 * Validates device ID format
 * Ensures device ID meets security requirements
 */
export const validateDeviceId = (deviceId: string): boolean => {
  if (!deviceId || typeof deviceId !== 'string') {
    return false;
  }
  
  // Check for minimum length (32 chars for hex, or timestamp format)
  if (deviceId.length < 16) {
    return false;
  }
  
  // Check if it's a valid hex string (secure format)
  const hexPattern = /^[a-f0-9]{32}$/i;
  if (hexPattern.test(deviceId)) {
    return true;
  }
  
  // Check if it's a valid timestamp format (fallback)
  const timestampPattern = /^[a-z0-9]+-[a-z0-9]+$/;
  return timestampPattern.test(deviceId);
};

/**
 * Gets or creates a secure device ID
 * Stores in localStorage for persistence across sessions
 */
export const getOrCreateDeviceId = (): string => {
  const STORAGE_KEY = 'nest_protect_device_id';
  
  try {
    // Try to get existing device ID
    const existingId = localStorage.getItem(STORAGE_KEY);
    
    if (existingId && validateDeviceId(existingId)) {
      return existingId;
    }
    
    // Generate new secure device ID
    const newDeviceId = generateSecureDeviceId();
    
    // Store for future use
    localStorage.setItem(STORAGE_KEY, newDeviceId);
    
    return newDeviceId;
  } catch (error) {
    console.warn('localStorage not available, using session-only device ID:', error);
    
    // Return a session-only device ID if localStorage fails
    return generateSecureDeviceId();
  }
};

/**
 * Regenerates device ID (useful for security refresh)
 */
export const regenerateDeviceId = (): string => {
  const STORAGE_KEY = 'nest_protect_device_id';
  
  try {
    // Remove old device ID
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear old device ID:', error);
  }
  
  // Generate and store new one
  return getOrCreateDeviceId();
};