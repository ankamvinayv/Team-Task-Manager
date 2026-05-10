import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatRelative, capitalize, getStatusBadge, getPriorityBadge, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePencil, HiOutlineX, HiOutlineChatAlt2 } from 'react-icons/hi';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);
      if (res.data.project?._id) {
        const pRes = await api.get(`/projects/${res.data.project._id}`);
        setProjectMembers(pRes.data.members || []);
      }
    } catch { toast.error('Task not found'); navigate('/tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTask(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchTask();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/tasks/${id}/comments`, { text: commentText });
      setCommentText('');
      fetchTask();
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/tasks/${id}`, editForm);
      toast.success('Task updated');
      setShowEditModal(false);
      fetchTask();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task and its comments?')) return;
    try { await api.delete(`/tasks/${id}`); toast.success('Deleted'); navigate('/tasks'); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="page-content" style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner spinner-lg" /></div>;
  if (!task) return null;

  return (
    <>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ margin:0 }}><HiOutlineArrowLeft /> Back</button>
          <h1 style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</h1>
        </div>
        {isAdmin && <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => { setEditForm({ title:task.title, description:task.description, priority:task.priority, status:task.status, assignedTo:task.assignedTo?._id||'', dueDate:task.dueDate?.split('T')[0]||'' }); setShowEditModal(true); }}><HiOutlinePencil /> Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}><HiOutlineTrash /> Delete</button>
        </div>}
      </div>
      <div className="page-content">
        <div className="task-detail-grid">
          {/* Left — details + comments */}
          <div>
            <div className="card" style={{ marginBottom:'var(--space-lg)' }}>
              <h3 className="card-title" style={{ marginBottom:12 }}>Description</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:'var(--font-sm)', lineHeight:1.7 }}>{task.description || 'No description provided.'}</p>
            </div>

            {/* Comments */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <HiOutlineChatAlt2 style={{ color:'var(--primary-400)' }} />
                Comments ({task.comments?.length || 0})
              </h3>
              {task.comments?.length > 0 ? (
                <div className="comment-list">
                  {task.comments.map(c => (
                    <div className="comment-item" key={c._id}>
                      <div className="user-avatar" style={{ width:32, height:32, fontSize:'0.65rem', flexShrink:0 }}>{getInitials(c.author?.name)}</div>
                      <div className="comment-body">
                        <div className="comment-author">{c.author?.name}</div>
                        <div className="comment-text">{c.text}</div>
                        <div className="comment-time">{formatRelative(c.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color:'var(--text-muted)', fontSize:'var(--font-sm)' }}>No comments yet</p>}

              <form className="comment-form" onSubmit={handleAddComment}>
                <input className="form-input" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? <div className="spinner" /> : 'Send'}
                </button>
              </form>
            </div>
          </div>

          {/* Right — sidebar info */}
          <div>
            <div className="card">
              <div className="detail-field">
                <label>Status</label>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
                  {['pending','in-progress','completed'].map(s => (
                    <button key={s} className={`btn btn-sm ${task.status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleStatusChange(s)} style={{ fontSize:'var(--font-xs)', width:'100%', justifyContent:'center' }}>
                      {capitalize(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="detail-field">
                <label>Priority</label>
                <div className="value"><span className={`badge ${getPriorityBadge(task.priority)}`}>{capitalize(task.priority)}</span></div>
              </div>
              <div className="detail-field">
                <label>Project</label>
                <div className="value" style={{ cursor:'pointer', color:'var(--primary-400)' }} onClick={() => navigate(`/projects/${task.project?._id}`)}>{task.project?.title || '—'}</div>
              </div>
              <div className="detail-field">
                <label>Assigned To</label>
                <div className="value">
                  {task.assignedTo ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="user-avatar" style={{ width:28, height:28, fontSize:'0.6rem' }}>{getInitials(task.assignedTo.name)}</div>
                      {task.assignedTo.name}
                    </div>
                  ) : <span style={{ color:'var(--text-muted)' }}>Unassigned</span>}
                </div>
              </div>
              <div className="detail-field">
                <label>Due Date</label>
                <div className="value" style={{ color: task.isOverdue ? 'var(--danger-400)' : 'inherit' }}>
                  {formatDate(task.dueDate)}{task.isOverdue && ' (Overdue)'}
                </div>
              </div>
              <div className="detail-field">
                <label>Created By</label>
                <div className="value">{task.createdBy?.name || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && <div className="modal-backdrop" onClick={() => setShowEditModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Edit Task</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}><HiOutlineX /></button></div>
        <form onSubmit={handleEdit}><div className="modal-body">
          <div className="form-group"><label>Title</label><input className="form-input" value={editForm.title} onChange={e => setEditForm({...editForm, title:e.target.value})} /></div>
          <div className="form-group"><label>Description</label><textarea className="form-input" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description:e.target.value})} style={{ resize:'vertical' }} /></div>
          <div className="grid-2">
            <div className="form-group"><label>Priority</label><select className="form-select" value={editForm.priority} onChange={e => setEditForm({...editForm, priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="form-group"><label>Status</label><select className="form-select" value={editForm.status} onChange={e => setEditForm({...editForm, status:e.target.value})}><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Assign To</label><select className="form-select" value={editForm.assignedTo} onChange={e => setEditForm({...editForm, assignedTo:e.target.value})}><option value="">Unassigned</option>{projectMembers.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}</select></div>
            <div className="form-group"><label>Due Date</label><input type="date" className="form-input" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate:e.target.value})} /></div>
          </div>
        </div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <div className="spinner" /> : 'Save Changes'}</button></div></form>
      </div></div>}
    </>
  );
}
