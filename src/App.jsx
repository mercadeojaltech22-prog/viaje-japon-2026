import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, MapPin, Building, Info,
  Edit3, Save, Trash2, Plus, Clock, AlignLeft, Train, Ticket, 
  ChevronDown, ChevronUp, AlertTriangle, Zap
} from 'lucide-react';

// --- TUS LLAVES PERSONALES DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDdwjKghYeeAFTMSGYR-who-Jy2ZmJiLZs",
  authDomain: "viaje-japon-2026.firebaseapp.com",
  projectId: "viaje-japon-2026",
  storageBucket: "viaje-japon-2026.firebasestorage.app",
  messagingSenderId: "599957148679",
  appId: "1:599957148679:web:7a0d7c0e7dc5f57a0086a2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- TUS DATOS RECUPERADOS (LOS QUE ME PASASTE) ---
const initialItinerary = [
  { id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Salida MDE → MEX', activities: [{ id: 'a_v1', time: '01:00', name: 'Vuelo MDE → MEX (AM799)', notes: '✈️ Llegada 04:35 AM.' }] },
  { id: 'd_v2', date: '14-may', region: 'En tránsito', theme: 'blue', mainActivity: 'Cruze del Pacífico', activities: [{ id: 'a_v3', time: '12:00', name: 'Vuelo en curso', notes: '✈️ Cruzando línea internacional.' }] },
  { id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Aterrizaje + Ueno + Asakusa', activities: [{ id: 'a1', time: '06:30', name: 'Aterrizaje en Narita (NRT)', notes: '✈️ AM58. Pasar migración.' }] },
  { id: 'd3', date: '17-may', region: 'Nagoya / Osaka', theme: 'rose', mainActivity: 'Ghibli Park (10:00 AM)', activities: [{ id: 'a11', time: '10:00', name: 'ENTRADA GHIBLI PARK', notes: '🎟️ CONFIRMADA.' }] },
  { id: 'd4', date: '18-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Universal Studios Japan (USJ)', activities: [{ id: 'a13', time: '07:30', name: 'Salida a USJ', notes: '🎟️ CONFIRMADO.' }] }
  // ... (Aquí incluí los principales para el ejemplo, pero el código manejará todos los que subas)
];

const initialChecklist = [
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park (17 Mayo) - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios Japan (18 Mayo) - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Tokyo Skytree (15 Mayo)', completed: false }
];

const themeStyles = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', iconBg: 'bg-rose-100', iconText: 'text-rose-600' }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [expandedDays, setExpandedDays] = useState([]);

  // --- ESCUCHA EN TIEMPO REAL (GOOGLE CLOUD) ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "viaje", "datos"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.itinerary) setItinerary(data.itinerary);
        if (data.checklist) setChecklist(data.checklist);
      }
    });
    return () => unsub();
  }, []);

  // --- GUARDAR EN LA NUBE ---
  const syncToCloud = async (newItinerary, newChecklist) => {
    await setDoc(doc(db, "viaje", "datos"), {
      itinerary: newItinerary || itinerary,
      checklist: newChecklist || checklist
    });
  };

  const toggleChecklist = async (id) => {
    const updated = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklist(updated);
    await syncToCloud(itinerary, updated);
  };

  const toggleDayExpansion = (dayId) => setExpandedDays(prev => prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-10">
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm pt-safe">
        <div className="max-w-md mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-black italic underline decoration-amber-400 tracking-tight flex items-center gap-2">🎌 JAPAN 2026</h1>
            <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full uppercase animate-pulse">En Línea ☁️</span>
          </div>
          <div className="flex px-2 pb-2">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>
                <item.icon className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
               <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Train className="w-5 h-5" /> Logística Compartida</h3>
               <p className="text-xs opacity-90 leading-relaxed font-medium">Los cambios que hagas aquí se verán reflejados al instante en el celular de Mauro. ¡No más reservas dobles! 🚀</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                <Moon className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-lg font-black tracking-tight">13 Noches</p>
              </div>
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                <Zap className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-lg font-black tracking-tight">TKY/OSK</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'itinerario' && (
          <div className="space-y-4">
            {itinerary.map((day) => {
              const theme = themeStyles[day.theme] || themeStyles.blue;
              const isExpanded = expandedDays.includes(day.id);
              return (
                <div key={day.id}>
                  <button onClick={() => toggleDayExpansion(day.id)} className={`w-full flex items-center justify-between p-4 rounded-[28px] border ${isExpanded ? 'bg-white shadow-xl' : theme.bg + ' ' + theme.border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1.5 rounded-full ${theme.iconBg} ${theme.iconText} text-xs font-black shadow-sm`}>{day.date}</div>
                      <span className="font-black text-sm text-slate-800 tracking-tight uppercase">{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 bg-white rounded-[28px] p-5 border border-slate-100 shadow-inner animate-in slide-in-from-top-4">
                       <p className="text-sm font-black text-slate-800 italic mb-4">"{day.mainActivity}"</p>
                       {day.activities.map(act => (
                         <div key={act.id} className="border-l-2 border-slate-100 pl-4 mb-4 last:mb-0">
                           <div className="flex items-center gap-3 mb-1">
                             <span className="text-[10px] font-black text-slate-400">{act.time}</span>
                             <span className="font-black text-sm text-slate-800">{act.name}</span>
                           </div>
                           <p className="text-[11px] text-slate-500">{act.notes}</p>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="bg-white rounded-[40px] p-8 border shadow-sm border-slate-100">
            <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase mb-8">Check de Reservas</h3>
            <div className="space-y-3">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[24px] cursor-pointer transition-all active:scale-95 group border border-transparent hover:border-slate-100">
                  <input type="checkbox" checked={item.completed} onChange={() => toggleChecklist(item.id)} className="w-7 h-7 rounded-[10px] border-2 border-slate-200 text-slate-900 focus:ring-0 checked:bg-slate-900 checked:border-slate-900 transition-all cursor-pointer" />
                  <span className={`text-sm font-black tracking-tight ${item.completed ? 'text-slate-300 line-through decoration-[3px]' : 'text-slate-700'}`}>{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
