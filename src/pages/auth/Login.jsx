import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (initialized && accessToken && !isSubmitting) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [initialized, accessToken, isSubmitting, navigate, location]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials(response));

      const user = response.user || response;
      let redirectPath = user.mustChangePassword
        ? '/force-password-change'
        : (location.state?.from?.pathname || getRedirectPath(user, location));

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setIsSubmitting(false);
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">

      {/* Left Side: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-lg w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-bold uppercase tracking-widest border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => navigate('/')}
            >
              <ChevronLeft size={14} />
              Return to Home
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <Activity className="text-white h-10 w-10" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">MediBridge</h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-black text-white leading-tight">
                Secure Portal <br />
                <span className="text-indigo-400">Authorized Access Only.</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                Enter your credentials to access the MediBridge intelligence cluster. Your session is protected by bank-grade encryption protocols.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Cloud Infrastructure', value: 'High Availability' },
                { label: 'Security Protocol', value: 'AES-256 Bit' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-lg font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800">
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Trusted by 1.2k+ Medical Experts
              </p>
            </div>
          </motion.div>
        </div>

        {/* Floating Abstract Mesh */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-white/5 rounded-full scale-110 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-white/5 rounded-full scale-125 animate-reverse-spin-slow" />
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-24 bg-white relative">
        <div className="max-w-md w-full mx-auto space-y-10">

          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h3>
              <p className="text-slate-500 font-medium">Welcome back to MediBridge intelligence.</p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Email/Username */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2 block">Identity</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register('emailOrUsername')}
                    type="text"
                    placeholder="Email or Username"
                    className={`w-full bg-slate-50 border-2 ${errors.emailOrUsername ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                  />
                </div>
                {errors.emailOrUsername && (
                  <p className="mt-2 text-xs font-bold text-red-500 tracking-tight">{errors.emailOrUsername.message}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest block">Access Key</label>
                  <button
                    type="button"
                    className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 tracking-widest"
                    onClick={() => {/* TODO: Implement Forgot Password */ }}
                  >
                    Forgot Access?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    className={`w-full bg-slate-50 border-2 ${errors.password ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <span className="text-[10px] font-black uppercase">Hide</span> : <span className="text-[10px] font-black uppercase">Show</span>}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs font-bold text-red-500 tracking-tight">{errors.password.message}</p>
                )}
              </motion.div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <p className="text-sm font-bold text-red-700">
                    {error?.data?.message || 'Identity verification failed. Please try again.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Initialize Session
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="flex flex-col items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-px w-10 bg-slate-200"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Identity Provisioning</span>
                  <div className="h-px w-10 bg-slate-200"></div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    Encrypted
                  </div>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-2 text-indigo-600 text-sm font-black hover:text-indigo-700 transition-colors"
                  >
                    <UserPlus size={16} />
                    Register as Patient
                  </button>
                </div>
              </div>
            </motion.div>
          </form>

          {/* Footer Branding */}
          <div className="pt-10 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">
            <span>© 2026 MediBridge IQ</span>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-slate-600">Privacy</span>
              <span className="cursor-pointer hover:text-slate-600">Terms</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
