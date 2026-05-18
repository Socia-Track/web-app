/**
 * Utility functions for handling subdomain-based routing
 */

/**
 * Check if the current domain is the admin subdomain
 * @returns true if on admin.sociatrack.com or localhost with admin subdomain
 */
export function isAdminSubdomain(): boolean {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname.toLowerCase()
  
  // Check for admin subdomain
  if (hostname === 'admin.sociatrack.com') {
    return true
  }
  
  // Support for localhost development (e.g., admin.localhost:5174)
  if (hostname.startsWith('admin.')) {
    return true
  }
  
  return false
}

/**
 * Get the base domain without subdomain
 * @returns the base domain (e.g., sociatrack.com)
 */
export function getBaseDomain(): string {
  if (typeof window === 'undefined') return ''
  
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  // If localhost or IP, return as is
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname
  }
  
  // Return last two parts (domain.tld)
  if (parts.length >= 2) {
    return parts.slice(-2).join('.')
  }
  
  return hostname
}

/**
 * Get the subdomain from the current hostname
 * @returns the subdomain or null if none
 */
export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null
  
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  // No subdomain if only domain.tld or localhost
  if (parts.length <= 2 || hostname === 'localhost') {
    return null
  }
  
  // Return the first part as subdomain
  return parts[0]
}

/**
 * Navigate to a different subdomain
 * @param subdomain - The subdomain to navigate to (e.g., 'admin')
 * @param path - Optional path to navigate to on the subdomain
 */
export function navigateToSubdomain(subdomain: string, path: string = '/'): void {
  if (typeof window === 'undefined') return
  
  const baseDomain = getBaseDomain()
  const port = window.location.port ? `:${window.location.port}` : ''
  const protocol = window.location.protocol
  
  let newUrl: string
  
  if (subdomain) {
    newUrl = `${protocol}//${subdomain}.${baseDomain}${port}${path}`
  } else {
    newUrl = `${protocol}//${baseDomain}${port}${path}`
  }
  
  window.location.href = newUrl
}
