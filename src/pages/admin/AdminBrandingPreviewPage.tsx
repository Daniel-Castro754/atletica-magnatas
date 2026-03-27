import { PreviewCartProvider, PublicShell } from '../../components/layout/AppLayout';
import { ADMIN_DRAFT_STORAGE_KEYS, useAdminDraftPreviewValue } from '../../lib/adminPreview';
import { mergeBrandingConfig } from '../../lib/branding';
import { BrandingPreviewProvider, useBranding } from '../../lib/BrandingContext';
import {
  ProductCatalogPreviewProvider,
  useProductCatalog,
} from '../../lib/ProductCatalogContext';
import {
  SiteContentPreviewProvider,
  useSiteContent,
} from '../../lib/SiteContentContext';
import HomePage from '../HomePage';
import type { BrandingConfig } from '../../types/branding';

export default function AdminBrandingPreviewPage() {
  const { branding } = useBranding();
  const { content } = useSiteContent();
  const { products } = useProductCatalog();
  const previewBranding = useAdminDraftPreviewValue<BrandingConfig>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.branding,
    sourceValue: branding,
    sanitizeDraft: (candidate) => mergeBrandingConfig(candidate as Partial<BrandingConfig>),
  });

  return (
    <BrandingPreviewProvider branding={previewBranding}>
      <SiteContentPreviewProvider content={content}>
        <ProductCatalogPreviewProvider products={products}>
          <PreviewCartProvider>
            <div className="admin-preview-route">
              <div className="admin-preview-banner">
                Preview ao vivo da aparencia. A marca e as cores abaixo ainda nao foram publicadas.
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
