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
import HomePage from '../HomePage';
import type { HomeContent } from '../../types/siteContent';

export default function AdminHomePreviewPage() {
  const { branding } = useBranding();
  const { content } = useSiteContent();
  const { products } = useProductCatalog();
  const previewHome = useAdminDraftPreviewValue<HomeContent>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.home,
    sourceValue: content.home,
    sanitizeDraft: (candidate) =>
      mergeSiteContent({ home: candidate as Partial<HomeContent> }).home,
  });

  const previewContent = useMemo(
    () => ({
      ...content,
      home: previewHome,
    }),
    [content, previewHome]
  );

  return (
    <BrandingPreviewProvider branding={branding}>
      <SiteContentPreviewProvider content={previewContent}>
        <ProductCatalogPreviewProvider products={products}>
          <PreviewCartProvider>
            <div className="admin-preview-route">
              <div className="admin-preview-banner">
                Preview ao vivo da Home. As alteracoes desta tela so vao para o site ao salvar.
              </div>
              <PublicShell>
                <HomePage />
              </PublicShell>
            </div>
          </PreviewCartProvider>
        </ProductCatalogPreviewProvider>
      </SiteContentPreviewProvider>
    </BrandingPreviewProvider>
  );
}
