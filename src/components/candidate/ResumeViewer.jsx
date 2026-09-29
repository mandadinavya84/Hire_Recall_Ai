import React from 'react';
import { FileText, Award, Briefcase, GraduationCap, Code } from 'lucide-react';
import { Badge } from '../common/Badge';

export function ResumeViewer({ resume, candidateName }) {
  if (!resume) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-slate-500">
        No resume data available.
      </div>
    );
  }

  const { summary, skills = [], education, experienceYears, projects = [] } = resume;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50 border border-brand-200 text-brand-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Extracted Resume Intelligence</h4>
            <p className="text-xs text-slate-500">Parsed into candidate baseline profile and Hindsight World Facts</p>
          </div>
        </div>
        <Badge variant="primary" size="sm">
          {experienceYears || '2+ years exp'}
        </Badge>
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Executive Summary</h5>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            {summary}
          </p>
        </div>
      )}

      {/* Skills Grid */}
      <div>
        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-brand-600" />
          Detected Technical Stack
        </h5>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-brand-600" />
            Highlighted Projects & Systems
          </h5>
          <ul className="space-y-2">
            {projects.map((proj, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-brand-500 font-bold">•</span>
                <span>{proj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Education */}
      {education && (
        <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <GraduationCap className="w-4 h-4 text-slate-400" />
          <span><strong className="text-slate-700">Education:</strong> {education}</span>
        </div>
      )}
    </div>
  );
}
