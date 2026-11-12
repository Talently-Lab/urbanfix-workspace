import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProtectedRouteAccess } from './protectedRouteAccess';
import { LoadingIndicator } from './DashboardState.js';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  const access = getProtectedRouteAccess({ loading, user, allowedRole });

  if (access.type === 'loading') {
    return (
      <LoadingIndicator
        label="Restaurando sesión..."
        className="min-h-screen justify-center text-urban-principal"
      />
    );
  }

  if (access.type === 'redirect') {
    return <Navigate to={access.to} replace />;
  }

  return children;
}

export default ProtectedRoute;