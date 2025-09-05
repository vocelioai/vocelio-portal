// Global Performance Manager for handling thousands of flow nodes efficiently
class FlowPerformanceManager {
  constructor() {
    this.animationFrame = null;
    this.observers = new Set();
    this.isRunning = false;
    
    // Throttle updates to 30fps for better performance
    this.frameRate = 33; // ~30fps
    this.lastUpdate = 0;
    
    // Performance monitoring
    this.nodeCount = 0;
    this.maxNodes = 50000; // Support up to 50k nodes
    
    // Animation batching
    this.animationQueue = new Map();
    
    this.start();
  }

  // Register a node for performance monitoring
  registerNode(nodeId, component) {
    this.nodeCount++;
    
    if (this.nodeCount > this.maxNodes) {
      console.warn(`Performance warning: ${this.nodeCount} nodes registered. Consider virtualization.`);
    }
    
    // Add to observers if it needs animations
    if (component.needsAnimation) {
      this.observers.add({ id: nodeId, component });
    }
  }

  // Unregister a node when it unmounts
  unregisterNode(nodeId) {
    this.nodeCount--;
    this.observers.forEach(observer => {
      if (observer.id === nodeId) {
        this.observers.delete(observer);
      }
    });
    this.animationQueue.delete(nodeId);
  }

  // Batch animation updates for better performance
  queueAnimation(nodeId, animationType, duration = 1000) {
    this.animationQueue.set(nodeId, {
      type: animationType,
      startTime: Date.now(),
      duration
    });
  }

  // Central animation loop - runs once for all nodes
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const loop = (timestamp) => {
      // Throttle to maintain consistent frame rate
      if (timestamp - this.lastUpdate >= this.frameRate) {
        this.updateAnimations(timestamp);
        this.lastUpdate = timestamp;
      }
      
      this.animationFrame = requestAnimationFrame(loop);
    };
    
    this.animationFrame = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.isRunning = false;
  }

  updateAnimations(timestamp) {
    // Process animation queue efficiently
    for (const [nodeId, animation] of this.animationQueue) {
      const elapsed = timestamp - animation.startTime;
      
      if (elapsed >= animation.duration) {
        // Animation complete
        this.animationQueue.delete(nodeId);
      }
    }
    
    // Update observers with current state
    this.observers.forEach(observer => {
      if (observer.component.updateAnimation) {
        observer.component.updateAnimation(timestamp);
      }
    });
  }

  // Performance metrics
  getMetrics() {
    return {
      nodeCount: this.nodeCount,
      animationsRunning: this.animationQueue.size,
      observersActive: this.observers.size,
      memoryUsage: this.estimateMemoryUsage(),
      performance: this.getPerformanceRating()
    };
  }

  estimateMemoryUsage() {
    // Rough estimate: each node ~2KB, animations ~0.5KB
    const nodeMemory = this.nodeCount * 2; // KB
    const animationMemory = this.animationQueue.size * 0.5; // KB
    return {
      nodes: `${nodeMemory}KB`,
      animations: `${animationMemory}KB`,
      total: `${nodeMemory + animationMemory}KB`
    };
  }

  getPerformanceRating() {
    if (this.nodeCount < 1000) return 'Excellent';
    if (this.nodeCount < 5000) return 'Good';
    if (this.nodeCount < 10000) return 'Fair';
    if (this.nodeCount < 25000) return 'Poor - Consider Virtualization';
    return 'Critical - Requires Optimization';
  }

  // Enable/disable animations based on performance
  shouldAnimate() {
    return this.nodeCount < 10000; // Disable animations above 10k nodes
  }

  // Cleanup method
  destroy() {
    this.stop();
    this.observers.clear();
    this.animationQueue.clear();
    this.nodeCount = 0;
  }
}

// Global singleton instance
const performanceManager = new FlowPerformanceManager();

// React hook for using performance manager
export const useFlowPerformance = (nodeId, needsAnimation = false) => {
  const [metrics, setMetrics] = React.useState(null);
  
  React.useEffect(() => {
    performanceManager.registerNode(nodeId, { needsAnimation });
    
    return () => {
      performanceManager.unregisterNode(nodeId);
    };
  }, [nodeId, needsAnimation]);

  const getMetrics = React.useCallback(() => {
    return performanceManager.getMetrics();
  }, []);

  const queueAnimation = React.useCallback((type, duration) => {
    if (performanceManager.shouldAnimate()) {
      performanceManager.queueAnimation(nodeId, type, duration);
    }
  }, [nodeId]);

  return {
    queueAnimation,
    getMetrics,
    shouldAnimate: performanceManager.shouldAnimate(),
    performanceRating: performanceManager.getPerformanceRating()
  };
};

export default performanceManager;
