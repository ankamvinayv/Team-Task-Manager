import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInitials } from '../utils/helpers';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSun,
  HiOutlineMoon,
} from 'react-icons/hi';

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
    { to: '/projects', label: 'Projects', icon: <HiOutlineFolder /> },
    { to: '/tasks', label: 'Tasks', icon: <HiOutlineClipboardList /> },
    ...(isAdmin
      ? [{ to: '/team', label: 'Team', icon: <HiOutlineUserGroup /> }]
      : []),
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <HiOutlineClipboardList />
          </div>
          <span className="sidebar-logo">Team Task Management</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 8 }}>
            <span className="icon"><HiOutlineLogout /></span>
            Logout
          </button>
          <button className="nav-item" onClick={toggleTheme} style={{ marginTop: 4 }}>
            <span className="icon">{isDark ? <HiOutlineSun /> : <HiOutlineMoon />}</span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Mobile header */}
        <div className="mobile-header" style={{ display: 'none', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
          <span className="sidebar-logo" style={{ fontSize: '1rem' }}>Team Task Management</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
