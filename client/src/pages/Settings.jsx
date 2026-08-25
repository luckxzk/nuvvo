import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Info } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import EditProfileModal from '../components/EditProfileModal';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-page">
      <h2 className="page-title">Configurações</h2>

      <div className="settings-group">
        <button className="settings-row" onClick={() => setEditOpen(true)}>
          <User size={18} />
          <div>
            <span>Editar perfil</span>
            <small>Nome, username, bio e foto</small>
          </div>
        </button>
        <div className="settings-row">
          <Shield size={18} />
          <div>
            <span>Privacidade e segurança</span>
            <small>Sua sessão é protegida com autenticação segura</small>
          </div>
        </div>
        <div className="settings-row">
          <Info size={18} />
          <div>
            <span>Sobre a NUVVO</span>
            <small>Versão 1.0</small>
          </div>
        </div>
      </div>

      <button className="btn btn-secondary btn-block logout-btn" onClick={handleLogout}>
        <LogOut size={18} /> Sair da conta
      </button>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}
