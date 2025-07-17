import { Navigate, useLocation } from 'react-router-dom';
import '../styles/LoadingScreen.css';

export function PrivateRoute({
  children,
  allowedRoles,
  loading,
}: {
  children: React.JSX.Element;
  allowedRoles: string[];
  loading: boolean;
}) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ marginTop: '1rem' }}>Cargando...</p>
      </div>
    );
  }

  const userRole = localStorage.getItem('userRole');

  if (!userRole || !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
