import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusBadge, capitalize } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineFolder, HiOutlinePlus, HiOutlineCalendar, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineX } from 'react-icons/hi';

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = () => {
    api.get('/projects').then(r => setProjects(r.data)).catch(() => toast.error('Failed to load projects')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ title: '', description: '', dueDate: '', status: 'active' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create project'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-content" style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner spinner-lg" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Projects</h1>
        {isAdmin && <div className="page-header-actions"><button className="btn btn-primary" onClick={() => setShowModal(true)}><HiOutlinePlus /> New Project</button></div>}
      </div>
      <div className="page-content">
        {projects.length === 0 ? (
          <div className="empty-state"><div className="icon"><HiOutlineFolder /></div><h3>No projects yet</h3><p>Create your first project to get started</p>{isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}><HiOutlinePlus /> New Project</button>}</div>
        ) : (
          <div className="projects-grid">
            {projects.map((p, i) => {
              const progress = p.taskCount > 0 ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;
              return (
                <div key={p._id} className="project-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }} onClick={() => navigate(`/projects/${p._id}`)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                    <h3 className="project-card-title">{p.title}</h3>
                    <span className={`badge ${getStatusBadge(p.status)}`}>{capitalize(p.status)}</span>
                  </div>
                  <p className="project-card-desc">{p.description || 'No description'}</p>
                  <div className="project-meta">
                    <span className="meta-item"><HiOutlineClipboardList /> {p.taskCount} tasks</span>
                    <span className="meta-item"><HiOutlineUserGroup /> {p.memberCount} members</span>
                    {p.dueDate && <span className="meta-item"><HiOutlineCalendar /> {formatDate(p.dueDate)}</span>}
                  </div>
                  <div className="project-progress">
                    <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
                    <div className="progress-text">{progress}% complete</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Project</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label>Title *</label><input className="form-input" placeholder="Project name" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div className="form-group"><label>Description</label><textarea className="form-input" rows={3} placeholder="Brief description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ resize:'vertical' }} /></div>
                <div className="grid-2">
                  <div className="form-group"><label>Due Date</label><input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
                  <div className="form-group"><label>Status</label><select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="on-hold">On Hold</option></select></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <div className="spinner" /> : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
