import { useMemo } from 'react';
import { PreviewCartProvider, PublicShell } from '../../components/layout/AppLayout';
import { ADMIN_DRAFT_STORAGE_KEYS, useAdminDraftPreviewValue } from '../../lib/adminPreview';
import { BrandingPreviewProvider, useBranding } from '../../lib/BrandingContext';
import { EventsPreviewProvider, useEvents } from '../../lib/EventsContext';
import { mergeEventsPageContent } from '../../lib/events';
import EventsPage from '../EventsPage';
import type { EventsPageContent } from '../../types/events';

export default function AdminEventsPreviewPage() {
  const { branding } = useBranding();
  const { config } = useEvents();
  const previewPage = useAdminDraftPreviewValue<EventsPageContent>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.events,
    sourceValue: config.page,
    sanitizeDraft: (candidate) =>
      mergeEventsPageContent(candidate as Partial<EventsPageContent>),
  });

  const previewConfig = useMemo(
    () => ({
      ...config,
      page: previewPage,
    }),
    [config, previewPage]
  );

  return (
    <BrandingPreviewProvider branding={branding}>
      <EventsPreviewProvider config={previewConfig}>
        <PreviewCartProvider>
          <div className="admin-preview-route">
            <div className="admin-preview-banner">
              Preview ao vivo da pagina de Eventos. Os textos e a aparencia so vao para o site ao salvar.
            </div>
            <PublicShell>
              <EventsPage />
            </PublicShell>
          </div>
        </PreviewCartProvider>
      </EventsPreviewProvider>
    </BrandingPreviewProvider>
  );
}
