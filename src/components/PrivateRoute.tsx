import { Navigate, useLocation } from 'react-router-dom';

export function PrivateRoute({ children, allowedRoles, loading }: {
  children: React.JSX.Element
  allowedRoles: string[],
  loading: boolean,
}) {
  const location = useLocation();
  if (loading) return <p>Cargando...</p>; // O spinner
  const userRole = localStorage.getItem('userRole');

  if (!userRole || !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
