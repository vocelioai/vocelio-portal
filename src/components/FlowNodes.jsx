// ReactFlow Node Types Export
import SayNode from './FlowComponents/FlowNodes/SayNode.jsx';
import CollectNode from './FlowComponents/FlowNodes/CollectNode.jsx';
import DecisionNode from './FlowComponents/FlowNodes/DecisionNode.jsx';
import EndNode from './FlowComponents/FlowNodes/EndNode.jsx';

// Export node types for ReactFlow
export const nodeTypes = {
  'Say': SayNode,
  'Collect': CollectNode,  
  'Decision': DecisionNode,
  'End': EndNode,
  'Large Text': SayNode, // Reuse SayNode for Large Text
  'Small Text': SayNode, // Reuse SayNode for Small Text
};

export default nodeTypes;
