import { Helmet } from 'react-helmet-async';

const SITE_NAME = import.meta.env.VITE_APP_NAME ?? 'Atletica Magnatas';
const DEFAULT_DESCRIPTION =
  'Site oficial da Atlética Magnatas — loja, eventos, diretoria e muito mais.';

type PageMetaProps = {
  title?: string;
  description?: string;
  imageUrl?: string;
  path?: string;
  noIndex?: boolean;
};

export function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  imageUrl,
  path,
  noIndex = false,
}: PageMetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = path ? `${window.location.origin}${path}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
}
