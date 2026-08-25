import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { PostSkeleton, EmptyState } from '../components/UI';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/posts/feed')
      .then(({ data }) => setPosts(data.posts))
      .finally(() => setLoading(false));

    const handleCreated = (e) => setPosts((prev) => [e.detail, ...prev]);
    window.addEventListener('nuvvo:post-created', handleCreated);
    return () => window.removeEventListener('nuvvo:post-created', handleCreated);
  }, []);

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="feed-page">
      <h2 className="page-title">Início</h2>
      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Seu feed está vazio."
          subtitle={
            <>
              Siga outras pessoas para ver publicações aqui, ou{' '}
              <Link to="/explore" className="empty-link">
                explore a NUVVO
              </Link>
              .
            </>
          }
        />
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} onDeleted={handleDeleted} />)
      )}
    </div>
  );
}
