import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, User, HelpCircle, ArrowRight, CornerDownRight } from 'lucide-react';
import { aiApi } from '../../services/api';

export function CandidateAIChat({ candidate }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `Hello! I'm your Recruitment Memory Agent for **${candidate.name}**. I have full recall of all ${candidate.interviews?.length || 2} interview rounds, questions asked, and candidate memory nodes in Hindsight.\n\nAsk me anything about past observations, strengths, gaps, or what to evaluate next!`,
      citations: [],
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isFrontend = candidate.role?.toLowerCase().includes('frontend') || candidate.role?.toLowerCase().includes('react');
  const isML = candidate.role?.toLowerCase().includes('machine learning') || candidate.role?.toLowerCase().includes('ai');
  const roleTopic = isFrontend ? 'Webpack bundle optimization' : (isML ? 'inference latency profiling' : 'database indexing');

  const suggestedPrompts = [
    `What are ${candidate.name}'s biggest weaknesses?`,
    `What did we discuss in Round 1?`,
    `Did we already ask about ${roleTopic}?`,
    `What has improved since Round 1?`,
    `What should I ask in the next interview?`,
    `How has our assessment changed across the rounds?`
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(candidate.id, q);
      if (res.data.success) {
        const aiMsg = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: res.data.response,
          citations: res.data.evidenceCited || [],
          followUps: res.data.suggestedFollowUps || [],
          timestamp: res.data.timestamp
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an error retrieving memories. Please verify your query or check backend status.',
          citations: [],
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-memory-600 text-white flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Recruiter AI Assistant</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-memory-100 text-memory-700">
                Grounded in Hindsight
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Evaluating candidate context for <strong className="text-slate-700">{candidate.name}</strong>
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Bank: hirerecall_recruitment_v1
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2.5 bg-slate-100/50 border-b border-slate-200/60 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-memory-600 shrink-0" />
          <span className="font-semibold text-slate-700 shrink-0">Try asking:</span>
          {suggestedPrompts.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-memory-300 hover:bg-memory-50/50 hover:text-memory-900 transition text-[11px] shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-memory-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="p-3 rounded-xl bg-memory-50/70 border border-memory-200 text-xs space-y-1.5">
                  <span className="font-bold text-memory-900 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3 text-memory-600" />
                    Retrieved from Candidate Memory ({msg.citations.length} sources)
                  </span>
                  <div className="space-y-1">
                    {msg.citations.map((c, cIdx) => (
                      <div key={cIdx} className="bg-white p-2 rounded-lg border border-memory-100 text-[11px]">
                        <span className="font-semibold text-memory-950">
                          [{c.roundLabel}] {c.title}:
                        </span>{' '}
                        <span className="text-slate-600 italic">"{c.quote}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up question chips */}
              {msg.followUps && msg.followUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.followUps.map((fu, fuIdx) => (
                    <button
                      key={fuIdx}
                      onClick={() => handleSend(fu)}
                      className="text-[10px] font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                    >
                      <CornerDownRight className="w-2.5 h-2.5 text-slate-400" />
                      <span>{fu}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-7 h-7 rounded-lg bg-memory-600 text-white flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 rounded-tl-none border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-memory-600 animate-ping"></span>
              <span>Recall query running in Hindsight memory banks...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${candidate.name}'s interview history, strengths, or gaps...`}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-memory-500/20 focus:border-memory-500 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-memory-600 hover:bg-memory-700 text-white rounded-xl disabled:opacity-50 transition shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
