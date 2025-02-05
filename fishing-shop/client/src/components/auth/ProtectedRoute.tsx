import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '../../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const authToken = getAuthToken();

  if (!authToken) {
    // Token is either missing or expired, redirect to login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 