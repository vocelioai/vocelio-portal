/**
 * Advanced Context Intelligence - AI-powered features for context management
 * Includes context inheritance, AI template generation, and performance analytics
 */

class ContextIntelligence {
  constructor(contextAPI) {
    this.contextAPI = contextAPI;
    this.aiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.aiApiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
  }

  // =============================================================================
  // 🧬 CONTEXT INHERITANCE ENGINE
  // =============================================================================

  /**
   * Build inheritance hierarchy: Global → Department → Workflow → Node
   */
  buildContextHierarchy(globalPrompt, departmentContext, workflowContext, nodeContext) {
    const hierarchy = {
      global: globalPrompt || '',
      department: departmentContext || '',
      workflow: workflowContext || '',
      node: nodeContext || ''
    };

    return this.mergeContextHierarchy(hierarchy);
  }

  /**
   * Intelligently merge context layers with conflict resolution
   */
  mergeContextHierarchy(hierarchy) {
    const sections = {
      identity: [],
      guidelines: [],
      rules: [],
      examples: [],
      variables: []
    };

    // Parse each level and categorize content
    Object.entries(hierarchy).forEach(([level, content]) => {
      if (!content?.trim()) return;

      const parsed = this.parseContextContent(content, level);
      Object.keys(sections).forEach(section => {
        if (parsed[section]?.length > 0) {
          sections[section].push(...parsed[section]);
        }
      });
    });

    // Build final merged context
    const merged = this.buildMergedContext(sections);
    
    return {
      mergedContext: merged,
      hierarchy,
      sections,
      stats: this.analyzeContextComplexity(merged)
    };
  }

  parseContextContent(content, level) {
    const sections = {
      identity: [],
      guidelines: [],
      rules: [],
      examples: [],
      variables: []
    };

    // Smart content classification using patterns
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Identity markers
      if (this.matchesPattern(trimmed, ['you are', 'your role', 'identity', 'represent'])) {
        sections.identity.push({ content: trimmed, level, priority: this.getLevelPriority(level) });
      }
      // Guidelines markers
      else if (this.matchesPattern(trimmed, ['guideline', 'approach', 'style', 'tone'])) {
        sections.guidelines.push({ content: trimmed, level, priority: this.getLevelPriority(level) });
      }
      // Rules markers
      else if (this.matchesPattern(trimmed, ['must', 'never', 'always', 'required', 'forbidden'])) {
        sections.rules.push({ content: trimmed, level, priority: this.getLevelPriority(level) });
      }
      // Examples markers
      else if (this.matchesPattern(trimmed, ['example', 'for instance', 'such as', 'like this'])) {
        sections.examples.push({ content: trimmed, level, priority: this.getLevelPriority(level) });
      }
      // Variable markers
      else if (trimmed.includes('{{') && trimmed.includes('}}')) {
        sections.variables.push({ content: trimmed, level, priority: this.getLevelPriority(level) });
      }
      // Default to guidelines
      else if (trimmed.length > 10) {
        sections.guidelines.push({ content: trimmed, level, priority: this.getLevelPriority(level) });
      }
    });

    return sections;
  }

  matchesPattern(text, patterns) {
    return patterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  getLevelPriority(level) {
    const priorities = { global: 1, department: 2, workflow: 3, node: 4 };
    return priorities[level] || 1;
  }

  buildMergedContext(sections) {
    let merged = '';

    // Identity section (highest priority wins)
    if (sections.identity.length > 0) {
      const highestPriorityIdentity = sections.identity.sort((a, b) => b.priority - a.priority)[0];
      merged += `## IDENTITY\n${highestPriorityIdentity.content}\n\n`;
    }

    // Guidelines (merge all, higher priority first)
    if (sections.guidelines.length > 0) {
      merged += `## GUIDELINES\n`;
      const sortedGuidelines = sections.guidelines.sort((a, b) => b.priority - a.priority);
      sortedGuidelines.forEach(guideline => {
        merged += `- ${guideline.content}\n`;
      });
      merged += '\n';
    }

    // Rules (merge all, maintaining hierarchy)
    if (sections.rules.length > 0) {
      merged += `## RULES\n`;
      const sortedRules = sections.rules.sort((a, b) => b.priority - a.priority);
      sortedRules.forEach(rule => {
        merged += `- ${rule.content}\n`;
      });
      merged += '\n';
    }

    // Examples (merge relevant ones)
    if (sections.examples.length > 0) {
      merged += `## EXAMPLES\n`;
      sections.examples.slice(0, 3).forEach(example => {
        merged += `${example.content}\n`;
      });
      merged += '\n';
    }

    // Variables (collect all unique)
    if (sections.variables.length > 0) {
      const uniqueVars = this.extractUniqueVariables(sections.variables);
      if (uniqueVars.length > 0) {
        merged += `## AVAILABLE VARIABLES\n`;
        uniqueVars.forEach(variable => {
          merged += `- ${variable}\n`;
        });
      }
    }

    return merged.trim();
  }

  extractUniqueVariables(variableItems) {
    const variables = new Set();
    variableItems.forEach(item => {
      const matches = item.content.match(/\{\{([^}]+)\}\}/g);
      if (matches) {
        matches.forEach(match => variables.add(match));
      }
    });
    return Array.from(variables);
  }

  // =============================================================================
  // 🤖 AI-POWERED TEMPLATE GENERATION
  // =============================================================================

  async generateContextTemplate(requirements) {
    const { industry, role, tone, specific_needs, target_audience } = requirements;

    const prompt = this.buildTemplateGenerationPrompt({
      industry,
      role,
      tone,
      specific_needs,
      target_audience
    });

    try {
      const response = await this.callAI(prompt, {
        maxTokens: 800,
        temperature: 0.7
      });

      const generatedTemplate = this.parseAIResponse(response);
      
      return {
        success: true,
        template: {
          id: `ai-generated-${Date.now()}`,
          name: `${industry} ${role}`,
          category: 'ai-generated',
          description: `AI-generated template for ${role} in ${industry}`,
          context: generatedTemplate.context,
          tags: [industry.toLowerCase(), role.toLowerCase(), tone.toLowerCase(), 'ai-generated'],
          aiGenerated: true,
          generationParams: requirements,
          createdAt: new Date().toISOString(),
          quality_score: generatedTemplate.quality_score
        }
      };
    } catch (error) {
      console.error('AI template generation failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackTemplate(requirements)
      };
    }
  }

  buildTemplateGenerationPrompt(requirements) {
    return `You are an expert AI conversation designer. Create a professional context template for an AI agent.

Requirements:
- Industry: ${requirements.industry}
- Role: ${requirements.role}
- Tone: ${requirements.tone}
- Target Audience: ${requirements.target_audience}
- Specific Needs: ${requirements.specific_needs}

Create a context that includes:
1. Clear agent identity and role
2. Key guidelines for behavior and communication
3. Industry-specific requirements and compliance notes
4. Tone and personality instructions
5. Relevant examples or scenarios

The context should be 200-400 words, professional, and immediately usable.

Format as a ready-to-use context (no extra explanations):`;
  }

  async optimizeExistingContext(context, optimization_goals) {
    const prompt = `You are an expert AI context optimizer. Improve this existing context to better achieve the specified goals.

Current Context:
${context}

Optimization Goals:
${optimization_goals.join(', ')}

Provide an optimized version that:
1. Maintains the core identity and purpose
2. Improves clarity and effectiveness
3. Addresses the optimization goals
4. Keeps the same approximate length
5. Enhances conversion potential

Return only the optimized context (no explanations):`;

    try {
      const response = await this.callAI(prompt, {
        maxTokens: 600,
        temperature: 0.5
      });

      return {
        success: true,
        optimized_context: response.trim(),
        original_context: context,
        improvements_made: await this.analyzeImprovements(context, response.trim())
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        original_context: context
      };
    }
  }

  async analyzeImprovements(original, optimized) {
    const improvements = [];
    
    // Basic analysis
    if (optimized.length > original.length) {
      improvements.push('Added more detailed guidance');
    }
    if (optimized.length < original.length) {
      improvements.push('Simplified and clarified');
    }
    
    // Check for common improvements
    if (optimized.includes('specific') && !original.includes('specific')) {
      improvements.push('Added specific instructions');
    }
    if (optimized.match(/\b(must|should|will)\b/gi)?.length > original.match(/\b(must|should|will)\b/gi)?.length) {
      improvements.push('Strengthened directive language');
    }

    return improvements;
  }

  // =============================================================================
  // 📊 PERFORMANCE ANALYTICS
  // =============================================================================

  analyzeContextPerformance(contexts, usageData) {
    return {
      overview: this.generatePerformanceOverview(contexts, usageData),
      topPerformers: this.identifyTopPerformingContexts(contexts, usageData),
      improvements: this.suggestContextImprovements(contexts, usageData),
      trends: this.analyzeUsageTrends(usageData),
      insights: this.generateActionableInsights(contexts, usageData)
    };
  }

  generatePerformanceOverview(contexts, usageData) {
    const totalContexts = Object.keys(contexts).length;
    const totalUsage = usageData.reduce((sum, item) => sum + (item.usage_count || 0), 0);
    const avgConversionRate = usageData.reduce((sum, item) => sum + (item.conversion_rate || 0), 0) / usageData.length;

    return {
      total_contexts: totalContexts,
      total_usage: totalUsage,
      average_conversion_rate: avgConversionRate,
      active_contexts: usageData.filter(item => item.usage_count > 0).length,
      last_updated: new Date().toISOString()
    };
  }

  identifyTopPerformingContexts(contexts, usageData) {
    return usageData
      .sort((a, b) => (b.conversion_rate || 0) - (a.conversion_rate || 0))
      .slice(0, 5)
      .map(item => ({
        context_id: item.context_id,
        context_name: contexts[item.context_id]?.name || 'Unknown',
        conversion_rate: item.conversion_rate || 0,
        usage_count: item.usage_count || 0,
        success_factors: this.identifySuccessFactors(contexts[item.context_id])
      }));
  }

  identifySuccessFactors(context) {
    const factors = [];
    if (!context?.context) return factors;

    const content = context.context.toLowerCase();
    
    if (content.includes('specific') || content.includes('precise')) {
      factors.push('Specific instructions');
    }
    if (content.includes('example') || content.includes('for instance')) {
      factors.push('Includes examples');
    }
    if (content.match(/\b(must|should|will)\b/g)?.length > 3) {
      factors.push('Strong directive language');
    }
    if (content.length > 300 && content.length < 600) {
      factors.push('Optimal length');
    }

    return factors;
  }

  suggestContextImprovements(contexts, usageData) {
    const lowPerformers = usageData
      .filter(item => (item.conversion_rate || 0) < 0.3)
      .map(item => ({
        context_id: item.context_id,
        context_name: contexts[item.context_id]?.name || 'Unknown',
        suggestions: this.generateImprovementSuggestions(contexts[item.context_id])
      }));

    return lowPerformers;
  }

  generateImprovementSuggestions(context) {
    const suggestions = [];
    if (!context?.context) return ['Context content is missing'];

    const content = context.context;
    
    if (content.length < 150) {
      suggestions.push('Add more detailed guidance and examples');
    }
    if (content.length > 800) {
      suggestions.push('Simplify and focus on key points');
    }
    if (!content.includes('example') && !content.includes('for instance')) {
      suggestions.push('Include specific examples or scenarios');
    }
    if (!content.match(/\b(must|should|will)\b/gi)) {
      suggestions.push('Add clearer directives and expectations');
    }
    if (!content.includes('{{')) {
      suggestions.push('Consider adding dynamic variables for personalization');
    }

    return suggestions.length > 0 ? suggestions : ['Context appears well-structured'];
  }

  analyzeUsageTrends(usageData) {
    // Simple trend analysis (would be more sophisticated with time-series data)
    const trends = {
      most_active_period: 'Business hours',
      growing_categories: ['sales', 'support'],
      declining_categories: ['general'],
      seasonal_patterns: 'Increased usage during business quarters'
    };

    return trends;
  }

  generateActionableInsights(contexts, usageData) {
    const insights = [];

    // High-level insights based on performance data
    const highPerformers = usageData.filter(item => (item.conversion_rate || 0) > 0.7);
    const lowPerformers = usageData.filter(item => (item.conversion_rate || 0) < 0.3);

    if (highPerformers.length > 0) {
      insights.push({
        type: 'success',
        title: 'High-Converting Templates Identified',
        description: `${highPerformers.length} templates show >70% conversion rates. Consider using these as templates for new contexts.`,
        action: 'Review top performers and apply similar patterns to underperforming contexts'
      });
    }

    if (lowPerformers.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Underperforming Contexts Need Attention',
        description: `${lowPerformers.length} contexts have <30% conversion rates and may need optimization.`,
        action: 'Use AI optimization to improve these contexts or replace with better alternatives'
      });
    }

    // Context length insights
    const avgLength = Object.values(contexts).reduce((sum, ctx) => sum + (ctx.context?.length || 0), 0) / Object.keys(contexts).length;
    if (avgLength > 600) {
      insights.push({
        type: 'optimization',
        title: 'Context Length Optimization Opportunity',
        description: 'Average context length is quite long. Shorter, focused contexts often perform better.',
        action: 'Consider breaking down complex contexts into workflow-specific sections'
      });
    }

    return insights;
  }

  // =============================================================================
  // 🔧 UTILITY METHODS
  // =============================================================================

  analyzeContextComplexity(context) {
    return {
      word_count: context.split(' ').length,
      character_count: context.length,
      sentence_count: context.split('.').length,
      variable_count: (context.match(/\{\{[^}]+\}\}/g) || []).length,
      complexity_score: this.calculateComplexityScore(context)
    };
  }

  calculateComplexityScore(context) {
    const words = context.split(' ').length;
    const sentences = context.split('.').length;
    const avgWordsPerSentence = words / sentences;
    
    // Simple complexity score (0-100)
    let score = 50; // baseline
    
    if (avgWordsPerSentence > 20) score += 20; // long sentences
    if (avgWordsPerSentence < 10) score -= 10; // concise
    if (words > 500) score += 15; // very long
    if (words < 100) score -= 15; // very short
    
    return Math.max(0, Math.min(100, score));
  }

  async callAI(prompt, options = {}) {
    const { maxTokens = 500, temperature = 0.7 } = options;

    const response = await fetch(`${this.aiApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.aiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      })
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  parseAIResponse(response) {
    return {
      context: response.trim(),
      quality_score: Math.floor(Math.random() * 20) + 80 // Mock quality score
    };
  }

  getFallbackTemplate(requirements) {
    return {
      id: `fallback-${Date.now()}`,
      name: `${requirements.industry} ${requirements.role}`,
      category: 'fallback',
      description: 'Fallback template when AI generation fails',
      context: `You are a professional ${requirements.role} working in the ${requirements.industry} industry. Your communication style is ${requirements.tone}. Focus on helping ${requirements.target_audience} with their needs while maintaining professionalism and expertise.`,
      tags: [requirements.industry.toLowerCase(), requirements.role.toLowerCase()],
      isBuiltIn: false
    };
  }
}

// Export singleton instance
export const contextIntelligence = new ContextIntelligence();
export default contextIntelligence;
