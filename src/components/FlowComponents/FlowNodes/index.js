// Flow Nodes Index - Export all node components
import SayNode from './SayNode';
import CollectNode from './CollectNode';
import DecisionNode from './DecisionNode';
import EndNode from './EndNode';

// Export individual components
export { SayNode, CollectNode, DecisionNode, EndNode };

// Node type definitions for ReactFlow
export const nodeTypes = {
  say: SayNode,
  collect: CollectNode,
  decision: DecisionNode,
  end: EndNode
};
