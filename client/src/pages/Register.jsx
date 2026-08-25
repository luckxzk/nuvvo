import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
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
        <p className="auth-subtitle">Crie sua conta e comece a compartilhar.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input className="input" placeholder="Nome completo" value={form.name} onChange={handleChange('name')} />
          <input className="input" placeholder="Username" value={form.username} onChange={handleChange('username')} />
          <input className="input" type="email" placeholder="E-mail" value={form.email} onChange={handleChange('email')} />
          <input
            className="input"
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={form.password}
            onChange={handleChange('password')}
          />
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin-icon" /> : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
}
