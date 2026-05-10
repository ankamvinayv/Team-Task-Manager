import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { capitalize, formatRelative, getStatusBadge, getPriorityBadge } from '../utils/helpers';
import {
  HiOutlineFolder, HiOutlineClipboardList, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlineClock, HiOutlineTrendingUp,
} from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#10b981'];
const PRIORITY_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content" style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner spinner-lg" /></div>;
  if (!data) return null;

  const stats = [
    { label: 'Total Projects', value: data.totalProjects, icon: <HiOutlineFolder />, color: 'purple' },
    { label: 'Total Tasks', value: data.totalTasks, icon: <HiOutlineClipboardList />, color: 'blue' },
    { label: 'Completed', value: data.completedTasks, icon: <HiOutlineCheckCircle />, color: 'green' },
    { label: 'Overdue', value: data.overdueTasks, icon: <HiOutlineExclamationCircle />, color: 'red' },
  ];

  const Tip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return <div style={{ background:'var(--bg-tooltip)', border:'1px solid var(--border-default)', borderRadius:8, padding:'8px 12px', fontSize:'0.8125rem' }}><span style={{ color:'#f1f5f9' }}>{payload[0].name}: <strong>{payload[0].value}</strong></span></div>;
  };

  return (
    <>
      <div className="page-header"><div><h1>Dashboard</h1><p style={{ color:'var(--text-secondary)', fontSize:'var(--font-sm)', marginTop:2 }}>Welcome back, {user?.name}</p></div></div>
      <div className="page-content">
        <div className="stats-grid">{stats.map((s,i) => <div className="stat-card" key={i}><div className={`stat-icon ${s.color}`}>{s.icon}</div><div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div></div>)}</div>

        <div className="grid-2" style={{ marginBottom:'var(--space-xl)' }}>
          <div className="chart-card animate-fade-in-up">
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><HiOutlineClock style={{ color:'var(--primary-400)' }} />Tasks by Status</h3>
            {data.totalTasks === 0 ? <div className="empty-state"><p>No tasks yet</p></div> :
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={data.tasksByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">{data.tasksByStatus.map((_,i) => <Cell key={i} fill={STATUS_COLORS[i%3]} />)}</Pie><Tooltip content={<Tip />} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'0.75rem' }} /></PieChart>
            </ResponsiveContainer>}
          </div>
          <div className="chart-card animate-fade-in-up" style={{ animationDelay:'100ms' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><HiOutlineTrendingUp style={{ color:'var(--accent-400)' }} />Tasks by Priority</h3>
            {data.totalTasks === 0 ? <div className="empty-state"><p>No tasks yet</p></div> :
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.tasksByPriority} barSize={36}><XAxis dataKey="name" tick={{ fill:'var(--text-secondary)', fontSize:12 }} axisLine={{ stroke:'rgba(255,255,255,0.08)' }} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill:'var(--text-secondary)', fontSize:12 }} axisLine={false} tickLine={false} /><Tooltip content={<Tip />} /><Bar dataKey="value" radius={[6,6,0,0]}>{data.tasksByPriority.map((_,i) => <Cell key={i} fill={PRIORITY_COLORS[i%3]} />)}</Bar></BarChart>
            </ResponsiveContainer>}
          </div>
        </div>

        <div className="chart-card animate-fade-in-up" style={{ animationDelay:'200ms' }}>
          <h3 style={{ marginBottom:'var(--space-md)', display:'flex', alignItems:'center', gap:8 }}><HiOutlineClock style={{ color:'var(--primary-400)' }} />Recent Activity</h3>
          {data.recentActivity.length === 0 ? <div className="empty-state"><p>No recent activity</p></div> :
          <div className="table-container"><table><thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Updated</th></tr></thead><tbody>
            {data.recentActivity.map(t => <tr key={t._id} style={{ cursor:'pointer' }} onClick={() => navigate(`/tasks/${t._id}`)}>
              <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{t.title}</td>
              <td>{t.project?.title || '—'}</td>
              <td><span className={`badge ${getStatusBadge(t.status)}`}>{capitalize(t.status)}</span></td>
              <td><span className={`badge ${getPriorityBadge(t.priority)}`}>{capitalize(t.priority)}</span></td>
              <td>{formatRelative(t.updatedAt)}</td>
            </tr>)}
          </tbody></table></div>}
        </div>
      </div>
    </>
  );
}
