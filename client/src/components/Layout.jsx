import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, PlusSquare, Bell, User, Settings, Search, LogOut, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';
import { Avatar } from './UI';
import CreatePostModal from './CreatePostModal';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const handleOpenCreate = () => setCreateOpen(true);
  const handleCreated = () => {
    if (location.pathname !== '/') navigate('/');
  };

  const isMessagesRoute = location.pathname.startsWith('/messages');
  const isChatThreadOpen = /^\/messages\/[^/]+$/.test(location.pathname);

  useEffect(() => {
    let active = true;
    api
      .get('/notifications')
      .then(({ data }) => {
        if (active) setUnread(data.notifications.filter((n) => !n.read).length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { to: '/', icon: Home, label: 'Início', end: true },
    { to: '/explore', icon: Compass, label: 'Explorar' },
    { to: '/search', icon: Search, label: 'Pesquisar' },
    { to: '/messages', icon: MessageCircle, label: 'Mensagens' },
    { to: '/notifications', icon: Bell, label: 'Notificações', badge: unread },
    { to: `/profile/${user?.username}`, icon: User, label: 'Perfil' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`app-shell ${isMessagesRoute ? 'app-shell--chat' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={30} />
          <span>NUVVO</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon-wrap">
                <item.icon size={22} strokeWidth={2} />
                {!!item.badge && <span className="badge-dot" />}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button className="sidebar-link create-btn" onClick={() => setCreateOpen(true)}>
            <PlusSquare size={22} strokeWidth={2} />
            <span>Criar</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout}>
            <LogOut size={20} strokeWidth={2} />
            <span>Sair</span>
          </button>
          {user && (
            <div className="sidebar-user" onClick={() => navigate(`/profile/${user.username}`)}>
              <Avatar src={user.avatar} name={user.name} size={34} />
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-username">@{user.username}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {!isChatThreadOpen && (
        <header className="topbar-mobile">
          <Logo size={24} />
          <span>NUVVO</span>
        </header>
      )}

      <main className={`main-content ${isMessagesRoute ? 'main-content--full' : ''}`}>
        <Outlet />
      </main>

      {!isChatThreadOpen && (
        <nav className="mobile-nav">
          <NavLink to="/" end className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
            <Home size={22} strokeWidth={2} />
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
            <Compass size={22} strokeWidth={2} />
          </NavLink>
          <button className="mobile-link" onClick={() => setCreateOpen(true)}>
            <PlusSquare size={22} strokeWidth={2} />
          </button>
          <NavLink to="/messages" className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
            <MessageCircle size={22} strokeWidth={2} />
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon-wrap">
              <Bell size={22} strokeWidth={2} />
              {!!unread && <span className="badge-dot" />}
            </span>
          </NavLink>
          <NavLink
            to={`/profile/${user?.username}`}
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
          >
            <Avatar src={user?.avatar} name={user?.name} size={24} />
          </NavLink>
        </nav>
      )}

      {createOpen && <CreatePostModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />}
    </div>
  );
}
