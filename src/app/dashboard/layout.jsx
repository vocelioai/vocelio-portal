// ===== COPILOT PROMPT #8: Next.js App Router Integration =====
// Dashboard layout component for omnichannel integration

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorFallback from '../components/ErrorFallback';

// Dashboard Layout Component
export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Dashboard layout error:', error, errorInfo);
        // Send to error reporting service
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Header */}
        <DashboardHeader />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64">
              <Suspense fallback={<div className="w-64 h-screen bg-gray-800 animate-pulse" />}>
                <DashboardSidebar />
              </Suspense>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <Suspense fallback={<LoadingSpinner />}>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Metadata for SEO optimization
export const metadata = {
  title: 'Omnichannel Dashboard | Vocelio AI',
  description: 'AI-powered omnichannel customer engagement platform with voice, video, chat, and email integration.',
  keywords: 'omnichannel, customer engagement, AI, voice, video, chat, email, analytics',
  openGraph: {
    title: 'Omnichannel Dashboard | Vocelio AI',
    description: 'Manage all your customer interactions in one unified platform',
    type: 'website',
    url: 'https://app.vocelio.com/dashboard/omnichannel',
    siteName: 'Vocelio AI',
    images: [
      {
        url: 'https://app.vocelio.com/og-dashboard.jpg',
        width: 1200,
        height: 630,
        alt: 'Vocelio Omnichannel Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vocelio',
    title: 'Omnichannel Dashboard | Vocelio AI',
    description: 'AI-powered customer engagement platform',
    images: ['https://app.vocelio.com/og-dashboard.jpg']
  },
  robots: {
    index: false, // Don't index dashboard pages
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true
  }
};

// Loading UI Component
export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-gray-800 h-screen">
            <div className="p-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="w-full h-32 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error UI Component
export function DashboardError({ error, reset }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-6">
          Something went wrong while loading your dashboard. Please try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go to Main Dashboard
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
