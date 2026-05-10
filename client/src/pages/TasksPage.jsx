import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { capitalize, formatDate, getStatusBadge, getPriorityBadge } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', project: '', search: '' });

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/projects')])
      .then(([tRes, pRes]) => { setTasks(tRes.data); setProjects(pRes.data); })
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.project && t.project?._id !== filters.project) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="page-content" style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner spinner-lg" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Tasks</h1>
      </div>
      <div className="page-content">
        {/* Filters */}
        <div className="filter-bar">
          <div style={{ position:'relative', flex:1, maxWidth:280 }}>
            <HiOutlineSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search tasks..." value={filters.search} onChange={e => setFilters({...filters, search:e.target.value})} style={{ paddingLeft:36, width:'100%' }} />
          </div>
          <select className="form-select" value={filters.status} onChange={e => setFilters({...filters, status:e.target.value})}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="form-select" value={filters.priority} onChange={e => setFilters({...filters, priority:e.target.value})}>
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="form-select" value={filters.project} onChange={e => setFilters({...filters, project:e.target.value})}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          {(filters.status || filters.priority || filters.project || filters.search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status:'', priority:'', project:'', search:'' })}>Clear</button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineClipboardList /></div>
            <h3>No tasks found</h3>
            <p>{tasks.length === 0 ? 'No tasks have been assigned yet' : 'Try adjusting your filters'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table style={{ tableLayout:'fixed', width:'100%' }}>
              <colgroup>
                <col style={{ width:'25%' }} />
                <col style={{ width:'18%' }} />
                <col style={{ width:'20%' }} />
                <col style={{ width:'12%' }} />
                <col style={{ width:'12%' }} />
                <col style={{ width:'13%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t._id} style={{ cursor:'pointer', animation:`fadeInUp 0.3s ease-out ${i*30}ms both` }} onClick={() => navigate(`/tasks/${t._id}`)}>
                    <td style={{ color:'var(--text-primary)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</td>
                    <td style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{t.project?.title || '—'}</td>
                    <td>
                      {t.assignedTo ? (
                        <div style={{ display:'flex', alignItems:'center', gap:6, overflow:'hidden' }}>
                          <div className="user-avatar" style={{ width:24, height:24, fontSize:'0.6rem', flexShrink:0 }}>
                            {t.assignedTo.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
                          </div>
                          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.assignedTo.name}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td><span className={`badge ${getPriorityBadge(t.priority)}`}>{capitalize(t.priority)}</span></td>
                    <td><span className={`badge ${getStatusBadge(t.status)}`}>{capitalize(t.status)}</span></td>
                    <td style={{ color: t.isOverdue ? 'var(--danger-400)' : 'inherit' }}>
                      {formatDate(t.dueDate)}{t.isOverdue && ' ⚠'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop:12, fontSize:'var(--font-xs)', color:'var(--text-muted)' }}>
          Showing {filtered.length} of {tasks.length} tasks
        </div>
      </div>
    </>
  );
}
