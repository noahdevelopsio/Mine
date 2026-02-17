const axios = require('axios');

class OllamaAPI {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.defaultModel = process.env.OLLAMA_MODEL || 'llama3.2';
    this.fallbackModel = 'mistral';
  }

  // Check if Ollama is available
  async isAvailable() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('Ollama not available:', error.message);
      return false;
    }
  }

  // Get available models
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error.message);
      return [];
    }
  }

  // Generate text with Ollama
  async generate(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    
    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 2048
        }
      }, {
        timeout: 60000 // 60 second timeout for generation
      });

      return {
        success: true,
        response: response.data.response,
        model: model,
        total_duration: response.data.total_duration,
        load_duration: response.data.load_duration,
        prompt_eval_count: response.data.prompt_eval_count,
        eval_count: response.data.eval_count
      };
    } catch (error) {
      console.error('Error generating with Ollama:', error.message);
      
      // Try fallback model if primary fails
      if (model !== this.fallbackModel && !options.noFallback) {
        console.log(`Trying fallback model: ${this.fallbackModel}`);
        return this.generate(prompt, { ...options, model: this.fallbackModel, noFallback: true });
      }
      
      throw error;
    }
  }

  // Generate social media post
  async generatePost(topic, platform, options = {}) {
    const tone = options.tone || 'professional';
    const length = options.length || 'medium';
    const includeHashtags = options.includeHashtags !== false;

    const lengthMap = {
      short: '1-2 sentences (under 100 characters)',
      medium: '3-5 sentences (100-280 characters)',
      long: '1-2 paragraphs (280-1000 characters)'
    };

    const platformGuidelines = {
      twitter: 'Twitter/X: Keep it concise, use hashtags, engaging tone',
      linkedin: 'LinkedIn: Professional, thought leadership, industry insights'
    };

    const prompt = `Create an engaging social media post about "${topic}" for ${platform}.

Platform: ${platformGuidelines[platform] || 'General social media'}
Tone: ${tone}
Length: ${lengthMap[length]}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags needed'}

Requirements:
- Hook the reader in the first line
- Use appropriate tone for the platform
- Include a call-to-action if relevant
- ${includeHashtags ? 'Add 3-5 relevant hashtags at the end' : ''}

Generate only the post content, no explanations.`;

    try {
      const result = await this.generate(prompt, options);
      
      // Extract hashtags if requested
      let hashtags = [];
      if (includeHashtags) {
        hashtags = this.extractHashtags(result.response);
        // Clean up the post by removing hashtags for separate handling
        result.response = result.response.replace(/#\w+/g, '').trim();
      }

      return {
        content: result.response,
        hashtags: hashtags,
        platform: platform,
        tone: tone,
        model: result.model,
        generation_stats: {
          total_duration: result.total_duration,
          prompt_eval_count: result.prompt_eval_count,
          eval_count: result.eval_count
        }
      };
    } catch (error) {
      console.error('Error generating post:', error);
      throw error;
    }
  }

  // Improve existing draft
  async improveDraft(draft, platform, options = {}) {
    const prompt = `Improve this social media draft for ${platform}:

"${draft}"

Improvements to make:
1. Enhance engagement and readability
2. Fix any grammar or spelling issues
3. Optimize for ${platform}'s audience and format
4. Add power words and emotional triggers
5. Improve the hook/opening
6. Strengthen the call-to-action

Return only the improved version, no explanations.`;

    try {
      const result = await this.generate(prompt, options);
      return result.response.trim();
    } catch (error) {
      console.error('Error improving draft:', error);
      throw error;
    }
  }

  // Suggest hashtags for content
  async suggestHashtags(content, platform, count = 5) {
    const platformContext = {
      twitter: 'Twitter/X hashtags should be trending and concise',
      linkedin: 'LinkedIn hashtags should be professional and industry-specific'
    };

    const prompt = `Generate ${count} relevant hashtags for this content:

"${content}"

Platform: ${platform}
${platformContext[platform] || 'General social media'}

Requirements:
- Mix of popular and niche hashtags
- Relevant to the content topic
- No spaces in hashtags
- Include both broad and specific tags

Return only the hashtags, comma-separated, no explanations.`;

    try {
      const result = await this.generate(prompt, { max_tokens: 200 });
      return this.parseHashtags(result.response);
    } catch (error) {
      console.error('Error suggesting hashtags:', error);
      return this.fallbackHashtags(content);
    }
  }

  // Analyze content sentiment
  async analyzeSentiment(text) {
    const prompt = `Analyze the sentiment of this text:

"${text}"

Classify as: POSITIVE, NEGATIVE, or NEUTRAL.
Also provide a confidence score (0-100).
Return in this format:
Sentiment: [classification]
Confidence: [score]
Explanation: [brief explanation]`;

    try {
      const result = await this.generate(prompt, { max_tokens: 300 });
      return this.parseSentiment(result.response);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { sentiment: 'neutral', confidence: 50, explanation: 'Error in analysis' };
    }
  }

  // Generate content variations
  async generateVariations(content, platform, count = 3) {
    const prompt = `Create ${count} variations of this social media post for ${platform}:

Original: "${content}"

Requirements:
- Each variation should have a different angle or hook
- Maintain the core message
- Optimize for engagement
- Label each variation as "Variation 1:", "Variation 2:", etc.

Generate ${count} distinct versions.`;

    try {
      const result = await this.generate(prompt, { max_tokens: 1500 });
      return this.parseVariations(result.response);
    } catch (error) {
      console.error('Error generating variations:', error);
      throw error;
    }
  }

  // Generate content ideas based on trends
  async generateContentIdeas(trends, industry, count = 5) {
    const prompt = `Generate ${count} social media content ideas based on these trending topics:

Trending Topics: ${trends.join(', ')}
Industry: ${industry}

For each idea:
1. Provide a catchy title
2. Brief description of the content
3. Suggested platform (Twitter or LinkedIn)
4. Key points to cover

Format each idea clearly with numbering.`;

    try {
      const result = await this.generate(prompt, { max_tokens: 2000 });
      return this.parseContentIdeas(result.response);
    } catch (error) {
      console.error('Error generating content ideas:', error);
      return [];
    }
  }

  // Optimize posting time recommendation
  async optimizePostTime(content, platform, audience) {
    const prompt = `Recommend the best time to post this content on ${platform}:

Content: "${content.substring(0, 200)}..."
Target Audience: ${audience || 'General'}

Consider:
- Platform-specific peak hours
- Content type and audience
- Day of the week optimization

Return:
Best Day: [day]
Best Time: [time]
Reasoning: [brief explanation]`;

    try {
      const result = await this.generate(prompt, { max_tokens: 400 });
      return this.parseTimeRecommendation(result.response);
    } catch (error) {
      console.error('Error optimizing post time:', error);
      return { day: 'Tuesday', time: '9:00 AM', reasoning: 'General best practice' };
    }
  }

  // Helper methods
  extractHashtags(text) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }

  parseHashtags(text) {
    return text
      .split(/[,\\n]/)
      .map(tag => tag.trim())
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.toLowerCase())
      .slice(0, 10);
  }

  fallbackHashtags(content) {
    const keywords = content.toLowerCase().split(/\s+/).filter(word => word.length > 4);
    return keywords.slice(0, 5).map(word => `#${word}`);
  }

  parseSentiment(text) {
    const sentimentMatch = text.match(/Sentiment:\s*(POSITIVE|NEGATIVE|NEUTRAL)/i);
    const confidenceMatch = text.match(/Confidence:\s*(\d+)/i);
    
    return {
      sentiment: (sentimentMatch?.[1] || 'neutral').toLowerCase(),
      confidence: parseInt(confidenceMatch?.[1] || '50'),
      explanation: text.split('Explanation:')[1]?.trim() || ''
    };
  }

  parseVariations(text) {
    const variations = [];
    const regex = /Variation\s*\d+:\s*([\\s\\S]*?)(?=Variation\s*\d+:|$)/gi;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      variations.push(match[1].trim());
    }
    
    return variations.length > 0 ? variations : [text.trim()];
  }

  parseContentIdeas(text) {
    const ideas = [];
    const lines = text.split('\\n').filter(line => line.trim());
    
    let currentIdea = {};
    lines.forEach(line => {
      if (line.match(/^\\d+\\./)) {
        if (Object.keys(currentIdea).length > 0) {
          ideas.push(currentIdea);
        }
        currentIdea = { title: line.replace(/^\\d+\\.\s*/, '').trim() };
      } else if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        currentIdea[key.toLowerCase()] = value;
      }
    });
    
    if (Object.keys(currentIdea).length > 0) {
      ideas.push(currentIdea);
    }
    
    return ideas;
  }

  parseTimeRecommendation(text) {
    const dayMatch = text.match(/Best Day:\s*(.+)/i);
    const timeMatch = text.match(/Best Time:\s*(.+)/i);
    const reasoningMatch = text.match(/Reasoning:\s*(.+)/i);
    
    return {
      day: dayMatch?.[1]?.trim() || 'Tuesday',
      time: timeMatch?.[1]?.trim() || '9:00 AM',
      reasoning: reasoningMatch?.[1]?.trim() || 'General best practice'
    };
  }
}

module.exports = OllamaAPI;