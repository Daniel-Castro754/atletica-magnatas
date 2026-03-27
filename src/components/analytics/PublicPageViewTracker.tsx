import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../../lib/AnalyticsContext';

export default function PublicPageViewTracker() {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
