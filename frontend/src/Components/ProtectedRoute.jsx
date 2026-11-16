
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const rutasPorRol = {
  CLIENTE: "/Client/dashboard",
  CLIENT: "/Client/dashboard",
  TECNICO: "/Technician/dashboard",
  TECHNICIAN: "/Technician/dashboard",
  ADMINISTRADOR: "/ADMINISTRADOR/dashboard",
  ADMIN: "/ADMINISTRADOR/dashboard",
};

function normalizarRol(user) {
  return String(user?.rol ?? user?.role ?? "")
    .trim()
    .toUpperCase();
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Si no hay usuario autenticado
  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  const rolUsuario = normalizarRol(user);
  const rolPermitido = String(allowedRole)
    .trim()
    .toUpperCase();

  // Permitir los nombres equivalentes de cada rol
  const equivalencias = {
    CLIENT: "CLIENTE",
    CLIENTE: "CLIENTE",
    TECHNICIAN: "TECNICO",
    TECNICO: "TECNICO",
    ADMIN: "ADMINISTRADOR",
    ADMINISTRADOR: "ADMINISTRADOR",
  };

  const rolActualNormalizado =
    equivalencias[rolUsuario] || rolUsuario;

  const rolEsperadoNormalizado =
    equivalencias[rolPermitido] || rolPermitido;

  // Si el rol no coincide, redirigir a su propio dashboard
  if (rolActualNormalizado !== rolEsperadoNormalizado) {
    const ruta = rutasPorRol[rolUsuario];

    return <Navigate to={ruta || "/Login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
