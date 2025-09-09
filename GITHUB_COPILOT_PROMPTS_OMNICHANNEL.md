# 🤖 GITHUB COPILOT PROMPTS FOR OMNICHANNEL HUB INTEGRATION

## 📅 Date: September 9, 2025  
## 🎯 Target: Complete Omnichannel Dashboard for https://app.vocelio.com

---

## 🚀 **COPILOT PROMPT #1: MAIN DASHBOARD COMPONENT**

```markdown
@workspace Create a comprehensive React TypeScript omnichannel dashboard component for integration into app.vocelio.com with the following specifications:

**REQUIREMENTS:**
- Main dashboard layout with 8 communication channels (voice, video, chat, email, SMS, mobile app, web portal, WhatsApp)
- Real-time WebSocket integration with https://omnichannel-hub-313373223340.us-central1.run.app
- Redux Toolkit state management with RTK Query for API caching
- Tailwind CSS styling with dark mode support
- Mobile-responsive design with touch-friendly controls
- TypeScript interfaces for all data structures

**FEATURES TO IMPLEMENT:**
1. **Channel Status Overview**: Grid display showing 8 channels with real-time status indicators, active session counts, and performance metrics
2. **Navigation Tabs**: Switch between Overview, Sessions, Routing, Campaigns, and Analytics views
3. **Real-time Activity Feed**: Live updates of customer interactions across all channels
4. **Connection Status**: Visual indicator of WebSocket connection health
5. **Session Management**: List of active customer sessions with transfer capabilities
6. **Customer Context Panel**: Unified customer view with interaction history
7. **Performance Metrics**: KPI cards showing response times, resolution rates, satisfaction scores
8. **Notification System**: Toast notifications for important events and alerts

**TECHNICAL SPECIFICATIONS:**
- Use React functional components with hooks
- Implement custom hooks for API integration and WebSocket management
- Include proper error handling and loading states
- Support offline functionality with service workers
- Implement accessibility features (WCAG 2.1 AA compliance)
- Use modern ES6+ features and async/await patterns
- Include comprehensive TypeScript types and interfaces

**API INTEGRATION:**
- Base URL: https://omnichannel-hub-313373223340.us-central1.run.app
- WebSocket URL: wss://omnichannel-hub-313373223340.us-central1.run.app/ws/dashboard
- Include authentication headers and error handling
- Implement retry logic and connection recovery

**STYLING REQUIREMENTS:**
- Professional enterprise-grade UI design
- Consistent color scheme and typography
- Responsive grid layouts (mobile-first approach)
- Smooth animations and transitions using Framer Motion
- Dark mode toggle with system preference detection

Please generate the complete component code including all necessary imports, hooks, types, and styling classes.
```

---

## 🤖 **COPILOT PROMPT #2: API SERVICE & HOOKS**

```markdown
@workspace Create a comprehensive API service class and React hooks for omnichannel platform integration with the following requirements:

**API SERVICE CLASS:**
Create a TypeScript class `OmnichannelAPIService` that handles all API communications with:
- Base URL: https://omnichannel-hub-313373223340.us-central1.run.app
- Authentication with Bearer token support
- Request/response interceptors for logging and error handling
- Retry logic with exponential backoff
- Type-safe method signatures for all endpoints

**ENDPOINTS TO IMPLEMENT:**
1. **Session Management**: create, get, update, delete, list active sessions
2. **Message Processing**: process messages, get history, send responses
3. **Channel Operations**: get integrations, configure channels, transfer channels
4. **Intelligent Routing**: get AI recommendations, execute routing decisions
5. **Campaign Management**: launch campaigns, get status, pause/resume
6. **Voice Operations**: initiate calls, transfer calls, manage conferences
7. **Video Operations**: create rooms, manage participants, screen sharing
8. **Chat Operations**: send messages, file uploads, moderation
9. **Email Operations**: send emails, manage threads, apply templates
10. **SMS/WhatsApp**: send messages, check delivery status, bulk operations
11. **Analytics**: get performance data, generate reports, export data
12. **System Operations**: health checks, capabilities, diagnostics

**CUSTOM HOOKS TO CREATE:**
1. **useOmnichannelAPI**: Main API hook with loading states and error handling
2. **useWebSocket**: WebSocket connection management with auto-reconnect
3. **useChannelManager**: Channel state management and operations
4. **useCustomerSession**: Customer session lifecycle management
5. **useRealTimeUpdates**: Real-time data synchronization
6. **useNotifications**: Notification system with toast integration
7. **usePerformanceMetrics**: Analytics and performance tracking
8. **useCampaignOrchestrator**: Campaign management operations

**TECHNICAL REQUIREMENTS:**
- Full TypeScript support with proper interfaces
- React Query integration for caching and synchronization
- Error boundaries and fallback UI components  
- Optimistic updates for better UX
- Background sync for offline support
- Performance optimization with memoization
- Comprehensive error handling and user feedback

**DATA STRUCTURES:**
Include TypeScript interfaces for:
- UnifiedSession, ChannelMessage, ChannelResponse
- ChannelIntegration, ChannelPerformance, TransferResult
- CampaignData, AnalyticsData, SystemHealth
- WebSocketMessage, NotificationData, CustomerProfile

Generate the complete API service class and all custom hooks with proper error handling, loading states, and TypeScript definitions.
```

---

## 🤖 **COPILOT PROMPT #3: CHANNEL-SPECIFIC COMPONENTS**

```markdown
@workspace Create individual React TypeScript components for each communication channel in the omnichannel platform:

**CHANNEL COMPONENTS TO BUILD:**

1. **VoiceChannelPanel.tsx**:
   - Call control interface (dial, answer, hold, transfer, conference, record)
   - Real-time call quality indicators (bandwidth, latency, audio quality)
   - Call duration timer and participant list
   - Voice-to-text transcription display
   - Call notes and customer context
   - Integration with telephony API endpoints

2. **VideoChannelPanel.tsx**:
   - Video call interface with local and remote video streams
   - Screen sharing controls and participant management
   - Video quality metrics (resolution, frame rate, bandwidth)
   - Recording controls and playback
   - Chat overlay for video calls
   - Virtual background and effects

3. **ChatChannelPanel.tsx**:
   - Real-time messaging interface with typing indicators
   - File upload and media sharing capabilities
   - Emoji picker and reaction system
   - Message history with search and filtering
   - Automated response suggestions
   - Chatbot integration controls

4. **EmailChannelPanel.tsx**:
   - Rich text email composition with formatting tools
   - Email template library and insertion
   - Attachment management and preview
   - Email thread organization and threading
   - Scheduled sending and follow-up reminders
   - Spam detection and filtering

5. **SMSChannelPanel.tsx**:
   - SMS composition with character counting
   - Delivery status tracking and receipts
   - Bulk messaging capabilities
   - Short code management
   - Opt-in/opt-out compliance handling
   - Message templates and automation

6. **MobileAppPanel.tsx**:
   - Push notification management
   - In-app messaging interface
   - App usage analytics and engagement metrics
   - Deep linking and navigation controls
   - User preference management
   - App version and compatibility tracking

7. **WebPortalPanel.tsx**:
   - Web chat widget configuration
   - Portal content management
   - User authentication and session management
   - Analytics dashboard for portal usage
   - Knowledge base integration
   - Form builder and submission handling

8. **WhatsAppPanel.tsx**:
   - WhatsApp Business API integration
   - Media message support (images, documents, audio)
   - Business profile management
   - Template message creation and approval
   - Broadcast list management
   - Compliance with WhatsApp policies

**SHARED REQUIREMENTS FOR ALL COMPONENTS:**
- Responsive design with mobile-first approach
- Real-time updates via WebSocket connections
- Integration with unified session management
- Customer context preservation across channels
- Performance monitoring and metrics collection
- Accessibility compliance (WCAG 2.1 AA)
- Dark mode support with theme switching
- Error handling and graceful degradation
- Loading states and skeleton screens
- Animation and transition effects

**TECHNICAL SPECIFICATIONS:**
- React functional components with TypeScript
- Custom hooks for channel-specific operations
- Redux integration for state management
- Tailwind CSS for styling with component variants
- Proper prop validation and default values
- Memoization for performance optimization
- Event handling and keyboard navigation
- Focus management and screen reader support

Generate all 8 channel components with complete functionality, proper TypeScript types, responsive styling, and integration with the omnichannel API service.
```

---

## 🤖 **COPILOT PROMPT #4: REAL-TIME WEBSOCKET INTEGRATION**

```markdown
@workspace Create a comprehensive WebSocket integration system for real-time omnichannel platform communication:

**WEBSOCKET MANAGEMENT SYSTEM:**

1. **WebSocketProvider Component**:
   - Context provider for WebSocket connections across the app
   - Multiple connection management for different data streams
   - Connection pooling and load balancing
   - Automatic reconnection with exponential backoff
   - Connection health monitoring and diagnostics

2. **useWebSocket Custom Hook**:
   - WebSocket URL: wss://omnichannel-hub-313373223340.us-central1.run.app/ws/{sessionId}
   - Connection state management (connecting, connected, disconnected, error)
   - Message queue for offline scenarios
   - Ping/pong heartbeat mechanism
   - Message filtering and routing
   - Connection recovery and failover

3. **Real-time Data Handlers**:
   - Session updates and state changes
   - Channel transfers and routing decisions
   - New message notifications across channels
   - Performance metric updates
   - System alerts and error notifications
   - Customer activity and engagement events
   - Campaign status and performance updates
   - Agent status and availability changes

**MESSAGE TYPES TO HANDLE:**
```typescript
interface WebSocketMessage {
  type: 'session_update' | 'channel_transfer' | 'new_message' | 'routing_recommendation' | 
        'campaign_update' | 'performance_update' | 'system_alert' | 'customer_activity' |
        'agent_status' | 'notification' | 'heartbeat' | 'error';
  payload: any;
  timestamp: string;
  sessionId?: string;
  customerId?: string;
  channelType?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
```

**REAL-TIME FEATURES TO IMPLEMENT:**
1. **Live Session Monitoring**: Real-time updates of active customer sessions
2. **Message Streaming**: Instant delivery of messages across all channels
3. **Channel Transfer Notifications**: Live updates when customers switch channels
4. **Performance Metrics**: Real-time KPI updates and dashboard refreshes
5. **System Health Monitoring**: Live status of all integrated services
6. **Customer Activity Tracking**: Real-time customer engagement monitoring
7. **Agent Presence**: Live agent status and availability updates
8. **Notification System**: Real-time alerts and system notifications

**ADVANCED FEATURES:**
- Message acknowledgment and delivery confirmation
- Offline message queuing and synchronization
- Connection multiplexing for multiple data streams
- Message compression and optimization
- Security with authentication and encryption
- Rate limiting and throttling protection
- Error recovery and graceful degradation
- Performance monitoring and analytics

**INTEGRATION REQUIREMENTS:**
- Redux store integration for state synchronization
- React component updates with minimal re-renders
- Toast notification system for user alerts
- Background synchronization for offline support
- Service worker integration for PWA functionality
- Error boundaries for connection failures
- Loading indicators and connection status display

**TECHNICAL SPECIFICATIONS:**
- TypeScript with proper type definitions
- React hooks pattern for easy integration
- Error handling and user feedback
- Performance optimization with debouncing
- Memory management and cleanup
- Browser compatibility and polyfills
- Mobile optimization and battery efficiency

Generate the complete WebSocket integration system with provider component, custom hooks, message handlers, and integration examples for the omnichannel dashboard.
```

---

## 🤖 **COPILOT PROMPT #5: ANALYTICS & REPORTING DASHBOARD**

```markdown
@workspace Create a comprehensive analytics and reporting dashboard for the omnichannel platform with advanced data visualization and business intelligence features:

**ANALYTICS DASHBOARD COMPONENTS:**

1. **KPI Overview Cards**:
   - Real-time metrics display with trend indicators
   - Response time analytics across all channels
   - Customer satisfaction scores and NPS tracking
   - Resolution rate and first-contact resolution
   - Agent productivity and utilization metrics
   - Cost per interaction and ROI calculations
   - Channel performance comparisons
   - Customer retention and churn analysis

2. **Performance Charts and Visualizations**:
   - Time-series charts for trend analysis using Chart.js/Recharts
   - Heat maps for channel usage patterns and peak times
   - Funnel analysis for customer journey tracking
   - Geographic distribution maps for global operations
   - Scatter plots for correlation analysis
   - Pie charts for channel distribution
   - Bar charts for comparative performance
   - Gauge charts for real-time metrics

3. **Advanced Analytics Features**:
   - Predictive analytics for demand forecasting
   - AI-powered insights and recommendations
   - Sentiment analysis visualization across channels
   - Customer behavior pattern recognition
   - Anomaly detection and alerting
   - Cohort analysis for customer segments
   - Attribution modeling for marketing campaigns
   - Cost optimization recommendations

**REPORTING SYSTEM:**

1. **Custom Report Builder**:
   - Drag-and-drop report designer
   - Custom date range selection with presets
   - Filter and segmentation options
   - Multiple chart type selection
   - Data export capabilities (PDF, Excel, CSV)
   - Report scheduling and automation
   - Template library for common reports
   - Collaboration and sharing features

2. **Real-time Dashboards**:
   - Live updating metrics and charts
   - Customizable dashboard layouts
   - Widget-based architecture for personalization
   - Drill-down capabilities for detailed analysis
   - Cross-filtering and interactive exploration
   - Mobile-responsive dashboard views
   - Dark/light theme support
   - Full-screen presentation mode

**DATA INTEGRATION:**

1. **API Connections**:
   - Integration with omnichannel hub analytics endpoints
   - Real-time data streaming via WebSocket
   - Batch data processing for historical analysis
   - Third-party integrations (CRM, ERP, Marketing tools)
   - Data validation and quality checks
   - Caching strategies for performance optimization

2. **Data Processing**:
   - Client-side data aggregation and calculations
   - Time-zone handling for global operations
   - Data normalization and standardization
   - Performance optimization with pagination
   - Error handling and data recovery
   - Offline capability with local caching

**TECHNICAL REQUIREMENTS:**

1. **Visualization Libraries**:
   - Chart.js or Recharts for interactive charts
   - D3.js for custom visualizations
   - Leaflet or Mapbox for geographic mapping
   - React Table for data grids
   - Date picker components for time range selection

2. **Performance Optimization**:
   - Virtual scrolling for large datasets
   - Lazy loading for charts and components
   - Memoization for expensive calculations
   - Worker threads for data processing
   - CDN integration for static assets

3. **User Experience**:
   - Intuitive navigation and filtering
   - Responsive design for all screen sizes
   - Accessibility compliance (WCAG 2.1 AA)
   - Loading states and skeleton screens
   - Error boundaries and fallback UI
   - Progressive enhancement

**SPECIFIC METRICS TO TRACK:**
- Average response time per channel
- Customer satisfaction scores (CSAT, NPS)
- First contact resolution rate
- Agent utilization and productivity
- Channel preference and usage patterns
- Cost per interaction by channel
- Customer lifetime value (CLV)
- Churn rate and retention metrics
- Escalation rates and reasons
- Peak traffic patterns and capacity planning

Generate the complete analytics dashboard with all visualization components, data processing logic, report generation features, and integration with the omnichannel API endpoints. Include TypeScript definitions, responsive styling, and proper error handling throughout.
```

---

## 🤖 **COPILOT PROMPT #6: CAMPAIGN ORCHESTRATION INTERFACE**

```markdown
@workspace Create a sophisticated campaign management and orchestration interface for omnichannel customer engagement:

**CAMPAIGN BUILDER COMPONENTS:**

1. **Campaign Creation Wizard**:
   - Multi-step form with validation and progress indicators
   - Campaign type selection (promotional, transactional, behavioral)
   - Target audience segmentation with filters and criteria
   - Channel selection and priority configuration
   - Message template creation and customization
   - Timing and scheduling options with timezone support
   - A/B testing configuration and variants
   - Budget allocation and spend tracking

2. **Visual Campaign Flow Builder**:
   - Drag-and-drop interface for campaign workflow design
   - Node-based editor for complex campaign logic
   - Channel-specific action nodes (email, SMS, voice, etc.)
   - Decision nodes for branching logic and personalization
   - Delay and timing nodes for campaign pacing
   - Integration nodes for CRM and external systems
   - Testing and preview functionality
   - Version control and collaboration features

3. **Template Management System**:
   - Rich text editor for email templates
   - SMS template library with character counting
   - Voice script templates with TTS preview
   - WhatsApp template creation and approval workflow
   - Dynamic content insertion and personalization
   - Template versioning and approval process
   - Multi-language template support
   - Brand compliance validation

**CAMPAIGN MONITORING & ANALYTICS:**

1. **Real-time Campaign Dashboard**:
   - Live campaign performance metrics and KPIs
   - Channel-specific engagement tracking
   - Real-time audience reach and delivery status
   - Response rate monitoring across channels
   - Conversion tracking and attribution
   - Budget utilization and cost analysis
   - Geographic performance mapping
   - Time-based performance analysis

2. **Advanced Campaign Analytics**:
   - Funnel analysis for customer journey tracking
   - Cohort analysis for long-term impact assessment
   - A/B test results with statistical significance
   - Predictive performance modeling
   - Customer lifetime value impact
   - Cross-channel attribution modeling
   - ROI calculation and optimization recommendations
   - Competitive benchmarking analysis

**OMNICHANNEL ORCHESTRATION:**

1. **Channel Coordination**:
   - Intelligent send-time optimization per channel
   - Cross-channel message frequency capping
   - Channel fallback and escalation rules
   - Customer preference-based routing
   - Dynamic channel selection based on engagement
   - Unified customer experience across touchpoints
   - Context preservation between channels
   - Channel-specific optimization algorithms

2. **Automation & AI Features**:
   - Machine learning-powered send time optimization
   - Dynamic content personalization based on behavior
   - Automated campaign optimization and adjustments
   - Predictive customer journey mapping
   - Intelligent audience expansion
   - Automated A/B test winner selection
   - Smart budget reallocation based on performance
   - AI-generated campaign insights and recommendations

**INTEGRATION CAPABILITIES:**

1. **Data Sources**:
   - CRM integration for customer data synchronization
   - E-commerce platform integration for behavioral data
   - Social media platform connections
   - Web analytics integration (Google Analytics, etc.)
   - Customer support system integration
   - Payment system integration for transaction data
   - Third-party data enrichment services
   - Real-time event streaming integration

2. **External Systems**:
   - Marketing automation platform connections
   - Email service provider integrations
   - SMS gateway provider connections
   - Voice and telephony system integration
   - Social media management tools
   - Customer data platform (CDP) integration
   - Business intelligence tool connections
   - Webhook and API endpoint management

**COMPLIANCE & GOVERNANCE:**

1. **Regulatory Compliance**:
   - GDPR compliance features and consent management
   - CAN-SPAM compliance for email campaigns
   - TCPA compliance for SMS and voice campaigns
   - Data retention and deletion policies
   - Audit trail and campaign history logging
   - Privacy preference management
   - Opt-in/opt-out workflow automation
   - Legal review and approval workflows

2. **Quality Assurance**:
   - Campaign testing and preview functionality
   - Content approval workflows
   - Brand guideline compliance checking
   - Spam score analysis for email campaigns
   - Message deliverability testing
   - Performance threshold monitoring
   - Automated quality checks and validations
   - Risk assessment and mitigation

**TECHNICAL SPECIFICATIONS:**

1. **User Interface**:
   - React TypeScript components with modern design
   - Responsive layout for desktop and mobile devices
   - Drag-and-drop functionality with react-dnd
   - Rich text editing with Quill or TinyMCE
   - Data visualization with Chart.js/D3.js
   - Form validation with react-hook-form
   - State management with Redux Toolkit
   - Real-time updates via WebSocket integration

2. **Performance & Scalability**:
   - Lazy loading for large campaign lists
   - Virtual scrolling for performance optimization
   - Caching strategies for frequently accessed data
   - Offline capability with background synchronization
   - Progressive loading for complex workflows
   - Memory optimization for large datasets
   - Error boundaries and fallback components
   - Accessibility compliance (WCAG 2.1 AA)

Generate the complete campaign orchestration interface with all components, workflows, analytics features, and integrations. Include proper TypeScript definitions, responsive styling, comprehensive error handling, and seamless integration with the omnichannel API endpoints.
```

---

## 🤖 **COPILOT PROMPT #7: MOBILE-RESPONSIVE PWA COMPONENTS**

```markdown
@workspace Create a mobile-first Progressive Web App (PWA) version of the omnichannel dashboard optimized for mobile devices and tablets:

**MOBILE PWA REQUIREMENTS:**

1. **Progressive Web App Configuration**:
   - Service worker for offline functionality and caching
   - Web app manifest for native app-like experience
   - Push notification support for real-time alerts
   - Installable app with custom app icon and splash screen
   - Background sync for offline data synchronization
   - App shell architecture for fast loading
   - Responsive design that works across all device sizes
   - Touch-optimized interface with gesture support

2. **Mobile Dashboard Layout**:
   - Collapsible navigation with hamburger menu
   - Tab-based navigation optimized for thumb navigation
   - Swipeable panels for easy navigation between sections
   - Bottom navigation bar for primary actions
   - Pull-to-refresh functionality for data updates
   - Infinite scroll for large data sets
   - Touch-friendly controls with minimum 44px touch targets
   - Context menus with long-press gestures

3. **Mobile-Specific Components**:
   - **MobileDashboardShell**: Main container with mobile navigation
   - **MobileChannelSwitcher**: Horizontal scrolling channel selector
   - **MobileSessionList**: Card-based session list with swipe actions
   - **MobileCustomerPanel**: Collapsible customer information panel
   - **MobileNotificationCenter**: Slide-out notification drawer
   - **MobileQuickActions**: Floating action button with quick options
   - **MobileAnalyticsCards**: Swipeable metric cards
   - **MobileSearchInterface**: Full-screen search with filters

**RESPONSIVE DESIGN FEATURES:**

1. **Adaptive Layouts**:
   - Mobile-first CSS with progressive enhancement
   - Flexible grid systems that adapt to screen size
   - Dynamic font sizing with viewport units
   - Adaptive images with different resolutions
   - Context-aware UI that shows relevant information
   - Orientation-aware layouts for landscape/portrait
   - Safe area support for devices with notches
   - Accessibility improvements for mobile users

2. **Touch Interactions**:
   - Swipe gestures for navigation and actions
   - Pinch-to-zoom for charts and detailed views
   - Long-press context menus for additional options
   - Pull-down refresh for data synchronization
   - Touch and hold for bulk selection mode
   - Drag and drop for organizing dashboard widgets
   - Multi-touch support for advanced interactions
   - Haptic feedback for user confirmation

**OFFLINE FUNCTIONALITY:**

1. **Service Worker Features**:
   - Cache-first strategy for static assets
   - Network-first strategy for dynamic data
   - Background sync for form submissions
   - Offline queue for API requests
   - Push notification handling
   - App update management and notifications
   - Resource caching with version control
   - Fallback pages for offline scenarios

2. **Data Synchronization**:
   - Local storage management for offline data
   - Conflict resolution for simultaneous edits
   - Incremental synchronization for efficiency
   - Priority-based sync for critical operations
   - Data compression for storage optimization
   - Encrypted local storage for sensitive data
   - Auto-sync when connection is restored
   - Manual sync triggers for user control

**MOBILE-OPTIMIZED FEATURES:**

1. **Performance Optimizations**:
   - Lazy loading for images and components
   - Code splitting for reduced bundle size
   - Virtual scrolling for large lists
   - Image compression and WebP format support
   - Critical CSS inlining for faster rendering
   - Preloading of critical resources
   - Memory management for long-running sessions
   - Battery usage optimization

2. **Native-Like Features**:
   - Device camera integration for file uploads
   - GPS location services for location-based features
   - Device contacts integration for customer lookup
   - Biometric authentication support
   - Device vibration for notifications
   - Screen orientation handling
   - Device storage access for file management
   - Share API integration for content sharing

**MOBILE UI COMPONENTS:**

1. **Navigation Components**:
   - **MobileHeader**: Compact header with navigation and actions
   - **MobileTabBar**: Bottom tab navigation with icons and badges
   - **MobileSidebar**: Slide-out navigation drawer
   - **MobileBreadcrumb**: Compact breadcrumb for deep navigation
   - **MobileBackButton**: Context-aware back navigation

2. **Data Display Components**:
   - **MobileDataTable**: Horizontal scrolling table with sticky columns
   - **MobileCardList**: Card-based list with swipe actions
   - **MobileMetricCards**: Compact metric display with trend indicators
   - **MobileChartContainer**: Touch-optimized chart wrapper
   - **MobileExpandablePanel**: Collapsible content sections

3. **Input Components**:
   - **MobileForm**: Touch-optimized form with validation
   - **MobileSearchBar**: Expandable search with voice input
   - **MobileFileUpload**: Camera and file picker integration
   - **MobileDatePicker**: Native date/time picker with shortcuts
   - **MobileMultiSelect**: Touch-friendly multi-selection interface

**INTEGRATION WITH MAIN DASHBOARD:**

1. **Responsive Breakpoints**:
   - Mobile: 0-767px (single column layout)
   - Tablet: 768-1023px (dual column layout)
   - Desktop: 1024px+ (multi-column layout)
   - Large screens: 1440px+ (expanded layout)

2. **Feature Parity**:
   - All desktop features available on mobile
   - Adapted workflows for mobile interaction patterns
   - Context-aware feature presentation
   - Progressive disclosure of advanced features
   - Mobile-specific shortcuts and gestures
   - Optimized performance for mobile hardware

**TECHNICAL SPECIFICATIONS:**

1. **PWA Technologies**:
   - Service Worker API for caching and offline support
   - Web App Manifest for installability
   - Push API and Notification API for real-time alerts
   - Background Sync API for offline operations
   - IndexedDB for local data storage
   - Cache API for resource management
   - Fetch API for network requests
   - Intersection Observer for performance optimization

2. **Mobile Development**:
   - React 18 with Suspense and Concurrent Features
   - TypeScript for type safety and developer experience
   - Tailwind CSS with mobile-first responsive design
   - Framer Motion for smooth animations
   - React Hook Form for efficient form handling
   - React Query for data synchronization
   - Workbox for service worker management
   - Web Vitals monitoring for performance tracking

Generate the complete mobile PWA implementation with all responsive components, service worker configuration, offline functionality, and seamless integration with the existing omnichannel dashboard API.
```

---

## 🤖 **COPILOT PROMPT #8: INTEGRATION & DEPLOYMENT SETUP**

```markdown
@workspace Create a complete integration and deployment setup for the omnichannel dashboard within the existing app.vocelio.com infrastructure:

**PROJECT INTEGRATION REQUIREMENTS:**

1. **Next.js App Router Integration**:
   - Create app/dashboard/omnichannel directory structure
   - Implement nested layouts for dashboard sections
   - Set up dynamic routing for session and customer views
   - Configure middleware for authentication and authorization
   - Implement server-side rendering for SEO optimization
   - Set up API routes for backend proxy and data transformation
   - Configure error boundaries and 404 pages
   - Implement loading UI and streaming components

2. **State Management Integration**:
   - Redux Toolkit store configuration with existing app state
   - RTK Query integration for API caching and synchronization
   - Persist omnichannel state with redux-persist
   - Cross-component state sharing with React Context
   - Optimistic updates for better user experience
   - State normalization for complex data structures
   - Middleware for logging and debugging
   - DevTools integration for development

3. **Authentication & Security**:
   - Integration with existing app.vocelio.com authentication system
   - Role-based access control for omnichannel features
   - JWT token management and refresh logic
   - API request authentication headers
   - Secure WebSocket connections with authentication
   - CSRF protection for form submissions
   - Rate limiting for API requests
   - Data encryption for sensitive information

**DEPLOYMENT CONFIGURATION:**

1. **Environment Setup**:
```env
# Production Environment Variables
NEXT_PUBLIC_OMNICHANNEL_API_URL=https://omnichannel-hub-313373223340.us-central1.run.app
NEXT_PUBLIC_OMNICHANNEL_WS_URL=wss://omnichannel-hub-313373223340.us-central1.run.app/ws
NEXT_PUBLIC_OMNICHANNEL_API_KEY=${OMNICHANNEL_API_KEY}
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Development Environment Variables  
NEXT_PUBLIC_OMNICHANNEL_API_URL=http://localhost:8080
NEXT_PUBLIC_OMNICHANNEL_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_OMNICHANNEL_API_KEY=dev_api_key
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

2. **Build Configuration**:
   - Webpack configuration for optimal bundling
   - Code splitting for omnichannel modules
   - Tree shaking for unused code elimination
   - Bundle analysis and optimization
   - Service worker generation with Workbox
   - Static asset optimization and CDN integration
   - Source map generation for debugging
   - Performance budgets and monitoring

3. **Docker Configuration**:
```dockerfile
# Multi-stage Dockerfile for production deployment
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

**MONITORING & ANALYTICS:**

1. **Performance Monitoring**:
   - Web Vitals tracking with Core Web Vitals
   - Real User Monitoring (RUM) with New Relic or DataDog
   - Error tracking with Sentry integration
   - API performance monitoring and alerting
   - WebSocket connection monitoring
   - User session recording and analysis
   - Performance budgets and thresholds
   - Synthetic monitoring for uptime checks

2. **Business Analytics**:
   - Custom event tracking for user interactions
   - Funnel analysis for feature adoption
   - A/B testing framework integration
   - User behavior analytics with Mixpanel/Amplitude
   - Feature flag management with LaunchDarkly
   - Conversion tracking for business metrics
   - Customer satisfaction measurement
   - Usage analytics and reporting dashboard

**TESTING STRATEGY:**

1. **Testing Framework Setup**:
   - Jest configuration for unit testing
   - React Testing Library for component testing
   - Cypress setup for end-to-end testing
   - Playwright for cross-browser testing
   - MSW (Mock Service Worker) for API mocking
   - Testing utilities for Redux and React Query
   - Visual regression testing with Chromatic
   - Accessibility testing with axe-core

2. **Test Coverage Requirements**:
   - Unit tests for all utility functions and hooks
   - Integration tests for API service classes
   - Component tests for UI interactions
   - End-to-end tests for critical user flows
   - Performance tests for load handling
   - Security tests for vulnerability assessment
   - Accessibility tests for WCAG compliance
   - Cross-browser compatibility testing

**CI/CD PIPELINE:**

1. **GitHub Actions Workflow**:
```yaml
name: Deploy Omnichannel Dashboard
on:
  push:
    branches: [main]
    paths: ['app/dashboard/omnichannel/**']

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:omnichannel
      - run: npm run build
      - run: npm run test:e2e:omnichannel
      
      - name: Deploy to Production
        run: |
          docker build -t omnichannel-dashboard .
          docker push ${{ secrets.REGISTRY_URL }}/omnichannel-dashboard:latest
```

2. **Deployment Strategy**:
   - Blue-green deployment for zero downtime
   - Feature flags for gradual rollout
   - Database migrations with rollback capability
   - CDN cache invalidation for static assets
   - Health checks and readiness probes
   - Monitoring and alerting setup
   - Rollback procedures and automation
   - Documentation and runbook updates

**DOCUMENTATION & MAINTENANCE:**

1. **Developer Documentation**:
   - API documentation with OpenAPI/Swagger
   - Component documentation with Storybook
   - Architecture decision records (ADRs)
   - Setup and installation guides
   - Contributing guidelines and code standards
   - Troubleshooting and FAQ sections
   - Performance optimization guides
   - Security best practices documentation

2. **Operational Procedures**:
   - Deployment checklists and procedures
   - Monitoring and alerting runbooks
   - Incident response procedures
   - Backup and recovery processes
   - Performance tuning guidelines
   - Security audit procedures
   - Capacity planning documentation
   - Disaster recovery plans

**MIGRATION STRATEGY:**

1. **Phased Rollout Plan**:
   - Phase 1: Internal testing with limited users
   - Phase 2: Beta testing with select customers
   - Phase 3: Gradual rollout to all users
   - Phase 4: Feature enhancement and optimization
   - Rollback procedures at each phase
   - Success criteria and monitoring metrics
   - User feedback collection and analysis
   - Performance impact assessment

2. **Data Migration**:
   - Existing data export and transformation
   - Schema migration and validation
   - Data integrity checks and verification
   - Performance impact assessment
   - Rollback procedures for data issues
   - User notification and communication
   - Training and support documentation
   - Post-migration monitoring and optimization

Generate the complete integration and deployment setup with all configuration files, documentation, testing strategies, and deployment procedures for seamlessly integrating the omnichannel dashboard into the existing app.vocelio.com platform.
```

---

This comprehensive collection of GitHub Copilot prompts will guide you through building a complete, enterprise-grade omnichannel dashboard integration for your https://app.vocelio.com platform! 🚀

Each prompt is designed to generate production-ready code with proper TypeScript definitions, responsive design, real-time functionality, and seamless integration with your existing infrastructure.

*GitHub Copilot Prompts | Omnichannel Hub Integration | September 9, 2025*
