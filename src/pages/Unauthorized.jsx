/**
 * Unauthorized Page
 * Shown when user tries to access a route they don't have permission for
 */

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../features/auth/authSlice';
import { getDefaultRouteForRole } from '../utils/guards';
import { XCircle } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const userRole = useSelector(selectUserRole);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    const defaultRoute = getDefaultRouteForRole(userRole);
    navigate(defaultRoute, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <XCircle className="h-24 w-24 text-red-500" />
        </div>

        {/* Content */}
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          {userRole && (
            <p className="mt-2 text-sm text-gray-500">
              You are logged in as: <span className="font-medium text-gray-900">{userRole}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleGoBack}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go Back
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>If you believe this is an error, please contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
