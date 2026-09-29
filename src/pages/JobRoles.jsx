import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, CheckCircle, Sparkles, X, ChevronRight, BookOpen } from 'lucide-react';
import { roleApi } from '../services/api';
import { Badge } from '../components/common/Badge';

export function JobRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Role Form
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [level, setLevel] = useState('Senior / L5');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await roleApi.list();
      if (res.data.success) {
        setRoles(res.data.roles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      await roleApi.create({
        title,
        department,
        level,
        requiredSkills: requiredSkills.split(',').map((s) => s.trim()),
        preferredSkills: preferredSkills.split(',').map((s) => s.trim()),
        description
      });
      setIsModalOpen(false);
      setTitle('');
      setRequiredSkills('');
      setPreferredSkills('');
      setDescription('');
      loadRoles();
    } catch (err) {
      alert('Error creating role: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-brand-600" />
            <span>Job Role Requirements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role requirement rubrics paired with Hindsight memory to detect evaluated vs non-evaluated skills
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Role</span>
        </button>
      </div>

      {/* Role Cards List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Loading role definitions...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:border-brand-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{role.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{role.department} • {role.level}</p>
                  </div>
                  <Badge variant="primary" size="xs">
                    {role.level}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {role.description || 'Standard technical engineering role rubric.'}
                </p>

                {/* Required Skills */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Required Skills:
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(role.requiredSkills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {role.preferredSkills && role.preferredSkills.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Preferred Skills:
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {role.preferredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Rubric active in AI Planner</span>
                <span className="text-brand-600 font-semibold flex items-center gap-1">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Define New Job Role</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Level</label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (comma separated) *</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="e.g. Go, Kubernetes, gRPC, Distributed Systems"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Skills (comma separated)</label>
                <input
                  type="text"
                  value={preferredSkills}
                  onChange={(e) => setPreferredSkills(e.target.value)}
                  placeholder="e.g. Raft, Rust, Kafka"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Role responsibilities and evaluation goals..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold"
                >
                  {saving ? 'Saving...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
