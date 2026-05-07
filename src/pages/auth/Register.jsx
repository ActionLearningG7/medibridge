import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, Phone, MapPin,
    Calendar, Users, ShieldCheck, ChevronRight,
    ChevronLeft, CheckCircle, Activity, Heart,
    AlertCircle
} from 'lucide-react';
import { useRegisterMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { Button, Input, Card, Badge } from '../../ui';

// Validation schema for the entire form
const registerSchema = z.object({
    // Step 1: Account
    username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/, 'Must contain digit, lowercase, uppercase, and special char'),

    // Step 2: Personal
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),

    // Step 3: Contact & Address
    phoneNumber: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
    addressLine1: z.string().min(1, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('US'),

    // Step 4: Emergency
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
    emergencyContactPhone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
    termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
    privacyPolicyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
});

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(1);
    const [registerPatient, { isLoading, error }] = useRegisterMutation();

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            gender: 'MALE',
            country: 'US',
            termsAccepted: false,
            privacyPolicyAccepted: false,
        }
    });

    const nextStep = async () => {
        const fieldsByStep = {
            1: ['username', 'email', 'password'],
            2: ['firstName', 'lastName', 'dateOfBirth', 'gender'],
            3: ['phoneNumber', 'addressLine1', 'city', 'state', 'postalCode'],
            4: ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone', 'termsAccepted', 'privacyPolicyAccepted'],
        };

        const isStepValid = await trigger(fieldsByStep[currentStep]);
        if (isStepValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    const onSubmit = async (data) => {
        try {
            const response = await registerPatient(data).unwrap();
            dispatch(setCredentials(response));
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Visual Sidebar - Modern Health Tech Style */}
            <div className="hidden lg:flex w-1/3 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-16">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Activity className="text-white h-6 w-6" />
                        </div>
                        <span className="text-xl font-black text-white tracking-widest uppercase">MediBridge</span>
                    </Link>

                    <div className="space-y-8">
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tighter">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Health Network.</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xs">
                            Take control of your medical journey with our integrated AI-driven ecosystem.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Bank-Grade Security</p>
                            <p className="text-xs text-slate-400">AES-256 Multi-layer Encryption</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                            <Heart size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Integrated Care</p>
                            <p className="text-xs text-slate-400">Direct Doctor & Lab Connectivity</p>
                        </div>
                    </div>
                </div>

                {/* Floating Abstract Element */}
                <div className="absolute top-1/2 right-[-50px] w-64 h-64 border-4 border-dashed border-white/5 rounded-full animate-spin-slow" />
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col p-6 lg:p-20 overflow-y-auto">
                <div className="max-w-xl mx-auto w-full">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Patient Account</h2>
                            <p className="text-slate-500 font-medium">Step {currentStep} of 4</p>
                        </div>
                        <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                            Already have an account?
                        </Link>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mb-12">
                        {[1, 2, 3, 4].map(idx => (
                            <div
                                key={idx}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${currentStep >= idx ? 'bg-indigo-600' : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Identity (Username)</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                                <input
                                                    {...register('username')}
                                                    className={`w-full pl-12 pr-6 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium ${errors.username ? 'border-rose-100 focus:border-rose-400' : 'border-slate-100 focus:border-indigo-400'}`}
                                                    placeholder="johndoe_health"
                                                />
                                                {errors.username && <p className="text-xs text-rose-500 font-bold mt-2 ml-1">{errors.username.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Communication (Email)</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                                <input
                                                    {...register('email')}
                                                    type="email"
                                                    className={`w-full pl-12 pr-6 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium ${errors.email ? 'border-rose-100 focus:border-rose-400' : 'border-slate-100 focus:border-indigo-400'}`}
                                                    placeholder="john@example.com"
                                                />
                                                {errors.email && <p className="text-xs text-rose-500 font-bold mt-2 ml-1">{errors.email.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Vault Key (Password)</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                                <input
                                                    {...register('password')}
                                                    type="password"
                                                    className={`w-full pl-12 pr-6 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium ${errors.password ? 'border-rose-100 focus:border-rose-400' : 'border-slate-100 focus:border-indigo-400'}`}
                                                    placeholder="••••••••"
                                                />
                                                {errors.password && <p className="text-xs text-rose-500 font-bold mt-2 ml-1">{errors.password.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                                            <input {...register('firstName')} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium" />
                                            {errors.firstName && <p className="text-xs text-rose-500 font-bold mt-1">{errors.firstName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                                            <input {...register('lastName')} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium" />
                                            {errors.lastName && <p className="text-xs text-rose-500 font-bold mt-1">{errors.lastName.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input type="date" {...register('dateOfBirth')} className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium" />
                                        </div>
                                        {errors.dateOfBirth && <p className="text-xs text-rose-500 font-bold mt-1">{errors.dateOfBirth.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                                        <div className="flex gap-4">
                                            {['MALE', 'FEMALE', 'OTHER'].map(g => (
                                                <label key={g} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${watch('gender') === g ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>
                                                    <input type="radio" value={g} {...register('gender')} className="hidden" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{g}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input {...register('phoneNumber')} className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium" />
                                        </div>
                                        {errors.phoneNumber && <p className="text-xs text-rose-500 font-bold mt-1">{errors.phoneNumber.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Residential Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input {...register('addressLine1')} placeholder="Line 1" className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium mb-4" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input {...register('city')} placeholder="City" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium" />
                                            <input {...register('state')} placeholder="State" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <input {...register('postalCode')} placeholder="Postal Code" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium" />
                                            <input {...register('country')} readOnly className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-400 font-bold" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 4 && (
                                <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                    <div className="bg-amber-50/50 p-6 rounded-[2.5rem] border border-amber-100 space-y-6">
                                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Emergency Node
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-amber-600/60 ml-1">Contact Name</label>
                                                <input {...register('emergencyContactName')} className="w-full px-6 py-4 bg-white border-2 border-amber-100 rounded-2xl font-medium outline-none focus:border-amber-400 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-amber-600/60 ml-1">Relationship</label>
                                                    <input {...register('emergencyContactRelationship')} className="w-full px-6 py-4 bg-white border-2 border-amber-100 rounded-2xl font-medium outline-none focus:border-amber-400 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-amber-600/60 ml-1">Phone</label>
                                                    <input {...register('emergencyContactPhone')} className="w-full px-6 py-4 bg-white border-2 border-amber-100 rounded-2xl font-medium outline-none focus:border-amber-400 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative mt-1">
                                                <input type="checkbox" {...register('termsAccepted')} className="sr-only" />
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${watch('termsAccepted') ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 group-hover:border-indigo-400'}`}>
                                                    {watch('termsAccepted') && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700 leading-tight">Accept Terms of Service</p>
                                                <p className="text-xs text-slate-400">I agree to the computational and medical service agreements.</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <div className="relative mt-1">
                                                <input type="checkbox" {...register('privacyPolicyAccepted')} className="sr-only" />
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${watch('privacyPolicyAccepted') ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 group-hover:border-indigo-400'}`}>
                                                    {watch('privacyPolicyAccepted') && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700 leading-tight">Privacy Protocol</p>
                                                <p className="text-xs text-slate-400">I consent to the high-security handling of my clinical data.</p>
                                            </div>
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3">
                                <AlertCircle className="text-rose-500" size={18} />
                                <p className="text-xs font-bold text-rose-700">{error?.data?.message || 'Registration failed. Please audit your data.'}</p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    onClick={prevStep}
                                    variant="outline"
                                    className="h-16 flex-1 rounded-2xl font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-slate-100"
                                >
                                    <ChevronLeft size={18} />
                                    Back
                                </Button>
                            )}

                            {currentStep < 4 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="h-16 flex-[2] bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
                                >
                                    Synchronize Step
                                    <ChevronRight size={18} />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    loading={isLoading}
                                    className="h-16 flex-[2] bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                                >
                                    Finalize Initialization
                                    <CheckCircle size={18} />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
