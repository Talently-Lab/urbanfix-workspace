import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/UserContext";

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;