// ===== COPILOT PROMPT #8: Omnichannel Dashboard Page =====
// Main omnichannel dashboard page with Next.js app router integration

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';

// Dynamic imports for code splitting
const OmnichannelDashboard = dynamic(
  () => import('../../../components/omnichannel/OmnichannelDashboard'),
  { 
    loading: () => <OmnichannelLoading />,
    ssr: false // Client-side only for real-time features
  }
);

const CampaignOrchestrationDashboard = dynamic(
  () => import('../../../components/campaigns/CampaignOrchestrationDashboard'),
  { 
    loading: () => <CampaignLoading />,
    ssr: false
  }
);

const MobilePWAApp = dynamic(
  () => import('../../../components/mobile/MobilePWAApp'),
  { 
    loading: () => <MobileLoading />,
    ssr: false
  }
);

// Main Omnichannel Page Component
export default function OmnichannelPage() {
  return (
    <ErrorBoundary
      FallbackComponent={OmnichannelErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Omnichannel dashboard error:', error, errorInfo);
        // Send to error reporting service (Sentry, etc.)
        if (typeof window !== 'undefined' && window.Sentry) {
          window.Sentry.captureException(error, {
            contexts: {
              errorBoundary: {
                componentStack: errorInfo.componentStack
              }
            }
          });
        }
      }}
    >
      <div className="omnichannel-dashboard">
        {/* Mobile PWA Detection and Rendering */}
        <MobileResponsiveWrapper>
          <Suspense fallback={<OmnichannelLoading />}>
            {/* Main Omnichannel Dashboard */}
            <div className="hidden md:block">
              <OmnichannelDashboard />
            </div>
            
            {/* Campaign Orchestration Integration */}
            <div className="mt-6 hidden md:block">
              <CampaignOrchestrationDashboard isActive={true} />
            </div>
            
            {/* Mobile PWA App */}
            <div className="block md:hidden">
              <MobilePWAApp
                user={{
                  name: 'Demo User',
                  email: 'demo@vocelio.com',
                  avatar: '/avatars/demo-user.jpg'
                }}
                initialView="dashboard"
              />
            </div>
          </Suspense>
        </MobileResponsiveWrapper>
      </div>
    </ErrorBoundary>
  );
}

// Mobile Responsive Wrapper Component
function MobileResponsiveWrapper({ children }) {
  return (
    <div className="min-h-screen">
      {/* PWA Meta Tags Injection */}
      <PWAMetaTags />
      
      {/* Responsive Content */}
      {children}
      
      {/* Performance Monitoring */}
      <PerformanceMonitor />
      
      {/* Analytics Integration */}
      <AnalyticsProvider />
    </div>
  );
}

// PWA Meta Tags Component
function PWAMetaTags() {
  if (typeof window === 'undefined') return null;

  return null; // Meta tags should be in layout or _document
}

// Performance Monitoring Component
function PerformanceMonitor() {
  if (typeof window === 'undefined') return null;

  // Web Vitals monitoring
  React.useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }, []);

  return null;
}

// Analytics Provider Component
function AnalyticsProvider() {
  if (typeof window === 'undefined') return null;

  React.useEffect(() => {
    // Initialize analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: 'Omnichannel Dashboard',
        page_location: window.location.href
      });
    }
  }, []);

  return null;
}

// Loading Components
function OmnichannelLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignLoading() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
      
      {/* Navigation Tabs Skeleton */}
      <div className="flex space-x-8 border-b border-gray-200 pb-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-20 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="h-32 bg-gray-100 rounded mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-48 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Mobile Header Skeleton */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        
        {/* Channel Switcher Skeleton */}
        <div className="flex space-x-2 mt-4 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 h-8 w-20 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="h-3 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error Fallback Component
function OmnichannelErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Omnichannel Dashboard Error
        </h2>
        <p className="text-gray-600 mb-6">
          We're having trouble loading your omnichannel dashboard. This might be a temporary issue.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reload Page
          </button>
          
          <a
            href="/dashboard"
            className="block w-full bg-gray-50 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Dev Mode)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\nStack Trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Metadata for the page
export const metadata = {
  title: 'Omnichannel Dashboard | Vocelio AI',
  description: 'Manage all customer interactions across voice, video, chat, email and SMS channels in one unified AI-powered platform.',
  keywords: 'omnichannel, customer service, AI, voice, video, chat, email, SMS, analytics, campaigns',
};
