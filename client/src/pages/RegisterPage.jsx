import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineUser, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div className="sidebar-logo-icon">
            <HiOutlineClipboardList />
          </div>
          <span className="sidebar-logo" style={{ fontSize: '1.25rem' }}>Team Task Management</span>
        </div>
        <h1>Create Account</h1>
        <p className="subtitle">Join your team and start collaborating</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 40 }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 40 }}
                autoComplete="new-password"
              />
            </div>
            {password && (() => {
              const rules = [
                { label: 'At least 6 characters', met: password.length >= 6 },
                { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
                { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
                { label: 'Number (0-9)', met: /[0-9]/.test(password) },
                { label: 'Special character (!@#$...)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
              ];
              const metCount = rules.filter(r => r.met).length;
              const strength = metCount <= 2 ? 'Weak' : metCount <= 3 ? 'Fair' : metCount <= 4 ? 'Good' : 'Strong';
              const strengthColor = metCount <= 2 ? 'var(--danger-400)' : metCount <= 3 ? '#f59e0b' : metCount <= 4 ? 'var(--blue-500)' : 'var(--accent-400)';
              const strengthPercent = (metCount / rules.length) * 100;
              return (
                <div style={{ marginTop: 10 }}>
                  {/* Strength bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--bg-input)' }}>
                      <div style={{ width: `${strengthPercent}%`, height: '100%', borderRadius: 4, background: strengthColor, transition: 'all 0.3s ease' }} />
                    </div>
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: strengthColor, minWidth: 40 }}>{strength}</span>
                  </div>
                  {/* Requirements checklist */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                    {rules.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-xs)', color: r.met ? 'var(--accent-400)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                        <span style={{ fontSize: '0.7rem' }}>{r.met ? '✓' : '✗'}</span>
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="member">Team Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <div className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
