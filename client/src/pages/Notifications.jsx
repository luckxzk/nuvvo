import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import api from '../services/api';
import { Avatar, EmptyState } from '../components/UI';
import { timeAgo } from '../services/format';

const ICONS = { follow: UserPlus, like: Heart, comment: MessageCircle };
const LABELS = {
  follow: 'começou a seguir você.',
  like: 'curtiu sua publicação.',
  comment: 'comentou na sua publicação.',
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/notifications')
      .then(({ data }) => setItems(data.notifications))
      .finally(() => setLoading(false));
    api.put('/notifications/read').catch(() => {});
  }, []);

  return (
    <div className="notifications-page">
      <h2 className="page-title">Notificações</h2>
      {!loading && items.length === 0 ? (
        <EmptyState icon={Bell} title="Nenhuma notificação ainda." subtitle="Curtidas, comentários e novos seguidores aparecerão aqui." />
      ) : (
        <div className="notif-list">
          {items.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <Link to={`/profile/${n.sender?.username}`} key={n._id} className={`notif-row ${!n.read ? 'unread' : ''}`}>
                <Avatar src={n.sender?.avatar} name={n.sender?.name} size={40} />
                <div className="notif-icon-badge">
                  <Icon size={12} />
                </div>
                <p>
                  <span className="notif-username">{n.sender?.username}</span> {LABELS[n.type]}
                </p>
                <span className="notif-time">{timeAgo(n.createdAt)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
