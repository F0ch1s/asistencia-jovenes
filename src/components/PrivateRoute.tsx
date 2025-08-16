import { Navigate, useLocation } from 'react-router-dom';
import '../styles/LoadingScreen.css';

export function PrivateRoute({
  children,
  allowedRoles,
}: {
  children: React.JSX.Element;
  allowedRoles: string[];
}) {
  const location = useLocation();

  const userRole = localStorage.getItem('userRole');

  if (!userRole || !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
