import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/UserContext";
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuthContext();
    if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children; // deja entrar
}
export default ProtectedRoute;