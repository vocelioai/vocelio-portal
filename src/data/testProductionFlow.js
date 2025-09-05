// Test Flow for Production Verification
export const testProductionFlow = {
  id: 'test_production_flow_001',
  name: 'Customer Service Test Flow',
  description: 'Simple test flow to verify production deployment',
  version: '1.0.0',
  nodes: [
    {
      id: 'start',
      type: 'say',
      position: { x: 100, y: 100 },
      data: {
        label: 'Welcome Message',
        message: 'Hello! Thank you for calling Vocelio AI. This is our automated customer service system.',
        voice: 'en-US-AriaNeural',
        next: 'collect_reason'
      }
    },
    {
      id: 'collect_reason',
      type: 'collect',
      position: { x: 100, y: 200 },
      data: {
        label: 'Collect Reason',
        prompt: 'How can we help you today? You can say Sales, Support, or Billing.',
        timeout: 10,
        maxDigits: 1,
        next: 'route_decision'
      }
    },
    {
      id: 'route_decision',
      type: 'decision',
      position: { x: 100, y: 300 },
      data: {
        label: 'Route Decision',
        conditions: [
          { input: 'sales', output: 'transfer_sales' },
          { input: 'support', output: 'transfer_support' },
          { input: 'billing', output: 'transfer_billing' }
        ],
        default: 'say_goodbye'
      }
    },
    {
      id: 'transfer_sales',
      type: 'transfer',
      position: { x: 50, y: 400 },
      data: {
        label: 'Transfer to Sales',
        message: 'Transferring you to our sales team. Please hold.',
        transferTo: '+1234567890', // Sales department number
        next: 'end'
      }
    },
    {
      id: 'transfer_support',
      type: 'transfer',
      position: { x: 150, y: 400 },
      data: {
        label: 'Transfer to Support',
        message: 'Connecting you with technical support. One moment please.',
        transferTo: '+1234567891', // Support department number
        next: 'end'
      }
    },
    {
      id: 'transfer_billing',
      type: 'transfer',
      position: { x: 250, y: 400 },
      data: {
        label: 'Transfer to Billing',
        message: 'Routing you to our billing department.',
        transferTo: '+1234567892', // Billing department number
        next: 'end'
      }
    },
    {
      id: 'say_goodbye',
      type: 'say',
      position: { x: 350, y: 350 },
      data: {
        label: 'Default Response',
        message: 'I didn\'t understand that. Please call back and try again. Thank you!',
        next: 'end'
      }
    },
    {
      id: 'end',
      type: 'end',
      position: { x: 200, y: 500 },
      data: {
        label: 'End Call',
        message: 'Thank you for calling Vocelio AI. Have a great day!',
        hangup: true
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'collect_reason' },
    { id: 'e2', source: 'collect_reason', target: 'route_decision' },
    { id: 'e3', source: 'route_decision', target: 'transfer_sales' },
    { id: 'e4', source: 'route_decision', target: 'transfer_support' },
    { id: 'e5', source: 'route_decision', target: 'transfer_billing' },
    { id: 'e6', source: 'route_decision', target: 'say_goodbye' },
    { id: 'e7', source: 'transfer_sales', target: 'end' },
    { id: 'e8', source: 'transfer_support', target: 'end' },
    { id: 'e9', source: 'transfer_billing', target: 'end' },
    { id: 'e10', source: 'say_goodbye', target: 'end' }
  ],
  metadata: {
    created_by: 'Vocelio System',
    created_at: new Date().toISOString(),
    expected_duration: '2-5 minutes',
    departments: ['sales', 'support', 'billing'],
    voice_tier: 'regular', // Uses Azure TTS at $0.08/minute
    estimated_cost_per_call: '$0.40' // 5 minutes * $0.08
  }
};

// Export for use in testing
export default testProductionFlow;
