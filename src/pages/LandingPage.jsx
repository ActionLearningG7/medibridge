import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Stethoscope,
    TestTubes,
    Truck,
    ShieldCheck,
    Clock,
    Globe,
    UserPlus,
    ChevronRight,
    Play,
    ArrowUpRight,
    Star,
    Zap,
    PhoneCall,
    Navigation,
    Pill,
    Heart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

const LandingPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: Stethoscope,
            title: "Virtual Consultation",
            desc: "Connect with certified specialists instantly via ultra-HD video calls from anywhere in the world.",
            color: "blue",
            delay: 0.1
        },
        {
            icon: TestTubes,
            title: "Smart Lab Logistics",
            desc: "AI-driven laboratory task management with home sample collection and real-time tracking.",
            color: "indigo",
            delay: 0.2
        },
        {
            icon: Truck,
            title: "SOS Ambulance",
            desc: "One-click emergency response system with live GPS tracking and road-polyline navigation.",
            color: "red",
            delay: 0.3
        },
        {
            icon: Pill,
            title: "Digital Pharmacy",
            desc: "Automated prescription issuance and local medicine delivery tracking for seamless recovery.",
            color: "emerald",
            delay: 0.4
        }
    ];

    const stats = [
        { label: "Active Patients", value: "50k+" },
        { label: "Verified Doctors", value: "1,200+" },
        { label: "Labs Managed", value: "250+" },
        { label: "Emergency Response", value: "< 12m" }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-600">

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <Activity className="text-white h-6 w-6" />
                        </div>
                        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">MediBridge</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {['Services', 'Network', 'Operations', 'Insights'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">{item}</a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                            >
                                My Dashboard
                                <ArrowUpRight size={18} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-2.5 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Join MediBridge
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100">
                            <Zap size={14} className="fill-indigo-700" />
                            The Future of Healthcare Intelligence
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                            Bridge the Gap <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">To Better Health.</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-xl mb-10 leading-relaxed">
                            MediBridge is the world's most advanced health ecosystem, integrating virtual care, home diagnostics, and emergency response into a single, intelligent command center.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all flex items-center gap-3 shadow-2xl shadow-slate-200 group">
                                Request a Consultation
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-5 bg-white text-slate-900 font-black rounded-3xl border-2 border-slate-100 hover:border-slate-200 transition-all flex items-center gap-3 group">
                                <Play size={18} className="fill-slate-900" />
                                See How It Works
                            </button>
                        </div>

                        <div className="mt-16 flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-200 shadow-sm">
                                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex gap-1 text-amber-400 mb-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted by 50,000+ Patients Globally</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="relative"
                    >
                        <div className="relative z-10 bg-gradient-to-tr from-white to-slate-50 p-6 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white space-y-4 shadow-xl shadow-indigo-200">
                                        <Heart className="h-8 w-8 fill-white/20" />
                                        <div className="text-4xl font-black">98</div>
                                        <div className="text-xs font-bold uppercase tracking-widest opacity-80">BPM Heart Rate</div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4 shadow-lg shadow-slate-100/50">
                                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                            <Navigation size={20} />
                                        </div>
                                        <div className="text-xs font-black uppercase text-slate-400 tracking-widest">SOS Route</div>
                                        <div className="h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative">
                                            <div className="absolute inset-0 bg-indigo-500/10 opacity-50 blur-xl" />
                                            <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                                                <Activity className="text-indigo-600 h-8 w-8" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-10 space-y-4">
                                    <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-4 shadow-xl shadow-slate-300">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                                                <Clock size={20} />
                                            </div>
                                            <BadgePulse />
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Next Injection</div>
                                        <div className="text-lg font-black tracking-tight">14:00 Today</div>
                                    </div>
                                    <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <PhoneCall className="text-indigo-600 h-5 w-5" />
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Connect Support</div>
                                        <p className="text-sm font-bold text-indigo-900">Dedicated Case Manager</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Blobs */}
                        <div className="absolute top-0 right-0 -u-translate-y-1/2 u-translate-x-1/2 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] -z-10" />
                        <div className="absolute bottom-0 left-0 u-translate-y-1/2 -u-translate-x-1/2 w-[300px] h-[300px] bg-sky-100/50 rounded-full blur-[80px] -z-10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-slate-100 rounded-full -z-10 animate-spin-slow" />
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-slate-50 py-20 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-5xl font-black text-slate-900 mb-2 font-display">{stat.value}</div>
                                <div className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="services" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-24">
                        <div className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Core Infrastructure</div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            A unified operating system for <br />
                            <span className="text-slate-400">modern healthcare delivery.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: f.delay }}
                                viewport={{ once: true }}
                                className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 ${f.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    f.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                        f.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    <f.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                    {f.desc}
                                </p>
                                <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Learn More
                                    <ChevronRight size={14} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-20 px-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto bg-indigo-600 rounded-[4rem] p-12 lg:p-24 text-white text-center relative shadow-3xl shadow-indigo-200"
                >
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl lg:text-7xl font-black tracking-tight leading-[1] text-white">
                            Ready to redefine your healthcare journey?
                        </h2>
                        <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed">
                            Join thousands of patients and medical professionals who have already switched to the most integrated health platform on the planet.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="px-10 py-5 bg-white text-indigo-600 font-black rounded-3xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-700/20"
                            >
                                Create Free Account
                            </button>
                            <button className="px-10 py-5 bg-indigo-500/30 text-white font-black rounded-3xl border border-white/20 hover:bg-indigo-500/50 transition-all backdrop-blur-md">
                                Contact Enterprise
                            </button>
                        </div>
                    </div>

                    {/* Abstract circles */}
                    <div className="absolute top-0 right-0 -u-translate-y-1/2 u-translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 u-translate-y-1/2 -u-translate-x-1/2 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />
                </motion.div>
            </section>

            {/* Trust & Network Section */}
            <section id="network" className="py-32 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-24">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <Globe size={20} />
                                </div>
                                <span className="text-xs font-black uppercase text-emerald-600 tracking-widest">Global Infrastructure</span>
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                                Built for reliability. <br />
                                Scaled for millions.
                            </h2>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
                                Our cloud-native architecture ensures 99.99% uptime, even during national health peaks. Security is built into the DNA of every transaction.
                            </p>
                            <div className="space-y-4 pt-4">
                                {[
                                    { icon: ShieldCheck, text: "HIPAA & GDPR Compliant Infrastructure" },
                                    { icon: Activity, text: "Real-time health telemetry processing" },
                                    { icon: UserPlus, text: "Seamless provider interoperability" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
                                            <item.icon size={14} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm tracking-tight">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-12">
                                    <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="text-3xl font-black text-slate-900 tracking-tight">24/7</div>
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-tight">Emergency <br />Dispatch Ready</div>
                                    </div>
                                    <div className="p-1.5 bg-indigo-50 rounded-[3rem] border border-indigo-100 shadow-xl shadow-indigo-100/50">
                                        <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400" className="w-full h-48 object-cover rounded-[2.5rem]" alt="Lab" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-1.5 bg-slate-900 rounded-[3rem] shadow-xl shadow-slate-200">
                                        <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=400" className="w-full h-64 object-cover rounded-[2.5rem]" alt="Doctor" />
                                    </div>
                                    <div className="p-8 bg-indigo-600 rounded-[3rem] text-white flex flex-col items-center justify-center text-center space-y-3 shadow-xl shadow-indigo-200">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Encryption</span>
                                        <div className="text-2xl font-black tracking-tight">AES-256</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Activity className="text-white h-5 w-5" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-900 uppercase tracking-widest">MediBridge</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            Advancing human health through intelligent logistics, virtual connectivity, and state-of-the-art medical automation.
                        </p>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer">
                                    <Activity size={18} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Platform</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            {['Virtual Care', 'Lab Network', 'SOS Response', 'Smart Pharmacy', 'Case Management'].map(item => (
                                <li key={item} className="hover:text-indigo-600 cursor-pointer transition-colors">{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Resources</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            {['Help Center', 'API Documentation', 'Partner Network', 'Security & Trust', 'Privacy Policy'].map(item => (
                                <li key={item} className="hover:text-indigo-600 cursor-pointer transition-colors">{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Stay Informed</h4>
                        <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">Join our dispatch for the latest medical tech updates.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition-all">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-bold text-slate-400">© 2026 MediBridge Intelligence Systems Corp. All rights reserved.</p>
                    <div className="flex gap-8 text-xs font-bold text-slate-400 tracking-widest uppercase">
                        <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</span>
                        <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Council</span>
                        <span className="hover:text-slate-900 cursor-pointer transition-colors">Cookie Vault</span>
                    </div>
                </div>
            </footer>

        </div>
    );
};

// Sub-components
const BadgePulse = () => (
    <div className="flex items-center gap-2">
        <div className="relative">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping absolute inset-0" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full relative" />
        </div>
        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Operational</span>
    </div>
);

export default LandingPage;
