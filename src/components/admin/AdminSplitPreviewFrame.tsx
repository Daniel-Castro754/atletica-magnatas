import { ExternalLink, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

type AdminSplitPreviewFrameProps = {
  title: string;
  description: string;
  src: string;
};

export default function AdminSplitPreviewFrame({
  title,
  description,
  src,
}: AdminSplitPreviewFrameProps) {
  const [frameKey, setFrameKey] = useState(0);

  return (
    <aside className="card admin-live-preview-panel">
      <div className="admin-live-preview-head">
        <div>
          <p className="kicker">Preview ao vivo</p>
          <h3 className="section-title">{title}</h3>
          <p className="muted">{description}</p>
        </div>

        <div className="admin-live-preview-actions">
          <button
            type="button"
            className="button button-outline"
            onClick={() => setFrameKey((currentKey) => currentKey + 1)}
          >
            <RefreshCcw size={16} />
            Atualizar preview
          </button>

          <a
            className="button button-outline"
            href={src}
            target="_blank"
            rel="noreferrer"
          >
            Abrir preview
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <div className="admin-live-preview-frame-shell">
        <iframe
          key={frameKey}
          title={title}
          src={src}
          className="admin-live-preview-frame"
        />
      </div>
    </aside>
  );
}
