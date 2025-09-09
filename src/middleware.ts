// ===== COPILOT PROMPT #8: Authentication Middleware =====
// Vite-compatible authentication and route protection middleware

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/omnichannel',
  '/dashboard/sessions',
  '/dashboard/analytics',
  '/dashboard/campaigns',
  '/api/dashboard',
  '/api/sessions',
  '/api/analytics',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// API routes that require special handling
const apiRoutes = [
  '/api/auth',
  '/api/health',
  '/api/metrics',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('vocelio_auth_token')?.value;
  const refreshToken = request.cookies.get('vocelio_refresh_token')?.value;
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    return handleApiRoute(request, pathname, token);
  }
  
  // Handle authentication routes
  if (pathname.startsWith('/auth/')) {
    return handleAuthRoute(request, pathname, token);
  }
  
  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    return handleProtectedRoute(request, pathname, token, refreshToken);
  }
  
  // Handle public routes
  if (isPublicRoute(pathname)) {
    return handlePublicRoute(request, pathname);
  }
  
  // Default: allow the request to continue
  return NextResponse.next();
}

// Check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname) || pathname.startsWith('/public/');
}

// Handle API route authentication
function handleApiRoute(request: NextRequest, pathname: string, token?: string) {
  // Health check and metrics endpoints are public
  if (pathname === '/api/health' || pathname === '/api/metrics') {
    return NextResponse.next();
  }
  
  // Authentication endpoints are public
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // All other API routes require authentication
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  // Add security headers for API routes
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Handle authentication routes (login, register, etc.)
function handleAuthRoute(request: NextRequest, pathname: string, token?: string) {
  // If user is already authenticated, redirect to dashboard
  if (token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access to authentication routes
  return NextResponse.next();
}

// Handle protected routes
function handleProtectedRoute(
  request: NextRequest, 
  pathname: string, 
  token?: string, 
  refreshToken?: string
) {
  // No token at all - redirect to login
  if (!token && !refreshToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Has refresh token but no access token - try to refresh
  if (!token && refreshToken) {
    // In a real app, you'd validate the refresh token here
    // For now, redirect to login with refresh attempt
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('refresh', 'true');
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Has token - validate it (simplified validation)
  if (token && !isTokenValid(token)) {
    // Token is invalid, clear cookies and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('vocelio_auth_token');
    response.cookies.delete('vocelio_refresh_token');
    return response;
  }
  
  // Add security headers for protected routes
  const response = NextResponse.next();
  addSecurityHeaders(response);
  
  return response;
}

// Handle public routes
function handlePublicRoute(request: NextRequest, pathname: string) {
  const response = NextResponse.next();
  
  // Add basic security headers even for public routes
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Simplified token validation (in production, use proper JWT validation)
function isTokenValid(token: string): boolean {
  try {
    // Basic token structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch (error) {
    return false;
  }
}

// Add comprehensive security headers
function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://omnichannel-hub-313373223340.us-central1.run.app wss://omnichannel-hub-313373223340.us-central1.run.app; " +
    "frame-src 'none'; " +
    "object-src 'none';"
  );
  
  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
}

// Rate limiting (simplified implementation)
const rateLimitMap = new Map();

function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  
  // Remove old requests outside the window
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  // Check if limit exceeded
  if (validRequests.length >= limit) {
    return false;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  
  return true;
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|sw.js|manifest.json).*)',
  ],
};
