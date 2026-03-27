type SkeletonProps = {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
};

export function Skeleton({ width, height, className = '', rounded = false }: SkeletonProps) {
  return (
    <span
      className={`skeleton ${rounded ? 'skeleton-rounded' : ''} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <article className="product-card skeleton-card" aria-hidden="true">
      <div className="product-body store-product-body">
        <div className="store-product-meta-top">
          <Skeleton width="80px" height="22px" rounded />
        </div>
        <div className="store-product-media-shell">
          <Skeleton className="product-media" height="200px" />
        </div>
        <div className="product-title-row store-product-title-row">
          <Skeleton width="70%" height="20px" rounded />
        </div>
        <Skeleton width="90px" height="22px" rounded />
      </div>
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <article className="preview-card events-card skeleton-card" aria-hidden="true">
      <Skeleton className="product-media" height="180px" />
      <div className="product-body">
        <div className="product-title-row">
          <Skeleton width="75%" height="20px" rounded />
          <Skeleton width="60px" height="22px" rounded />
        </div>
        <Skeleton width="100%" height="16px" rounded />
        <Skeleton width="80%" height="16px" rounded />
        <div className="events-meta-list">
          <Skeleton width="120px" height="16px" rounded />
          <Skeleton width="90px" height="16px" rounded />
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EventGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="events-card-grid">
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
