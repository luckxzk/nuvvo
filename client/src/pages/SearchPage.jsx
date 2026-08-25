import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Avatar, VerifiedBadge, EmptyState } from '../components/UI';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .get('/users/search', { params: { q: query.trim() } })
        .then(({ data }) => {
          setResults(data.users);
          setSearched(true);
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="search-page">
      <h2 className="page-title">Pesquisar</h2>
      <div className="search-input-wrap">
        <Search size={18} />
        <input
          className="input"
          placeholder="Pesquisar por username ou nome"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <Loader2 size={16} className="spin-icon" />}
      </div>

      {searched && results.length === 0 && !loading && (
        <EmptyState title="Nenhum usuário encontrado." subtitle="Tente pesquisar por outro termo." />
      )}

      <div className="search-results">
        {results.map((u) => (
          <Link to={`/profile/${u.username}`} key={u._id} className="search-result-row">
            <Avatar src={u.avatar} name={u.name} size={44} />
            <div>
              <span className="search-result-username">
                {u.username}
                {u.verified && <VerifiedBadge />}
              </span>
              <span className="search-result-name">{u.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
