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

export function VerifiedBadge({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="verified-badge" aria-label="Verificado">
      <path
        fill="#1d9bf0"
        d="M12 1l2.34 2.34 3.3-.51.51 3.3L21 8.99l-1.35 3.01L21 15l-2.85 2.35-.51 3.3-3.3-.51L12 23l-2.34-2.34-3.3.51-.51-3.3L3 15l1.35-3.01L3 8.99l2.85-2.36.51-3.3 3.3.51z"
      />
         <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.5l2 2 4.3-4.7"
      />
    </svg>
  );
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
