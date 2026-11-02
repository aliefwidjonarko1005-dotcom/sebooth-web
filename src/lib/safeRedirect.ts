/**
 * `redirect` comes from the URL, so anyone can craft a login link with it. Only a path on this site
 * may pass. Resolving it the way a browser does catches `//host`, `/\host`, tabs and `javascript:`,
 * and returning the resolved path means what was checked is exactly what gets opened.
 */
export function safeRedirectPath(value: string | null): string | null {
  if (!value?.startsWith('/')) return null
  const origin = 'https://sebooth.invalid'
  try {
    const url = new URL(value, origin)
    // `/..//host` resolves to the path `//host`, which a browser would read as another site
    if (url.origin !== origin || url.pathname.startsWith('//')) return null
    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}

/**
 * Where to go after logging in or registering. These pages never touch the session themselves:
 * the claim page claims it, atomically and within the expiry rule (`claimSession`).
 */
export function afterAuthPath(claimId: string | null, redirectTo: string | null): string {
  if (claimId) return `/access/${encodeURIComponent(claimId)}`
  return redirectTo ?? '/profile'
}
