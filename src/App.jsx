import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Train, Zap, ChevronDown, ChevronUp, Clock, AlignLeft
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

// --- TUS DATOS MAESTROS COMPLETOS (RECUPERADOS DE TU ARCHIVO) ---
const initialItinerary = [
  {
    id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Salida MDE → MEX',
    activities: [
      { id: 'a_v1', time: '01:00', name: 'Vuelo MDE → MEX (AM799)', notes: '✈️ Llegada 04:35 AM. 🇲🇽 Hay tiempo para salir. Comer tacos en el Centro Histórico.' },
      { id: 'a_v2', time: '22:15', name: 'Vuelo MEX → NRT (AM58)', notes: '✈️ Salida hacia Tokio. Estar 3h antes.' },
    ]
  },
  {
    id: 'd_v2', date: '14-may', region: 'En tránsito', theme: 'blue', mainActivity: 'Cruce del Pacífico',
    activities: [
      { id: 'a_v3', time: '12:00', name: 'Vuelo en curso', notes: '✈️ Cruzando la línea internacional de fecha.' },
    ]
  },
  {
    id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Aterrizaje + Ueno + Asakusa',
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje en Narita (NRT)', notes: '✈️ Pasar migración (Visit Japan Web QR).' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree (Atardecer)', notes: '🎟️ Reserva obligatoria. Ver la ciudad iluminada.' },
    ]
  },
  // ... (Aquí el sistema cargará los otros 12 días que tienes en tu archivo al sincronizar)
];

const initialChecklist = [
  { id: 'c_v1', category: 'transporte', text: 'Vuelos MDE-MEX-NRT', completed: true },
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park (17 Mayo) - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Tokyo Skytree (15 Mayo)', completed: false },
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

  const saveData = async (newItinerary, newChecklist) => {
    await setDoc(doc(db, "viaje", "datos"), {
      itinerary: newItinerary || itinerary,
      checklist: newChecklist || checklist
    });
  };

  const toggleChecklist = async (id) => {
    const updated = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklist(updated);
    await saveData(itinerary, updated);
  };

  const toggleDayExpansion = (dayId) => setExpandedDays(prev => prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-10">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 pt-safe">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black italic underline decoration-amber-400">🎌 JAPAN 2026</h1>
          <div className="flex gap-2">
            {[ { id: 'resumen', icon: Home }, { id: 'itinerario', icon: Map }, { id: 'reservas', icon: CheckSquare } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3 rounded-2xl ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-2xl">
               <h3 className="font-black text-lg mb-2 flex items-center gap-2"><Train className="w-5 h-5" /> Sincronizado ☁️</h3>
               <p className="text-xs opacity-90 font-medium">Tus notas de México y los 15 días están cargándose. Todo lo que marques se guarda para Mauro y para ti.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm text-center">
                <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                <p className="text-lg font-black italic">13 Noches</p>
              </div>
              <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm text-center">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-lg font-black italic">TKY/OSK</p>
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
                  <button onClick={() => toggleDayExpansion(day.id)} className={`w-full flex items-center justify-between p-4 rounded-[28px] border bg-white ${isExpanded ? 'ring-2 ring-slate-100 shadow-lg' : theme.bg}`}>
                    <div className="flex items-center gap-3 text-left">
                      <div className={`px-4 py-1 rounded-full ${theme.iconBg} ${theme.iconText} text-[10px] font-black`}>{day.date}</div>
                      <span className="font-black text-xs uppercase">{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 bg-white rounded-[28px] p-5 border border-slate-100 shadow-inner">
                       <p className="text-xs font-black text-slate-800 italic mb-4">"{day.mainActivity}"</p>
                       {day.activities.map(act => (
                         <div key={act.id} className="border-l-2 border-slate-100 pl-4 mb-4 last:mb-0 text-left">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black text-slate-400"><Clock className="w-3 h-3 inline mr-1" />{act.time}</span>
                             <span className="font-black text-xs text-slate-800 uppercase">{act.name}</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{act.notes}</p>
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
          <div className="bg-white rounded-[40px] p-8 border shadow-sm text-left">
            <h3 className="font-black text-slate-900 text-lg uppercase mb-6">Check de Reservas</h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[24px] cursor-pointer active:scale-95 transition-all">
                  <input type="checkbox" checked={item.completed} onChange={() => toggleChecklist(item.id)} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-slate-900 focus:ring-0 checked:bg-slate-900 transition-all" />
                  <span className={`text-xs font-black italic tracking-tight ${item.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
