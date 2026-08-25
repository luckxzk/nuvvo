import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Grid3x3, PlayCircle, FileText, Loader2, MessageCircle } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Avatar, VerifiedBadge, EmptyState, GridSkeleton } from '../components/UI';
import { useAuth } from '../services/AuthContext';
import EditProfileModal from '../components/EditProfileModal';
import PostDetailModal from '../components/PostDetailModal';

function FollowListModal({ username, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/users/${username}/${type}`)
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, [username, type]);

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>{type === 'followers' ? 'Seguidores' : 'Seguindo'}</h3>
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="comments-list">
            {loading ? (
              <div className="center-pad">
                <Loader2 className="spin-icon" size={22} />
              </div>
            ) : users.length === 0 ? (
              <EmptyState title={type === 'followers' ? 'Nenhum seguidor ainda.' : 'Não segue ninguém ainda.'} />
            ) : (
              users.map((u) => (
                <Link to={`/profile/${u.username}`} key={u._id} className="search-result-row" onClick={onClose}>
                  <Avatar src={u.avatar} name={u.name} size={40} />
                  <div>
                    <span className="search-result-username">
                      {u.username}
                      {u.verified && <VerifiedBadge />}
                    </span>
                    <span className="search-result-name">{u.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [followModal, setFollowModal] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const isOwn = me?.username === username;

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get(`/users/${username}`), api.get(`/users/${username}/posts`)])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data.user);
        setPosts(postsRes.data.posts);
      })
      .catch((err) => alert(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const isFollowing = profile?.followers?.includes(me?.id);

  const handleFollow = async () => {
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await api.post(`/users/${username}/unfollow`);
        setProfile((p) => ({ ...p, followers: p.followers.filter((id) => id !== me.id), followersCount: p.followersCount - 1 }));
      } else {
        await api.post(`/users/${username}/follow`);
        setProfile((p) => ({ ...p, followers: [...p.followers, me.id], followersCount: p.followersCount + 1 }));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setFollowBusy(false);
    }
  };

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  if (loading) {
    return (
      <div className="profile-page">
        <GridSkeleton count={3} />
      </div>
    );
  }
  if (!profile) return <EmptyState title="Usuário não encontrado." />;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Avatar src={profile.avatar} name={profile.name} size={100} />
        <div className="profile-info">
          <div className="profile-top-row">
            <span className="profile-username">
              {profile.username}
              {profile.verified && <VerifiedBadge size={18} />}
            </span>
            {isOwn ? (
              <button className="btn btn-secondary" onClick={() => setEditOpen(true)}>
                Editar perfil
              </button>
            ) : (
              <>
                <button className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`} onClick={handleFollow} disabled={followBusy}>
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
                <Link to={`/messages/${profile.username}`} className="icon-btn">
                  <MessageCircle size={20} />
                </Link>
              </>
            )}
            {isOwn && (
              <Link to="/settings" className="icon-btn">
                <Settings size={20} />
              </Link>
            )}
          </div>

          <div className="profile-stats">
            <span>
              <strong>{posts.length}</strong> publicações
            </span>
            <button onClick={() => setFollowModal('followers')}>
              <strong>{profile.followersCount}</strong> seguidores
            </button>
            <button onClick={() => setFollowModal('following')}>
              <strong>{profile.followingCount}</strong> seguindo
            </button>
          </div>

          <p className="profile-name">{profile.name}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        </div>
      </div>

      <div className="profile-grid-header">
        <Grid3x3 size={16} />
        <span>Publicações</span>
      </div>

      {posts.length === 0 ? (
        <EmptyState title="Nenhuma publicação ainda." />
      ) : (
        <div className="explore-grid">
          {posts.map((post) => (
            <ProfileGridItem key={post._id} post={post} isOwn={isOwn} onDeleted={handleDeleted} onOpen={() => setSelectedPost(post)} />
          ))}
        </div>
      )}

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      {followModal && <FollowListModal username={username} type={followModal} onClose={() => setFollowModal(null)} />}
      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
}

function ProfileGridItem({ post, onOpen }) {
  return (
    <button className="explore-item" onClick={onOpen}>
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
  );
}
