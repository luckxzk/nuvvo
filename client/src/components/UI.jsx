import { BadgeCheck, Inbox } from 'lucide-react';

export function Avatar({ src, name, size = 40 }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return src ? (
    <img
      src={src}
      alt={name}
      className="avatar"
      style={{ width: size, height: size, minWidth: size }}
    />
  ) : (
    <div className="avatar avatar-fallback" style={{ width: size, height: size, minWidth: size, fontSize: size * 0.4 }}>
      {initial}
    </div>
  );
}

export function VerifiedBadge({ size = 14 }) {
  return <BadgeCheck size={size} className="verified-badge" strokeWidth={2.4} />;
}

export function EmptyState({ title, subtitle, icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <Icon size={32} strokeWidth={1.5} />
      <p className="empty-title">{title}</p>
      {subtitle && <p className="empty-subtitle">{subtitle}</p>}
    </div>
  );
}

export function Spinner({ size = 20 }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

export function PostSkeleton() {
  return (
    <div className="card post-card skeleton-card">
      <div className="post-header">
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-line" style={{ width: '35%' }} />
          <div className="skeleton skeleton-line" style={{ width: '20%', marginTop: 6 }} />
        </div>
      </div>
      <div className="skeleton skeleton-block" />
    </div>
  );
}

export function GridSkeleton({ count = 9 }) {
  return (
    <div className="explore-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-square" />
      ))}
    </div>
  );
}
