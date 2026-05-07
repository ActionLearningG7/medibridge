import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  Activity,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

import { useChangePasswordMutation } from '../../features/auth/authApi';
import { clearForcePasswordChange, selectCurrentUser, selectUserRole } from '../../features/auth/authSlice';
import { getDefaultRouteForRole } from '../../utils/guards';

// Validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ForcePasswordChange = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);

  const [changePassword, { isLoading, error }] = useChangePasswordMutation();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      dispatch(clearForcePasswordChange());
      const defaultRoute = getDefaultRouteForRole(userRole);
      navigate(defaultRoute, { replace: true });
    } catch (err) {
      console.error('Password change failed:', err);
    }
  };

  const requirements = [
    { label: '8+ Characters', met: newPassword.length >= 8 },
    { label: 'Uppercase Letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Lowercase Letter', met: /[a-z]/.test(newPassword) },
    { label: 'Number (0-9)', met: /[0-9]/.test(newPassword) },
    { label: 'Special Character', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const strengthPercent = (metCount / requirements.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">

      {/* Left Side: Security Context (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/3 bg-indigo-900 relative items-center justify-center p-12 overflow-hidden shadow-2xl z-10">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="text-indigo-600 h-7 w-7" />
            </div>
            <span className="text-xl font-black text-white uppercase tracking-[0.2em]">MediBridge</span>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-black text-white leading-tight font-display mb-4">
                Protocol <br />
                <span className="text-indigo-300">Security Upgrade.</span>
              </h2>
              <p className="text-indigo-100/70 font-medium leading-relaxed">
                As part of our periodic safety review, we require all users to initialize a new cryptographic identity key.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-indigo-300" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Compulsory Action</span>
              </div>
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                Your account is currently in a "Secondary Auth" state. Change your password to restore full platform functionality.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 border-t border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-400 h-5 w-5" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest font-display">System Secure [AES-256]</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-24 bg-white relative">
        <div className="max-w-md w-full mx-auto space-y-10">

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Set New Password</h3>
            <p className="text-slate-500 font-medium italic">Identity: <span className="text-indigo-600 font-bold">{user?.username || user?.email}</span></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block">Current Access Key</label>
                <div className="relative group">
                  <input
                    {...register('currentPassword')}
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    className={`w-full bg-slate-50 border-2 ${errors.currentPassword ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 px-6 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs font-bold text-red-500 tracking-tight">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest block">New Cryptic Key</label>
                  <div className="relative group">
                    <input
                      {...register('newPassword')}
                      type={showNew ? "text" : "password"}
                      placeholder="Generate new password"
                      className={`w-full bg-slate-50 border-2 ${errors.newPassword ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 px-6 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs font-bold text-red-500 tracking-tight">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Password Strength Visual */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Strength Matrix</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${metCount >= 5 ? 'text-emerald-500' : metCount >= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {metCount >= 5 ? 'Elite' : metCount >= 3 ? 'Standard' : 'Initialization...'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${i < metCount
                          ? (metCount >= 5 ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : metCount >= 3 ? 'bg-amber-500' : 'bg-red-500')
                          : 'bg-slate-200'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                    {requirements.map((req, i) => (
                      <div key={i} className={`flex items-center gap-2 text-[10px] font-bold ${req.met ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {req.met ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block">Repeat Key</label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Verify new key"
                  className={`w-full bg-slate-50 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 px-6 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-bold text-red-500 tracking-tight">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-center"
                >
                  <ShieldAlert className="text-red-500 h-5 w-5 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-700">
                    {error?.data?.message || 'Access key update failed. Please try again.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || metCount < requirements.length}
              className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Synchronize Access Key
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Branding */}
          <div className="pt-8 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">
            <span>© 2026 MediBridge IQ</span>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-slate-600">Protocol Vault</span>
              <span className="cursor-pointer hover:text-slate-600">Legal Core</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
