// Flow Migration and Version Management
import { NodeTypeConfig } from './flowSchemas.js';

export class FlowMigration {
  static currentVersion = '2.0.0';

  static migrateFlow(flow, targetVersion = this.currentVersion) {
    if (!flow.version) {
      // Migrate from legacy format
      return this.migrateLegacyFlow(flow);
    }

    const version = flow.version;
    let migratedFlow = { ...flow };

    if (this.compareVersions(version, '2.0.0') < 0) {
      migratedFlow = this.migrateTo2_0_0(migratedFlow);
    }

    return {
      ...migratedFlow,
      version: targetVersion
    };
  }

  static migrateLegacyFlow(flow) {
    return {
      version: '2.0.0',
      name: flow.name || 'Migrated Flow',
      description: flow.description || 'Migrated from legacy format',
      nodes: this.migrateLegacyNodes(flow.nodes || []),
      edges: this.migrateLegacyEdges(flow.edges || []),
      settings: {
        timeout: 30,
        retries: 3,
        fallback: 'Sorry, I didn\'t understand that.',
        ...flow.settings
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migratedFrom: 'legacy'
      }
    };
  }

  static migrateLegacyNodes(nodes) {
    return nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: {
        ...node.data,
        ...this.getDefaultPropsForType(node.type)
      }
    }));
  }

  static migrateLegacyEdges(edges) {
    return edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null,
      type: edge.type || 'default',
      data: edge.data || {}
    }));
  }

  static migrateTo2_0_0(flow) {
    return {
      ...flow,
      version: '2.0.0',
      nodes: flow.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          ...this.getDefaultPropsForType(node.type)
        }
      })),
      metadata: {
        ...flow.metadata,
        updatedAt: new Date().toISOString(),
        migratedTo: '2.0.0'
      }
    };
  }

  static getDefaultPropsForType(type) {
    return NodeTypeConfig[type]?.defaultProps || {};
  }

  static compareVersions(a, b) {
    const parseVersion = version => version.split('.').map(Number);
    const versionA = parseVersion(a);
    const versionB = parseVersion(b);

    for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
      const partA = versionA[i] || 0;
      const partB = versionB[i] || 0;
      if (partA < partB) return -1;
      if (partA > partB) return 1;
    }
    return 0;
  }

  static validateFlow(flow) {
    const errors = [];
    
    if (!flow.nodes || !Array.isArray(flow.nodes)) {
      errors.push('Flow must have a nodes array');
    }
    
    if (!flow.edges || !Array.isArray(flow.edges)) {
      errors.push('Flow must have an edges array');
    }

    // Validate node types
    flow.nodes?.forEach(node => {
      if (!NodeTypeConfig[node.type]) {
        errors.push(`Unknown node type: ${node.type}`);
      }
    });

    // Validate edge connections
    flow.edges?.forEach(edge => {
      const sourceExists = flow.nodes?.some(n => n.id === edge.source);
      const targetExists = flow.nodes?.some(n => n.id === edge.target);
      
      if (!sourceExists) {
        errors.push(`Edge ${edge.id} has invalid source: ${edge.source}`);
      }
      if (!targetExists) {
        errors.push(`Edge ${edge.id} has invalid target: ${edge.target}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Additional utility functions
export const migrateLegacyFlow = (legacyData) => {
  return FlowMigration.migrateLegacyFlow(legacyData);
};

export const autoLayoutNodes = (nodes, edges) => {
  // Simple auto-layout algorithm
  const layoutedNodes = nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % 4) * 250 + 50,
      y: Math.floor(index / 4) * 150 + 50
    }
  }));
  
  return layoutedNodes;
};

export const exportFlowToJSON = (flow) => {
  return JSON.stringify({
    ...flow,
    exportedAt: new Date().toISOString(),
    version: FlowMigration.currentVersion
  }, null, 2);
};

export default FlowMigration;
