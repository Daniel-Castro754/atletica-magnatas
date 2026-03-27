import { Navigate, Outlet, useLocation } from 'react-router-dom';
import UserNotRegisteredError from '../components/UserNotRegisteredError';
import { useAuth } from '../lib/AuthContext';

function FullScreenLoader() {
  return (
    <div className="loader-shell" aria-label="Carregando autenticacao">
      <div className="loader" />
    </div>
  );
}

export default function ProtectedAdminRoute() {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return <FullScreenLoader />;
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (authError?.type === 'auth_required') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
