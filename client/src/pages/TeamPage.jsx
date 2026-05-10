import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getInitials, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineMail, HiOutlineCalendar } from 'react-icons/hi';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teams')
      .then(r => setMembers(r.data))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content" style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner spinner-lg" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Team Members</h1>
        <span style={{ color:'var(--text-muted)', fontSize:'var(--font-sm)' }}>{members.length} members</span>
      </div>
      <div className="page-content">
        {members.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineUserGroup /></div>
            <h3>No team members</h3>
            <p>Register users to see them here</p>
          </div>
        ) : (
          <div className="projects-grid">
            {members.map((m, i) => (
              <div className="card animate-fade-in-up" key={m._id} style={{ animationDelay:`${i*60}ms`, display:'flex', alignItems:'center', gap:'var(--space-md)' }}>
                <div className="user-avatar" style={{ width:48, height:48, fontSize:'1rem' }}>{getInitials(m.name)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:'var(--font-md)', marginBottom:2 }}>{m.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'var(--font-sm)', color:'var(--text-secondary)', marginBottom:4 }}>
                    <HiOutlineMail style={{ flexShrink:0 }} /> <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.email}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span className={`badge ${m.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>{m.role}</span>
                    <span style={{ fontSize:'var(--font-xs)', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                      <HiOutlineCalendar /> Joined {formatDate(m.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
