const config = require('../../config');

class LLMClient {
  constructor() {
    this.provider = config.ai.provider;
    this.geminiApiKey = config.ai.geminiApiKey;
    this.openaiApiKey = config.ai.openaiApiKey;
  }

  isLiveProviderAvailable() {
    if (this.provider === 'gemini' && this.geminiApiKey) return true;
    if (this.provider === 'openai' && this.openaiApiKey) return true;
    return false;
  }

  /**
   * Generates completion given a system instruction and user prompt with Hindsight memory context
   */
  async generateCompletion({ systemPrompt, userPrompt, jsonMode = false }) {
    if (this.provider === 'gemini' && this.geminiApiKey) {
      return await this.callGemini(systemPrompt, userPrompt, jsonMode);
    }
    if (this.provider === 'openai' && this.openaiApiKey) {
      return await this.callOpenAI(systemPrompt, userPrompt, jsonMode);
    }
    return null; // Fallback to embedded heuristic generator
  }

  async callGemini(systemPrompt, userPrompt, jsonMode) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
    
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain'
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Gemini API error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonMode && text) {
        return JSON.parse(text);
      }
      return text;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[LLM Client] Gemini call failed, falling back to embedded generator:', err.message);
      return null;
    }
  }

  async callOpenAI(systemPrompt, userPrompt, jsonMode) {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`OpenAI API error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (jsonMode && text) {
        return JSON.parse(text);
      }
      return text;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[LLM Client] OpenAI call failed, falling back to embedded generator:', err.message);
      return null;
    }
  }
}

module.exports = new LLMClient();
