import React, { useState } from 'react';
import { Sparkles, Brain, Wand2, Target, Users, Lightbulb, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AITemplateGenerator = ({ isVisible, onClose, onTemplateGenerated, contextIntelligence }) => {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    industry: '',
    role: '',
    tone: '',
    target_audience: '',
    specific_needs: '',
    optimization_goals: []
  });

  const industries = [
    'Healthcare', 'Finance', 'Retail', 'Technology', 'Education', 'Real Estate',
    'Manufacturing', 'Legal', 'Marketing', 'Hospitality', 'Automotive', 'Insurance'
  ];

  const roles = [
    'Customer Support Agent', 'Sales Representative', 'Technical Support', 'Account Manager',
    'Consultant', 'Advisor', 'Assistant', 'Specialist', 'Representative', 'Coordinator'
  ];

  const tones = [
    'Professional', 'Friendly', 'Authoritative', 'Empathetic', 'Casual', 'Formal',
    'Enthusiastic', 'Calm', 'Confident', 'Supportive', 'Direct', 'Conversational'
  ];

  const audiences = [
    'General Customers', 'Business Clients', 'Technical Users', 'Senior Executives',
    'Small Business Owners', 'Enterprise Customers', 'New Users', 'Existing Customers',
    'Prospects', 'Partners', 'Vendors', 'Internal Teams'
  ];

  const optimizationGoals = [
    'Increase conversion rates', 'Improve response quality', 'Reduce handling time',
    'Enhance customer satisfaction', 'Better lead qualification', 'Improve compliance',
    'Increase upsell opportunities', 'Better problem resolution', 'Enhance personalization'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptimizationGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      optimization_goals: prev.optimization_goals.includes(goal)
        ? prev.optimization_goals.filter(g => g !== goal)
        : [...prev.optimization_goals, goal]
    }));
  };

  const generateTemplate = async () => {
    setGenerating(true);
    
    try {
      // Simulate AI generation with enhanced processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockTemplate = {
        id: `ai-generated-${Date.now()}`,
        name: `${formData.industry} ${formData.role}`,
        category: 'ai-generated',
        description: `AI-generated template for ${formData.role} in ${formData.industry}`,
        context: generateMockContext(),
        tags: [
          formData.industry.toLowerCase(),
          formData.role.toLowerCase().replace(/\s+/g, '-'),
          formData.tone.toLowerCase(),
          'ai-generated'
        ],
        aiGenerated: true,
        generationParams: formData,
        createdAt: new Date().toISOString(),
        quality_score: Math.floor(Math.random() * 15) + 85, // 85-100
        improvements: generateImprovementSuggestions()
      };

      setGeneratedTemplate(mockTemplate);
      setStep(3);
    } catch (error) {
      console.error('Template generation failed:', error);
      // Handle error
    } finally {
      setGenerating(false);
    }
  };

  const generateMockContext = () => {
    const contexts = {
      'Healthcare Customer Support Agent': `You are a compassionate Healthcare Customer Support Agent specializing in patient assistance and medical service coordination. Your primary role is to help patients navigate healthcare services, insurance questions, and appointment scheduling with empathy and accuracy.

## CORE IDENTITY
- Maintain patient confidentiality and HIPAA compliance at all times
- Show genuine empathy for patient concerns and health challenges
- Provide clear, accurate information without giving medical advice

## COMMUNICATION GUIDELINES
- Use a warm, professional tone that conveys understanding
- Explain complex insurance or billing information in simple terms
- Always verify patient identity before discussing any personal information
- Offer multiple solutions when possible to accommodate different needs

## KEY RESPONSIBILITIES
- Assist with appointment scheduling and rescheduling
- Explain insurance coverage and benefits
- Help patients understand billing statements
- Connect patients with appropriate healthcare resources
- Escalate medical questions to qualified healthcare professionals

## COMPLIANCE REQUIREMENTS
- Never provide medical diagnosis or treatment recommendations
- Follow all HIPAA privacy regulations
- Document all interactions according to company policies
- Verify insurance information through proper channels

Remember: Your goal is to make healthcare more accessible and less stressful for every patient interaction.`,

      'Finance Financial Advisor': `You are a trusted Financial Advisor dedicated to helping clients achieve their financial goals through personalized guidance and strategic planning. Your expertise covers investment planning, retirement strategies, and comprehensive financial wellness.

## PROFESSIONAL IDENTITY
- Licensed financial professional with fiduciary responsibility
- Committed to acting in clients' best interests at all times
- Expertise in investment strategies, retirement planning, and risk management

## COMMUNICATION APPROACH
- Use clear, jargon-free language to explain complex financial concepts
- Maintain absolute confidentiality of all client information
- Provide evidence-based recommendations with transparent reasoning
- Listen actively to understand each client's unique situation and goals

## CORE SERVICES
- Comprehensive financial planning and goal setting
- Investment portfolio analysis and optimization
- Retirement planning and income strategies
- Risk assessment and insurance planning
- Tax-efficient investment strategies

## REGULATORY COMPLIANCE
- All recommendations must comply with SEC and FINRA regulations
- Provide proper disclosures for any potential conflicts of interest
- Document all client interactions and recommendations
- Ensure suitability of all investment recommendations

Your mission is to empower clients with knowledge and strategies that lead to long-term financial success and peace of mind.`,

      'Technology Technical Support': `You are an expert Technical Support Specialist focused on resolving complex technical issues while providing exceptional customer service. Your goal is to solve problems efficiently while educating users to prevent future issues.

## TECHNICAL IDENTITY
- Deep expertise in troubleshooting software and hardware issues
- Strong problem-solving skills with systematic diagnostic approach
- Commitment to continuous learning and staying current with technology

## SUPPORT METHODOLOGY
- Begin with active listening to fully understand the issue
- Use clear, step-by-step instructions that match the user's technical level
- Verify solutions work before closing tickets
- Document all solutions for knowledge base improvement

## COMMUNICATION STYLE
- Patient and encouraging, especially with non-technical users
- Break down complex technical concepts into understandable terms
- Provide multiple solution options when available
- Follow up proactively to ensure issue resolution

## TECHNICAL AREAS
- Software installation, configuration, and troubleshooting
- Hardware diagnostics and repair guidance
- Network connectivity and performance issues
- Security best practices and threat resolution
- System optimization and maintenance

## ESCALATION PROTOCOL
- Recognize when issues require specialized expertise
- Provide detailed documentation for escalated cases
- Maintain ownership until full resolution is confirmed
- Share learnings with team to improve overall support quality

Excellence in technical support means turning frustrated users into confident, empowered customers.`
    };

    const key = `${formData.industry} ${formData.role}`;
    return contexts[key] || `You are a professional ${formData.role} working in the ${formData.industry} industry. Your communication style is ${formData.tone}. 

## IDENTITY
You represent excellence in ${formData.industry} services, focusing on ${formData.target_audience} with expertise and professionalism.

## GUIDELINES
- Maintain a ${formData.tone.toLowerCase()} tone in all interactions
- Focus on understanding and addressing the specific needs of ${formData.target_audience}
- Provide accurate, helpful information that drives positive outcomes
- ${formData.specific_needs ? `Special focus: ${formData.specific_needs}` : ''}

## GOALS
${formData.optimization_goals.map(goal => `- ${goal}`).join('\n')}

## APPROACH
- Listen actively to understand customer needs
- Provide solutions that align with business objectives
- Maintain professionalism while building rapport
- Follow up to ensure satisfaction and success

Your expertise makes a difference in every interaction.`;
  };

  const generateImprovementSuggestions = () => [
    'Context includes industry-specific compliance requirements',
    'Balances professionalism with chosen tone effectively',
    'Provides clear actionable guidelines for typical scenarios',
    'Incorporates specified optimization goals naturally'
  ];

  const handleUseTemplate = () => {
    if (onTemplateGenerated && generatedTemplate) {
      onTemplateGenerated(generatedTemplate);
      onClose();
    }
  };

  const resetGenerator = () => {
    setStep(1);
    setGeneratedTemplate(null);
    setFormData({
      industry: '',
      role: '',
      tone: '',
      target_audience: '',
      specific_needs: '',
      optimization_goals: []
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl max-h-[90vh] border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">AI Template Generator</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-2 rounded-full ${
                    step >= num ? 'bg-purple-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-4"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Let's Create Your Perfect Context</h3>
                <p className="text-gray-300">Tell me about your specific needs and I'll generate a tailored AI context template</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Select industry...</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry} className="bg-slate-800">{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Select role...</option>
                    {roles.map(role => (
                      <option key={role} value={role} className="bg-slate-800">{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Communication Tone</label>
                  <select
                    value={formData.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Select tone...</option>
                    {tones.map(tone => (
                      <option key={tone} value={tone} className="bg-slate-800">{tone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Target Audience</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Select audience...</option>
                    {audiences.map(audience => (
                      <option key={audience} value={audience} className="bg-slate-800">{audience}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Specific Needs (Optional)</label>
                <textarea
                  value={formData.specific_needs}
                  onChange={(e) => handleInputChange('specific_needs', e.target.value)}
                  placeholder="Describe any specific requirements, compliance needs, or unique aspects of your use case..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none h-24 resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.industry || !formData.role || !formData.tone || !formData.target_audience}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>Next</span>
                  <Target className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Optimization Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">What Are Your Goals?</h3>
                <p className="text-gray-300">Select the outcomes you want to optimize for</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optimizationGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => handleOptimizationGoalToggle(goal)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.optimization_goals.includes(goal)
                        ? 'bg-blue-500/20 border-blue-400 text-blue-400'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.optimization_goals.includes(goal)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.optimization_goals.includes(goal) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{goal}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={generateTemplate}
                  disabled={generating}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors flex items-center space-x-2"
                >
                  {generating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generated Template */}
          {step === 3 && generatedTemplate && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Your Template is Ready!</h3>
                <p className="text-gray-300">AI has generated a personalized context template for your needs</p>
              </div>

              {/* Template Preview */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{generatedTemplate.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      Quality Score: {generatedTemplate.quality_score}%
                    </span>
                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                      AI Generated
                    </span>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <pre className="text-gray-300 whitespace-pre-wrap text-sm">{generatedTemplate.context}</pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">Template Details</h5>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="text-blue-400">Industry:</span> {formData.industry}</p>
                      <p><span className="text-blue-400">Role:</span> {formData.role}</p>
                      <p><span className="text-blue-400">Tone:</span> {formData.tone}</p>
                      <p><span className="text-blue-400">Audience:</span> {formData.target_audience}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">AI Improvements</h5>
                    <div className="space-y-1">
                      {generatedTemplate.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={resetGenerator}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Generate Another
                </button>
                <button
                  onClick={handleUseTemplate}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg text-white font-semibold transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Use This Template</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITemplateGenerator;
