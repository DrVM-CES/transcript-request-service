/**
 * MFC Authentication and Client Detection
 * 
 * This module handles:
 * 1. Detecting if a user came from MFC app vs general web
 * 2. Extracting MFC user information from URL parameters
 * 3. Verifying MFC client status
 */

export interface MFCUser {
  username: string;
  email?: string;
  userId?: string;
  isMFCClient: boolean;
}

/**
 * Detect if the request came from MFC app
 * Checks for:
 * 1. URL parameter: ?source=mfc or ?mfc=true
 * 2. Referrer header containing MFC domain
 * 3. MFC-specific user token
 */
export function detectMFCSource(request: Request): boolean {
  const url = new URL(request.url);
  
  // Check URL parameters
  const source = url.searchParams.get('source');
  const mfcParam = url.searchParams.get('mfc');
  
  if (source === 'mfc' || mfcParam === 'true') {
    return true;
  }
  
  // Check referrer
  const referrer = request.headers.get('referer');
  if (referrer && (
    referrer.includes('myfuturecapacity') || 
    referrer.includes('mfc')
  )) {
    return true;
  }
  
  return false;
}

/**
 * Extract MFC user information from request
 * Expected URL format: /request?source=mfc&username=student123&email=student@example.com
 */
export function extractMFCUser(request: Request): MFCUser | null {
  const url = new URL(request.url);
  
  const username = url.searchParams.get('username') || url.searchParams.get('user');
  const email = url.searchParams.get('email');
  const userId = url.searchParams.get('userId') || url.searchParams.get('user_id');
  
  if (!username) {
    return null;
  }
  
  return {
    username,
    email: email || undefined,
    userId: userId || undefined,
    isMFCClient: true,
  };
}

/**
 * Client-side helper to detect MFC source from URL
 */
export function detectMFCSourceClient(): boolean {
  if (typeof window === 'undefined') return false;
  
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  const mfcParam = params.get('mfc');
  
  if (source === 'mfc' || mfcParam === 'true') {
    return true;
  }
  
  // Check referrer
  if (document.referrer && (
    document.referrer.includes('myfuturecapacity') || 
    document.referrer.includes('mfc')
  )) {
    return true;
  }
  
  // Check sessionStorage (persists through navigation)
  return sessionStorage.getItem('mfc_source') === 'true';
}

/**
 * Client-side helper to get MFC user info from URL
 */
export function getMFCUserClient(): MFCUser | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username') || params.get('user');
  const email = params.get('email');
  const userId = params.get('userId') || params.get('user_id');
  
  if (!username) {
    // Try to get from sessionStorage
    const stored = sessionStorage.getItem('mfc_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }
  
  const user: MFCUser = {
    username,
    email: email || undefined,
    userId: userId || undefined,
    isMFCClient: true,
  };
  
  // Store in sessionStorage for persistence
  sessionStorage.setItem('mfc_user', JSON.stringify(user));
  sessionStorage.setItem('mfc_source', 'true');
  
  return user;
}

/**
 * Verify if a user is an MFC client
 * In production, this would make an API call to MFC's user database
 * For now, returns true if user came from MFC
 */
export async function verifyMFCClient(username: string): Promise<boolean> {
  // TODO: Implement actual MFC API verification
  // Example:
  // const response = await fetch('/api/verify-mfc-client', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ username }),
  // });
  // return response.ok;
  
  // For now, assume user is MFC client if they came from MFC
  return true;
}

/**
 * Get pricing for user based on MFC client status
 */
export function getPricing(isMFCClient: boolean): {
  price: number;
  currency: string;
  description: string;
} {
  if (isMFCClient) {
    return {
      price: 0,
      currency: 'USD',
      description: 'Free for My Future Capacity clients',
    };
  }
  
  return {
    price: 5.99,
    currency: 'USD',
    description: 'Standard transcript request fee',
  };
}
