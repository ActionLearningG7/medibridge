/**
 * Login Page
 * Handles user authentication with role-based routing
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../../features/auth/authApi';
import {
  setCredentials,
  selectAccessToken,
  selectAuthInitialized
} from '../../features/auth/authSlice';
import { getRedirectPath } from '../../utils/guards';

// Validation schema
const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const accessToken = useSelector(selectAccessToken);
  const initialized = useSelector(selectAuthInitialized);
  const [login, { isLoading, error }] = useLoginMutation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated - but NOT during active login submission
  useEffect(() => {
    if (initialized && accessToken && !isSubmitting) {
      console.log('ℹ️ Already authenticated, redirecting from login page');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [initialized, accessToken, isSubmitting, navigate, location]);

  const onSubmit = async (data) => {
    setIsSubmitting(true); // Prevent useEffect from interfering

    try {
      console.log('🔐 Attempting login...');

      const response = await login(data).unwrap();

      console.log('✓ Login successful, response:', response);
      console.log('✓ Response structure:', {
        hasUser: !!response.user,
        hasAccessToken: !!response.accessToken,
        hasRefreshToken: !!response.refreshToken,
        userRole: response.user?.role || response.role,
        userEmail: response.user?.email || response.email
      });

      // Store credentials in Redux (also persists to localStorage via reducer)
      dispatch(setCredentials(response));

      console.log('✓ Credentials stored in Redux');

      // Verify what was stored
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      console.log('✓ Stored in localStorage:', {
        hasToken: !!storedToken,
        tokenPreview: storedToken ? storedToken.substring(0, 30) + '...' : 'none',
        user: storedUser ? JSON.parse(storedUser) : null
      });

      // Get redirect path based on role
      const user = response.user || response;
      const role = user.role;
      const mustChangePassword = user.mustChangePassword;

      console.log('✓ User details:', {
        role,
        mustChangePassword,
        userId: user.id,
        email: user.email
      });

      // Determine redirect path
      let redirectPath;
      if (mustChangePassword) {
        redirectPath = '/force-password-change';
      } else {
        // Check if there's a redirect from location state
        redirectPath = location.state?.from?.pathname || getRedirectPath(user, location);
      }

      console.log(`✓ Navigating to: ${redirectPath}`);

      // Navigate immediately after credentials are stored
      navigate(redirectPath, { replace: true });

      console.log('✓ Navigate called successfully');

    } catch (err) {
      setIsSubmitting(false); // Reset on error
      console.error('✗ Login failed:', {
        status: err?.status,
        message: err?.data?.message || err?.message,
        error: err
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MediBridge
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Healthcare Management System
          </p>
          <h3 className="mt-4 text-center text-xl font-semibold text-gray-900">
            Sign in to your account
          </h3>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email/Username Field */}
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                autoComplete="username"
                {...register('emailOrUsername')}
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  errors.emailOrUsername ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email or username"
              />
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error?.data?.message || 'Invalid credentials. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {/* TODO: Implement forgot password */}}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </button>
            </div>
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {/* TODO: Implement registration */}}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Register as Patient
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; 2026 MediBridge. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
