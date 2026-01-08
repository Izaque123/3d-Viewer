import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaUsers, FaSignOutAlt } from 'react-icons/fa';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Odonto3D</h1>
          <nav className="nav">
            <button
              className={`nav-button ${location.pathname.includes('/pacientes') ? 'active' : ''}`}
              onClick={() => navigate('/pacientes')}
            >
              <FaUsers /> Pacientes
            </button>
          </nav>
          <div className="user-menu">
            <span className="user-name">{usuario?.nome}</span>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

