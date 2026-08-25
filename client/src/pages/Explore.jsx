import { useEffect, useState } from 'react';
import { PlayCircle, FileText } from 'lucide-react';
import api from '../services/api';
import { GridSkeleton, EmptyState } from '../components/UI';
import PostDetailModal from '../components/PostDetailModal';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    api
      .get('/posts/explore')
      .then(({ data }) => setPosts(data.posts))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="explore-page">
      <h2 className="page-title">Explorar</h2>
      {loading ? (
        <GridSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState title="Nenhuma publicação ainda." subtitle="Volte em breve para ver novidades." />
      ) : (
        <div className="explore-grid">
          {posts.map((post) => (
            <button className="explore-item" key={post._id} onClick={() => setSelectedPost(post)}>
              {post.type === 'photo' && <img src={post.content} alt="" loading="lazy" />}
              {post.type === 'video' && (
                <>
                  <video src={post.content} muted playsInline preload="metadata" />
                  <PlayCircle className="explore-icon" size={22} />
                </>
              )}
              {post.type === 'text' && (
                <div className="explore-text">
                  <FileText size={18} />
                  <p>{post.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
}

