import { useMemo } from 'react';
import { PreviewCartProvider, PublicShell } from '../../components/layout/AppLayout';
import { ADMIN_DRAFT_STORAGE_KEYS, useAdminDraftPreviewValue } from '../../lib/adminPreview';
import { BrandingPreviewProvider, useBranding } from '../../lib/BrandingContext';
import {
  ProductCatalogPreviewProvider,
  useProductCatalog,
} from '../../lib/ProductCatalogContext';
import { mergeSiteContent } from '../../lib/siteContent';
import {
  SiteContentPreviewProvider,
  useSiteContent,
} from '../../lib/SiteContentContext';
import AboutPage from '../AboutPage';
import type { MagnatasContent } from '../../types/siteContent';

export default function AdminMagnatasPreviewPage() {
  const { branding } = useBranding();
  const { content } = useSiteContent();
  const { products } = useProductCatalog();
  const previewMagnatas = useAdminDraftPreviewValue<MagnatasContent>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.magnatas,
    sourceValue: content.magnatas,
    sanitizeDraft: (candidate) =>
      mergeSiteContent({ magnatas: candidate as Partial<MagnatasContent> }).magnatas,
  });

  const previewContent = useMemo(
    () => ({
      ...content,
      magnatas: previewMagnatas,
    }),
    [content, previewMagnatas]
  );

  return (
    <BrandingPreviewProvider branding={branding}>
      <SiteContentPreviewProvider content={previewContent}>
        <ProductCatalogPreviewProvider products={products}>
          <PreviewCartProvider>
            <div className="admin-preview-route">
              <div className="admin-preview-banner">
                Preview ao vivo da pagina institucional. O site publico so muda depois do salvamento.
              </div>
              <PublicShell>
                <AboutPage />
              </PublicShell>
            </div>
          </PreviewCartProvider>
        </ProductCatalogPreviewProvider>
      </SiteContentPreviewProvider>
    </BrandingPreviewProvider>
  );
}
