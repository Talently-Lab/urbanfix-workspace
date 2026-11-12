import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Si no está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si tiene un rol diferente al permitido
  if (user.role !== allowedRole) {
    if (user.role === "technician") {
      return <Navigate to="/technician/dashboard" replace />;
    }

    if (user.role === "client") {
      return <Navigate to="/client/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;