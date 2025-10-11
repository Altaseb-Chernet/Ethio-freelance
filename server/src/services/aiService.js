// server/src/services/aiService.js
const natural = require('natural');
const { TfIdf } = require('natural');

// Initialize TF-IDF
const tfidf = new TfIdf();

class AIService {
  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.useOpenAI = !!this.openAIKey;
    
    if (this.useOpenAI) {
      // In a real implementation, you would import and initialize OpenAI
      console.log('OpenAI integration enabled');
    } else {
      console.log('OpenAI integration disabled - using fallback methods');
    }
  }

  // Enhanced proposal using AI or fallback
  async enhanceProposal(proposal, jobDescription) {
    if (this.useOpenAI) {
      return await this._enhanceWithOpenAI(proposal, jobDescription);
    } else {
      return this._enhanceWithFallback(proposal, jobDescription);
    }
  }

  // Match freelancers to job using AI or fallback
  async matchJobToFreelancers(job, freelancers) {
    if (this.useOpenAI) {
      return await this._matchWithOpenAI(job, freelancers);
    } else {
      return this._matchWithFallback(job, freelancers);
    }
  }

  // Suggest price range for a job
  async suggestPrice(jobDetails) {
    if (this.useOpenAI) {
      return await this._suggestPriceWithOpenAI(jobDetails);
    } else {
      return this._suggestPriceWithFallback(jobDetails);
    }
  }

  // OpenAI-enhanced proposal
  async _enhanceWithOpenAI(proposal, jobDescription) {
    try {
      // Mock OpenAI response - replace with actual API call
      // const openai = new OpenAI({ apiKey: this.openAIKey });
      // const response = await openai.chat.completions.create({...});
      
      const enhancedProposal = `
${proposal}

**Enhanced with AI:**

I've carefully reviewed your project requirements and would like to propose the following approach:

• **Understanding**: ${jobDescription.substring(0, 100)}...
• **Methodology**: I'll employ best practices and industry standards
• **Communication**: Regular updates and transparent communication
• **Delivery**: High-quality work within the agreed timeline

I'm confident I can deliver exceptional results for your project!
      `.trim();

      return {
        enhancedProposal,
        confidenceScore: 0.85,
        improvements: [
          "Added professional structure",
          "Included methodology section",
          "Emphasized communication",
          "Highlighted confidence"
        ]
      };
    } catch (error) {
      console.error('OpenAI enhancement error:', error);
      return this._enhanceWithFallback(proposal, jobDescription);
    }
  }

  // Fallback proposal enhancement
  _enhanceWithFallback(proposal, jobDescription) {
    const skills = this._extractSkills(jobDescription);
    const enhancedProposal = `
${proposal}

**Enhanced Proposal:**

Based on the job requirements, I believe my skills in ${skills.join(', ')} make me an excellent fit for this project. I'm committed to delivering high-quality work and maintaining clear communication throughout the project lifecycle.

Key strengths for this role:
• Relevant technical expertise
• Strong problem-solving abilities
• Professional work ethic
• Timely delivery guarantee

Looking forward to the opportunity to work with you!
    `.trim();

    return {
      enhancedProposal,
      confidenceScore: 0.65,
      improvements: [
        "Added skills matching",
        "Included key strengths section",
        "Professional formatting"
      ]
    };
  }

  // OpenAI matching
  async _matchWithOpenAI(job, freelancers) {
    try {
      // Mock OpenAI matching - replace with actual embeddings/API calls
      const matches = freelancers.map(freelancer => {
        const skillsMatch = this._calculateSkillsMatch(job.skillsRequired, freelancer.profile.skills);
        const bioRelevance = this._calculateTextSimilarity(job.description, freelancer.profile.bio || '');
        
        const score = (skillsMatch * 0.6) + (bioRelevance * 0.4);
        
        return {
          freelancer,
          score: Math.min(score + 0.2, 1.0), // Boost for OpenAI
          rationale: `AI Analysis: Strong match based on ${freelancer.profile.skills.slice(0, 2).join(', ')} expertise and profile relevance.`,
          aiEnhanced: true
        };
      });

      return matches.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('OpenAI matching error:', error);
      return this._matchWithFallback(job, freelancers);
    }
  }

  // Fallback matching using TF-IDF and skills matching
  _matchWithFallback(job, freelancers) {
    // Build corpus for TF-IDF
    const corpus = [job.description, job.title];
    freelancers.forEach(f => {
      corpus.push(f.profile.bio || '');
      corpus.push(f.profile.skills.join(' '));
    });

    // Add documents to TF-IDF
    corpus.forEach(doc => tfidf.addDocument(doc));

    const matches = freelancers.map(freelancer => {
      const skillsMatch = this._calculateSkillsMatch(job.skillsRequired, freelancer.profile.skills);
      const bioRelevance = this._calculateTextSimilarity(job.description, freelancer.profile.bio || '');
      
      const score = (skillsMatch * 0.7) + (bioRelevance * 0.3);
      
      return {
        freelancer,
        score,
        rationale: `Skills match: ${Math.round(skillsMatch * 100)}%, Profile relevance: ${Math.round(bioRelevance * 100)}%`,
        aiEnhanced: false
      };
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  // OpenAI price suggestion
  async _suggestPriceWithOpenAI(jobDetails) {
    try {
      // Mock OpenAI response
      const { budget, duration, skillsRequired } = jobDetails;
      
      let basePrice = budget.fixed || ((budget.min + budget.max) / 2) || 500;
      const skillMultiplier = skillsRequired.length * 0.1 + 1;
      const durationMultiplier = this._getDurationMultiplier(duration);
      
      const suggestedMin = Math.round(basePrice * 0.8 * skillMultiplier * durationMultiplier);
      const suggestedMax = Math.round(basePrice * 1.2 * skillMultiplier * durationMultiplier);

      return {
        min: suggestedMin,
        max: suggestedMax,
        confidence: 0.8,
        rationale: `AI Analysis: Considering ${skillsRequired.length} required skills and ${duration} timeline, the market rate suggests this range.`,
        aiEnhanced: true
      };
    } catch (error) {
      console.error('OpenAI price suggestion error:', error);
      return this._suggestPriceWithFallback(jobDetails);
    }
  }

  // Fallback price suggestion
  _suggestPriceWithFallback(jobDetails) {
    const { budget, duration, skillsRequired } = jobDetails;
    
    let basePrice = budget.fixed || ((budget.min + budget.max) / 2) || 500;
    const skillMultiplier = skillsRequired.length * 0.1 + 1;
    const durationMultiplier = this._getDurationMultiplier(duration);
    
    const suggestedMin = Math.round(basePrice * 0.7 * skillMultiplier * durationMultiplier);
    const suggestedMax = Math.round(basePrice * 1.3 * skillMultiplier * durationMultiplier);

    return {
      min: suggestedMin,
      max: suggestedMax,
      confidence: 0.6,
      rationale: `Based on ${skillsRequired.length} skills and ${duration} duration. Adjust based on project complexity.`,
      aiEnhanced: false
    };
  }

  // Helper methods
  _calculateSkillsMatch(requiredSkills, freelancerSkills) {
    if (!requiredSkills.length || !freelancerSkills.length) return 0;
    
    const matchingSkills = requiredSkills.filter(skill => 
      freelancerSkills.some(fSkill => 
        fSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(fSkill.toLowerCase())
      )
    );
    
    return matchingSkills.length / requiredSkills.length;
  }

  _calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const tokenizer = new natural.WordTokenizer();
    const tokens1 = tokenizer.tokenize(text1.toLowerCase());
    const tokens2 = tokenizer.tokenize(text2.toLowerCase());
    
    if (!tokens1 || !tokens2) return 0;
    
    const intersection = tokens1.filter(token => tokens2.includes(token));
    const union = [...new Set([...tokens1, ...tokens2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  _extractSkills(text) {
    const commonSkills = ['react', 'node', 'python', 'javascript', 'html', 'css', 'mongodb', 'sql', 'aws', 'docker'];
    const foundSkills = commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    return foundSkills.length > 0 ? foundSkills : ['relevant technologies'];
  }

  _getDurationMultiplier(duration) {
    const multipliers = {
      'less-than-week': 1,
      '1-2 weeks': 1.2,
      '2-4 weeks': 1.5,
      '1-3 months': 2,
      '3+ months': 3
    };
    return multipliers[duration] || 1;
  }
}

module.exports = new AIService();