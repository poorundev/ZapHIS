/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Calendar, 
  Video, 
  ChevronRight, 
  Heart, 
  Thermometer, 
  Droplets, 
  User,
  LogOut,
  Bell,
  Search,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { openmrsService } from './services/openmrs';
import { Appointment, Vital, generateJitsiRoomName } from './types';

// --- Components ---

const VitalsCard = ({ vital }: { vital: Vital }) => {
  const getStyles = (name: string) => {
    if (name.includes('Pressure')) return { icon: <Activity className="w-5 h-5" />, bg: 'bg-rose-50', text: 'text-rose-500' };
    if (name.includes('Heart')) return { icon: <Heart className="w-5 h-5" />, bg: 'bg-sky-50', text: 'text-sky-500' };
    if (name.includes('Oxygen')) return { icon: <Droplets className="w-5 h-5" />, bg: 'bg-emerald-50', text: 'text-emerald-500' };
    return { icon: <Thermometer className="w-5 h-5" />, bg: 'bg-amber-50', text: 'text-amber-500' };
  };

  const style = getStyles(vital.display);

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vital.display}</span>
        <div className={`p-2 ${style.bg} rounded-lg ${style.text}`}>{style.icon}</div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
          {vital.value.split('/').map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-xl text-slate-300 font-light">/</span>}
              {part}
            </React.Fragment>
          ))}
          <span className="text-xs text-slate-400 font-medium ml-1 uppercase">{vital.unit}</span>
        </h3>
        <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          NORMAL RANGE
        </p>
      </div>
    </motion.div>
  );
};

const AppointmentItem = ({ appt, onJoin }: { appt: Appointment, onJoin: (id: string) => void }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-4 shadow-sm hover:border-sky-200 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner overflow-hidden group-hover:bg-sky-50 group-hover:border-sky-100 transition-colors">
            {/* Simulation of Provider Avatar */}
            <span className="text-xl font-bold text-slate-300 group-hover:text-sky-300">
              {appt.provider.split(' ').pop()?.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">{appt.provider}</h4>
            <p className="text-xs text-slate-400 font-medium">{appt.type} • <span className="italic">ID: {appt.id}</span></p>
          </div>
        </div>
        <div className={`flex items-center text-[10px] font-black px-3 py-1 rounded-full border tracking-widest uppercase ${
          appt.status === 'active' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-slate-50 text-slate-400 border-slate-100'
        }`}>
          {appt.status === 'active' && <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>}
          {appt.status}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center text-slate-500 text-sm font-medium gap-2">
          <div className="p-1.5 bg-slate-50 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          {appt.time}
        </div>
        {appt.status === 'active' && (
          <button 
            onClick={() => onJoin(appt.id)}
            className="flex items-center gap-3 bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-sky-900/20 hover:bg-sky-500 active:scale-95 transition-all"
          >
            <Video className="w-4 h-4" />
            Join Consultation
          </button>
        )}
      </div>
    </div>
  );
};

const JitsiContainer = ({ appointmentId, onBack }: { appointmentId: string, onBack: () => void }) => {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const roomName = generateJitsiRoomName(appointmentId);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      if (jitsiRef.current) {
        // @ts-ignore
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiRef.current,
          configOverwrite: { 
            prejoinPageEnabled: false,
            disableDeepLinking: true
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'chat', 'settings', 'tileview']
          },
          userInfo: {
            displayName: 'Patient User'
          }
        });

        api.addEventListener('videoConferenceLeft', () => {
          onBack();
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [roomName, onBack]);

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans">
      <div className="bg-slate-900 h-20 px-8 flex items-center justify-between text-white border-b border-white/10">
        <button onClick={onBack} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <span className="bg-sky-500 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-widest uppercase">Secured Session</span>
          <p className="text-sm font-medium mt-1 font-mono opacity-60">{roomName}</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
          <ShieldCheck className="w-4 h-4" />
          ENCRYPTED
        </div>
      </div>
      <div ref={jitsiRef} className="flex-1" />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'login' | 'dashboard' | 'telemedicine'>('login');
  const [activeAppt, setActiveAppt] = useState<string | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === 'dashboard') {
      const fetchData = async () => {
        setLoading(true);
        const [v, a] = await Promise.all([
          openmrsService.getVitals('patient-1'),
          openmrsService.getAppointments('patient-1')
        ]);
        setVitals(v);
        setAppointments(a);
        setLoading(false);
      };
      fetchData();
    }
  }, [view]);

  const handleLogin = () => {
    setView('dashboard');
  };

  const handleJoinRoom = (id: string) => {
    setActiveAppt(id);
    setView('telemedicine');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-sky-100 overflow-x-hidden">
      
      {view !== 'telemedicine' && (
        <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-black tracking-tight text-slate-800 uppercase">
              ZAPHIS <span className="text-sky-600 font-light">HEALTH</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              OPENMRS CONNECTED
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">HIPAA Secure</span>
            </div>
          </div>
        </nav>
      )}

      <AnimatePresence mode="wait">
        
        {/* LOGIN SCREEN */}
        {view === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 bg-sky-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-sky-200 relative z-10 rotate-3">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-sky-200 rounded-[2.5rem] blur-xl opacity-50 -z-0"></div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">Secure Login</h1>
            <p className="text-slate-400 mb-16 font-medium text-lg">Zaphis Health Management Portal</p>
            
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLogin}
              className="w-full max-w-sm bg-white border border-slate-200 p-8 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.05)] flex items-center justify-between group hover:border-sky-300 transition-all bg-gradient-to-br from-white to-slate-50"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <Zap className="w-8 h-8 text-sky-600" />
                </div>
                <div className="text-left font-sans">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated</p>
                  <p className="text-xl font-bold text-slate-800">Use Biometrics</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
            </motion.button>
            
            <footer className="fixed bottom-12 text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
              Encrypted End-to-End
            </footer>
          </motion.div>
        )}

        {/* DASHBOARD SCREEN */}
        {view === 'dashboard' && (
          <motion.main 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-w-7xl mx-auto"
          >
            {/* Sidebar Info */}
            <aside className="md:col-span-3 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="flex flex-col items-center text-center z-10 relative">
                  <div className="w-24 h-24 bg-slate-100 rounded-full mb-6 flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-10 h-10 text-slate-300" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">Johnathan Smith</h2>
                  <p className="text-[10px] text-slate-400 font-mono font-bold mt-2 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter">UID: 82-0192-XPL</p>
                  
                  <div className="mt-8 w-full grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl text-left border border-slate-100">
                      <span className="block text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Age</span>
                      <span className="text-sm font-bold text-slate-700">34 Yrs</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-left border border-slate-100">
                      <span className="block text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Blood</span>
                      <span className="text-sm font-bold text-rose-500">O Pos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Device Security</h3>
                <div className="flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <div className="flex items-center">
                     <Lock className="w-6 h-6 text-sky-600" />
                     <span className="ml-3 text-xs font-black text-sky-800 uppercase tracking-widest">FaceID Active</span>
                  </div>
                  <div className="w-3 h-3 bg-sky-500 rounded-full shadow-lg shadow-sky-500/50"></div>
                </div>
              </div>
            </aside>

            {/* Main Area */}
            <div className="md:col-span-9 space-y-8">
              {/* Telemedicine Hero Slot */}
              {appointments.some(a => a.status === 'active') ? (
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[300px]">
                  <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Video className="w-80 h-80 text-white" />
                  </div>
                  <div className="z-10">
                    <span className="bg-sky-500 text-white text-[10px] px-4 py-1.5 rounded-full font-black tracking-[0.2em] uppercase">Live Consultation</span>
                    <h1 className="text-5xl font-light text-white mt-6 tracking-tight">
                      {appointments.find(a => a.status === 'active')?.provider}
                    </h1>
                    <p className="text-sky-300 text-lg mt-3 font-medium">Ready for session • <span className="italic">Room Ready</span></p>
                  </div>
                  <div className="z-10 flex flex-wrap items-center justify-between gap-6 mt-10">
                    <div className="flex items-center space-x-8 text-white">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">Room Index</p>
                        <p className="font-mono text-xs bg-white/5 px-4 py-2 rounded-xl border border-white/10">102-SEC-CONS</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">Started</p>
                        <p className="text-2xl font-light">Now</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleJoinRoom(appointments.find(a => a.status === 'active')?.id || '')}
                      className="bg-sky-500 hover:bg-sky-400 text-white px-12 py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-sky-500/40 flex items-center transition-all hover:scale-105 active:scale-95"
                    >
                      Enter Room
                      <ChevronRight className="w-6 h-6 ml-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-600 rounded-[2.5rem] p-10 relative overflow-hidden flex items-center justify-between shadow-xl text-white">
                   <div>
                    <h3 className="text-3xl font-black tracking-tight mb-2">Health Update</h3>
                    <p className="text-indigo-100 opacity-80">Next physical exam scheduled for Oct 12th.</p>
                   </div>
                   <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center">
                    <Activity className="w-10 h-10" />
                   </div>
                </div>
              )}

              {/* Vitals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {vitals.map(v => <VitalsCard key={v.uuid} vital={v} />)}
              </div>

              {/* Appointments List */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Upcoming Visits</h3>
                  <div className="h-px bg-slate-100 flex-1 mx-6"></div>
                  <button className="text-[10px] font-black text-sky-600 tracking-widest uppercase hover:underline">View All</button>
                </div>
                <div>
                  {appointments.map(a => <AppointmentItem key={a.id} appt={a} onJoin={handleJoinRoom} />)}
                </div>
              </section>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Bottom Status Bar */}
      {view !== 'telemedicine' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-8 py-3 flex items-center justify-between z-30">
          <div className="flex space-x-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-sm shadow-emerald-500/40"></div>
              Endpoint Sync Active
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-sky-500 rounded-full mr-2 shadow-sm shadow-sky-500/40"></div>
              Session Encrypted
            </div>
          </div>
          <div className="text-[9px] text-slate-400 font-mono tracking-tighter bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            ENV: PRODUCTION // REF: ZPH-2.4.1
          </div>
        </footer>
      )}
    </div>
  );
}
