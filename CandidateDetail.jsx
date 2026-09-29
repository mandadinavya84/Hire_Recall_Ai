import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Calendar, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  Briefcase, 
  Mail, 
  Phone, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { candidateApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { CandidateTimeline } from '../components/candidate/CandidateTimeline';
import { CandidateEvolution } from '../components/candidate/CandidateEvolution';
import { MemoryCard } from '../components/candidate/MemoryCard';
import { ResumeViewer } from '../components/candidate/ResumeViewer';
import { AddInterviewModal } from '../components/candidate/AddInterviewModal';
import { PrepareNextInterview } from '../components/ai/PrepareNextInterview';
import { CandidateAIChat } from '../components/ai/CandidateAIChat';
import { BeforeAfterModal } from '../components/ai/BeforeAfterModal';

export function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [memories, setMemories] = useState([]);
  const [evolution, setEvolution] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('evolution'); // 'evolution' | 'timeline' | 'memory' | 'chat' | 'resume'

  // Modals & Panels
  const [isAddInterviewOpen, setIsAddInterviewOpen] = useState(false);
  const [isPreparePlanOpen, setIsPreparePlanOpen] = useState(false);
  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState(false);

  // Memory Type Filter
  const [memoryTypeFilter, setMemoryTypeFilter] = useState('all');

  const loadCandidateData = async () => {
    try {
      const [candRes, memRes, evoRes] = await Promise.all([
        candidateApi.getById(id),
        candidateApi.getMemories(id),
        candidateApi.getEvolution(id)
      ]);

      if (candRes.data.success) {
        setCandidate(candRes.data.candidate);
        setInterviews(candRes.data.candidate.interviews || []);
      }
      if (memRes.data.success) {
        setMemories(memRes.data.memories || []);
      }
      if (evoRes.data.success) {
        setEvolution(evoRes.data.reflection || null);
      }
    } catch (err) {
      console.error('Error loading candidate profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCandidateData();
    }
  }, [id]);

  const handleInterviewAdded = (data) => {
    loadCandidateData();
    // Switch to evolution or timeline tab to show the update!
    setActiveTab('evolution');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 max-w-5xl mx-auto">
        <Brain className="w-10 h-10 text-brand-500 animate-pulse mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Recalling Candidate Profile & Hindsight Memory...</h3>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-5xl mx-auto">
        <h3 className="text-base font-bold text-slate-800">Candidate Not Found</h3>
        <button
          onClick={() => navigate('/candidates')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Candidates
        </button>
      </div>
    );
  }

  const filteredMemories = memories.filter((m) => {
    if (memoryTypeFilter === 'all') return true;
    if (memoryTypeFilter === 'strength') return m.subType === 'strength';
    if (memoryTypeFilter === 'weakness') return m.subType === 'weakness';
    return m.type === memoryTypeFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/candidates')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Candidate Directory</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Candidate Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {candidate.name}
              </h1>
              <Badge variant="primary" size="sm">
                {candidate.role}
              </Badge>
              <Badge variant="memory" size="sm">
                {candidate.currentRound}
              </Badge>
              <Badge variant={candidate.status === 'Interviewing' ? 'success' : 'default'} size="sm">
                {candidate.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.email}</span>
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.phone}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.experience} experience</span>
              </span>
              <span className="flex items-center gap-1.5 text-memory-700 font-semibold">
                <Brain className="w-3.5 h-3.5 text-memory-600" />
                <span>{memories.length} Hindsight memories retained</span>
              </span>
            </div>

            {/* Quick Strengths & Gaps Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Memory Profile:</span>
              {(candidate.tags || []).map((t, idx) => {
                const isGap = t.toLowerCase().includes('gap') || t.toLowerCase().includes('weak');
                return (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                      isGap
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isGap ? '🔴 ' : '🟢 '}{t}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action CTAs (Hero Buttons) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Before / After Memory Impact Modal */}
            <button
              onClick={() => setIsBeforeAfterOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-200"
              title="Compare Stateless AI vs Hindsight Memory"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Compare Memory Impact</span>
            </button>

            {/* Add Interview Round */}
            <button
              onClick={() => setIsAddInterviewOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-300 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>Record Interview Feedback</span>
            </button>

            {/* HERO BUTTON: Prepare Next Interview */}
            <button
              onClick={() => setIsPreparePlanOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-memory-600 hover:from-brand-500 hover:to-memory-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-brand-600/25 flex items-center gap-2 transition"
            >
              <Brain className="w-4 h-4 text-white animate-pulse" />
              <span>Prepare Next Interview</span>
            </button>
          </div>
        </div>

        {/* Recruiter Bar Raiser Note strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Recruiter Bar Raiser:</span>
            <span>Priya Sharma</span>
            <span className="text-slate-300">•</span>
            <span>Prefers real-world scenario architecture questions</span>
          </div>
          <span className="text-emerald-600 font-medium hidden sm:inline">
            ✓ Auto-retained across rounds
          </span>
        </div>
      </div>

      {/* Prepare Next Interview Drawer / Card when toggled */}
      {isPreparePlanOpen && (
        <div className="transition-all">
          <PrepareNextInterview
            candidateId={candidate.id}
            onClose={() => setIsPreparePlanOpen(false)}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('evolution')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'evolution'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Candidate Evolution</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
            Matrix
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'timeline'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Interview History & Timeline</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
            {interviews.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'memory'
              ? 'border-memory-600 text-memory-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Brain className="w-4 h-4 text-memory-600" />
          <span>🧠 Hindsight Candidate Memory</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-memory-100 text-memory-800">
            {memories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Candidate Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'resume'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume Intelligence</span>
        </button>
      </div>

      {/* Active Tab Content Area */}
      <div>
        {activeTab === 'evolution' && (
          <CandidateEvolution evolution={evolution} />
        )}

        {activeTab === 'timeline' && (
          <CandidateTimeline
            interviews={interviews}
            onAddInterviewClick={() => setIsAddInterviewOpen(true)}
          />
        )}

        {activeTab === 'memory' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-memory-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Hindsight Persistent Memory Nodes ({memories.length} retained)
                </h4>
              </div>

              {/* Memory Type Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs">
                {['all', 'observation', 'strength', 'weakness', 'experience', 'world_fact'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMemoryTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition text-xs font-medium ${
                      memoryTypeFilter === type
                        ? 'bg-memory-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMemories.map((mem) => (
                <MemoryCard key={mem.id} memory={mem} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <CandidateAIChat candidate={candidate} />
        )}

        {activeTab === 'resume' && (
          <ResumeViewer resume={candidate.resume} candidateName={candidate.name} />
        )}
      </div>

      {/* Modals */}
      <AddInterviewModal
        isOpen={isAddInterviewOpen}
        onClose={() => setIsAddInterviewOpen(false)}
        candidate={candidate}
        nextRoundNumber={interviews.length + 1}
        onSuccess={handleInterviewAdded}
      />

      <BeforeAfterModal
        isOpen={isBeforeAfterOpen}
        onClose={() => setIsBeforeAfterOpen(false)}
        candidateId={candidate.id}
      />
    </div>
  );
}
