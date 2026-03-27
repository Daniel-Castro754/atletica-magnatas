import { useBranding } from '../../lib/BrandingContext';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
};

export default function BrandLogo({ className = '', imageClassName = '' }: BrandLogoProps) {
  const { resolvedBranding } = useBranding();

  return (
    <span className={className}>
      <img
        src={resolvedBranding.logoUrl}
        alt={`Logo ${resolvedBranding.siteName}`}
        className={imageClassName}
      />
    </span>
  );
}

