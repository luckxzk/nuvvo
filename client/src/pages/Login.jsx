import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="auth-logo">
          <Logo size={44} />
          <h1>NUVVO</h1>
        </div>
        <p className="auth-subtitle">Entre para continuar sua experiência.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="input"
            placeholder="E-mail ou username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
          />
          <input
            className="input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin-icon" /> : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </motion.div>
    </div>
  );
}
