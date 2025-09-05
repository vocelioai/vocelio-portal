// Flow Schema Configuration
export const NodeTypeConfig = {
  'Large Text': {
    icon: 'MessageSquare',
    color: '#3B82F6',
    category: 'input',
    description: 'Generate or process large text content',
    defaultProps: {
      prompt: 'Enter your prompt here...',
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  'Small Text': {
    icon: 'Type',
    color: '#10B981',
    category: 'input',
    description: 'Generate short text responses',
    defaultProps: {
      prompt: 'Enter your prompt here...',
      temperature: 0.5,
      maxTokens: 200
    }
  },
  'Say': {
    icon: 'Volume2',
    color: '#F59E0B',
    category: 'output',
    description: 'Text-to-speech node',
    defaultProps: {
      message: 'Hello, how can I help you today?',
      voice: 'default',
      speed: 1.0
    }
  },
  'Collect': {
    icon: 'Mic',
    color: '#8B5CF6',
    category: 'input',
    description: 'Collect user input',
    defaultProps: {
      prompt: 'Please tell me...',
      timeout: 5,
      retries: 3
    }
  },
  'Decision': {
    icon: 'GitBranch',
    color: '#EF4444',
    category: 'logic',
    description: 'Branch flow based on conditions',
    defaultProps: {
      variable: 'user_input',
      conditions: []
    }
  },
  'End': {
    icon: 'Square',
    color: '#6B7280',
    category: 'control',
    description: 'End the conversation',
    defaultProps: {
      message: 'Thank you for using our service!',
      type: 'hangup'
    }
  }
};

export const FlowSchemas = {
  version: '2.0.0',
  nodeTypes: Object.keys(NodeTypeConfig),
  supportedOperators: ['equals', 'contains', 'greater_than', 'less_than', 'not_equals'],
  defaultFlow: {
    name: 'New Flow',
    description: 'A new voice flow',
    nodes: [],
    edges: [],
    settings: {
      timeout: 30,
      retries: 3,
      fallback: 'Sorry, I didn\'t understand that.'
    }
  }
};

export default NodeTypeConfig;
