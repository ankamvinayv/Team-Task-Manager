import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusBadge, capitalize, getPriorityBadge, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlinePencil, HiOutlineUserAdd, HiOutlineSearch } from 'react-icons/hi';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [addingMember, setAddingMember] = useState(null);
  const [taskForm, setTaskForm] = useState({ title:'', description:'', assignedTo:'', priority:'medium', dueDate:'' });
  const [editForm, setEditForm] = useState({ title:'', description:'', status:'active', dueDate:'' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks?project=${id}`)]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      toast.success('Task created!');
      setShowTaskModal(false);
      setTaskForm({ title:'', description:'', assignedTo:'', priority:'medium', dueDate:'' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const openMemberModal = async () => {
    setShowMemberModal(true);
    setMemberSearch('');
    try {
      const res = await api.get('/teams');
      setAllUsers(res.data);
    } catch { toast.error('Failed to load users'); }
  };

  const handleAddMember = async (userEmail) => {
    setAddingMember(userEmail);
    try {
      await api.post(`/projects/${id}/members`, { email: userEmail });
      toast.success('Member added!');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAddingMember(null); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try { await api.delete(`/projects/${id}/members/${userId}`); toast.success('Member removed'); fetchData(); }
    catch { toast.error('Failed to remove member'); }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/projects/${id}`, editForm);
      toast.success('Project updated!');
      setShowEditModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Deleted'); navigate('/projects'); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="page-content" style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner spinner-lg" /></div>;
  if (!project) return null;

  const progress = project.taskCounts?.total > 0 ? Math.round((project.taskCounts.completed / project.taskCounts.total) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="back-btn" onClick={() => navigate('/projects')} style={{ margin:0 }}><HiOutlineArrowLeft /> Back</button>
          <h1>{project.title}</h1>
          <span className={`badge ${getStatusBadge(project.status)}`}>{capitalize(project.status)}</span>
        </div>
        {isAdmin && <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => { setEditForm({ title:project.title, description:project.description, status:project.status, dueDate:project.dueDate?.split('T')[0]||'' }); setShowEditModal(true); }}><HiOutlinePencil /> Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}><HiOutlineTrash /> Delete</button>
        </div>}
      </div>
      <div className="page-content">
        {/* Project info */}
        <div className="grid-2" style={{ marginBottom:'var(--space-xl)' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom:12 }}>Details</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'var(--font-sm)', marginBottom:16 }}>{project.description || 'No description'}</p>
            <div style={{ display:'flex', gap:24, fontSize:'var(--font-sm)', color:'var(--text-muted)' }}>
              {project.dueDate && <span style={{ display:'flex', alignItems:'center', gap:4 }}><HiOutlineCalendar /> Due: {formatDate(project.dueDate)}</span>}
              <span>Owner: {project.owner?.name}</span>
            </div>
            <div className="project-progress" style={{ marginTop:16 }}>
              <div className="progress-bar"><div className="progress-bar-fill" style={{ width:`${progress}%` }} /></div>
              <div className="progress-text">{progress}% complete — {project.taskCounts?.completed || 0}/{project.taskCounts?.total || 0} tasks done</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Members ({project.members?.length || 0})</h3>{isAdmin && <button className="btn btn-ghost btn-sm" onClick={openMemberModal}><HiOutlineUserAdd /> Add</button>}</div>
            {project.members?.map(m => (
              <div className="member-row" key={m.user?._id || m._id}>
                <div className="member-info">
                  <div className="user-avatar" style={{ width:32, height:32, fontSize:'0.7rem' }}>{getInitials(m.user?.name)}</div>
                  <div><div style={{ fontSize:'var(--font-sm)', fontWeight:600 }}>{m.user?.name}</div><div style={{ fontSize:'var(--font-xs)', color:'var(--text-muted)' }}>{m.user?.email}</div></div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="badge badge-primary">{m.role}</span>
                  {isAdmin && m.role !== 'admin' && <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveMember(m.user?._id)} style={{ color:'var(--danger-400)' }}><HiOutlineX /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Tasks ({tasks.length})</h3>{isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}><HiOutlinePlus /> Add Task</button>}</div>
          {tasks.length === 0 ? <div className="empty-state"><p>No tasks yet</p></div> :
          <div className="table-container" style={{ border:'none' }}><table><thead><tr><th>Title</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due Date</th></tr></thead><tbody>
            {tasks.map(t => <tr key={t._id} style={{ cursor:'pointer' }} onClick={() => navigate(`/tasks/${t._id}`)}>
              <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{t.title}</td>
              <td>{t.assignedTo?.name || '—'}</td>
              <td><span className={`badge ${getPriorityBadge(t.priority)}`}>{capitalize(t.priority)}</span></td>
              <td><span className={`badge ${getStatusBadge(t.status)}`}>{capitalize(t.status)}</span></td>
              <td style={{ color: t.isOverdue ? 'var(--danger-400)' : 'inherit' }}>{formatDate(t.dueDate)}{t.isOverdue && ' ⚠'}</td>
            </tr>)}
          </tbody></table></div>}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Task</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowTaskModal(false)}><HiOutlineX /></button></div>
        <form onSubmit={handleCreateTask}><div className="modal-body">
          <div className="form-group"><label>Title *</label><input className="form-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title:e.target.value})} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-input" rows={2} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description:e.target.value})} style={{ resize:'vertical' }} /></div>
          <div className="grid-2">
            <div className="form-group"><label>Assign To</label><select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo:e.target.value})}><option value="">Unassigned</option>{project.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}</select></div>
            <div className="form-group"><label>Priority</label><select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          </div>
          <div className="form-group"><label>Due Date</label><input type="date" className="form-input" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate:e.target.value})} /></div>
        </div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <div className="spinner" /> : 'Create Task'}</button></div></form>
      </div></div>}

      {/* Add Member Modal */}
      {showMemberModal && <div className="modal-backdrop" onClick={() => setShowMemberModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Member</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowMemberModal(false)}><HiOutlineX /></button></div>
        <div className="modal-body">
          <div style={{ position:'relative', marginBottom:16 }}>
            <HiOutlineSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search by name or email..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ paddingLeft:36 }} />
          </div>
          <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
            {(() => {
              const existingIds = new Set((project.members || []).map(m => m.user?._id));
              const available = allUsers.filter(u => !existingIds.has(u._id));
              const filtered = available.filter(u =>
                u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(memberSearch.toLowerCase())
              );
              if (filtered.length === 0) return <div className="empty-state" style={{ padding:'var(--space-lg)' }}><p>{available.length === 0 ? 'All users are already members' : 'No users match your search'}</p></div>;
              return filtered.map(u => (
                <div key={u._id} className="member-row" style={{ padding:'10px 12px', borderRadius:'var(--radius-md)', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div className="member-info">
                    <div className="user-avatar" style={{ width:36, height:36, fontSize:'0.75rem' }}>{getInitials(u.name)}</div>
                    <div>
                      <div style={{ fontSize:'var(--font-sm)', fontWeight:600 }}>{u.name}</div>
                      <div style={{ fontSize:'var(--font-xs)', color:'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddMember(u.email)} disabled={addingMember === u.email}>
                    {addingMember === u.email ? <div className="spinner" /> : <><HiOutlinePlus /> Add</>}
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Close</button></div>
      </div></div>}

      {/* Edit Project Modal */}
      {showEditModal && <div className="modal-backdrop" onClick={() => setShowEditModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Edit Project</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}><HiOutlineX /></button></div>
        <form onSubmit={handleUpdateProject}><div className="modal-body">
          <div className="form-group"><label>Title</label><input className="form-input" value={editForm.title} onChange={e => setEditForm({...editForm, title:e.target.value})} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-input" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description:e.target.value})} style={{ resize:'vertical' }} /></div>
          <div className="grid-2">
            <div className="form-group"><label>Due Date</label><input type="date" className="form-input" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate:e.target.value})} /></div>
            <div className="form-group"><label>Status</label><select className="form-select" value={editForm.status} onChange={e => setEditForm({...editForm, status:e.target.value})}><option value="active">Active</option><option value="on-hold">On Hold</option><option value="completed">Completed</option></select></div>
          </div>
        </div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <div className="spinner" /> : 'Save Changes'}</button></div></form>
      </div></div>}
    </>
  );
}
