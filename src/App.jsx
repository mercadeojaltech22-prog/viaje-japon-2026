import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Train, Ticket, 
  ChevronDown, ChevronUp, Zap, Clock, AlignLeft, Trash2, Plus, AlertTriangle
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
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

// --- TUS DATOS MAESTROS COMPLETOS (VERSIÓN RECUPERADA) ---
const initialItinerary = [
  { id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Salida MDE → MEX', activities: [{ id: 'a_v1', time: '01:00', name: 'Vuelo MDE → MEX (AM799)', notes: '✈️ Llegada 04:35 AM. 🇲🇽 LOGÍSTICA: Tiempo para salir. Desayunar tacos en el Centro Histórico.' }, { id: 'a_v2', time: '22:15', name: 'Vuelo MEX → NRT (AM58)', notes: '✈️ Salida hacia Tokio. Estar 3h antes.' }] },
  { id: 'd_v2', date: '14-may', region: 'En tránsito', theme: 'blue', mainActivity: 'Cruce del Pacífico', activities: [{ id: 'a_v3', time: '12:00', name: 'Vuelo en curso', notes: '✈️ Cruzando línea internacional. Ajustar sueño.' }] },
  { id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Aterrizaje + Ueno + Asakusa', activities: [{ id: 'a1', time: '06:30', name: 'Aterrizaje en Narita (NRT)', notes: '✈️ Pasar migración (Visit Japan Web QR).' }, { id: 'a4', time: '17:30', name: 'Tokyo Skytree (Atardecer)', notes: '🎟️ Reserva obligatoria. Ver la ciudad iluminada.' }] },
  { id: 'd2', date: '16-may', region: 'Tokio → Osaka', theme: 'blue', mainActivity: 'Shibuya y Shinkansen', activities: [{ id: 'a5', time: '09:00', name: 'Shibuya', notes: 'Ver el cruce famoso.' }, { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Salida desde Estación Tokio.' }] },
  { id: 'd3', date: '17-may', region: 'Nagoya / Osaka', theme: 'rose', mainActivity: 'Ghibli Park (10:00 AM)', activities: [{ id: 'a11', time: '10:00', name: 'ENTRADA GHIBLI PARK', notes: '🎟️ CONFIRMADA. Recorrer el Gran Almacén.' }] },
  { id: 'd4', date: '18-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Universal Studios Japan (USJ)', activities: [{ id: 'a13', time: '07:30', name: 'Salida a USJ', notes: '🎟️ CONFIRMADO. Pedir Timed Entry para Nintendo.' }] },
  { id: 'd5', date: '19-may', region: 'Nara', theme: 'emerald', mainActivity: 'Ciervos y Templos', activities: [{ id: 'a14', time: '09:00', name: 'Tren a Nara', notes: '🦌 Galletas para ciervos.' }] },
  { id: 'd6', date: '20-may', region: 'Kioto Sur', theme: 'emerald', mainActivity: 'Fushimi Inari', activities: [{ id: 'a15', time: '07:00', name: 'Fushimi Inari', notes: '⛩️ CRÍTICO: Llegar máximo 7:30 AM.' }] },
  { id: 'd7', date: '21-may', region: 'Kioto Norte', theme: 'emerald', mainActivity: 'Pabellón Dorado', activities: [{ id: 'a20', time: '11:00', name: 'Kinkaku-ji', notes: 'Espectacular con luz de mañana.' }] },
  { id: 'd8', date: '22-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Castillo y Pokémon Café', activities: [{ id: 'a23', time: '13:00', name: 'Pokémon Café Osaka', notes: '🎟️ RESERVA OBLIGATORIA.' }] },
  { id: 'd9', date: '23-may', region: 'Traslado Fuji → Tokio', theme: 'rose', mainActivity: 'Shibazakura y Vista al Fuji', activities: [{ id: 'a27', time: '11:30', name: 'Festival Shibazakura', notes: 'Ver mar de flores rosas con el Fuji.' }] },
  { id: 'd10', date: '24-may', region: 'Kamakura', theme: 'rose', mainActivity: 'Gran Buda', activities: [{ id: 'a29', time: '09:30', name: 'Kamakura (Daibutsu)', notes: 'Buda Gigante y Templo Hasedera.' }] },
  { id: 'd11', date: '25-may', region: 'Tokio', theme: 'blue', mainActivity: 'DÍA LIBRE y Despedida', activities: [{ id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: 'Salida aeropuerto.' }] },
  { id: 'd12', date: '26-may', region: 'Tokio', theme: 'blue', mainActivity: 'teamLab y Harajuku', activities: [{ id: 'a33', time: '09:00', name: 'teamLab Planets', notes: '🎟️ Reserva previa.' }] },
  { id: 'd13', date: '27-may', region: 'Tokio', theme: 'blue', mainActivity: 'Akihabara Final Run', activities: [{ id: 'a35', time: '10:30', name: 'Akihabara', notes: 'Compras finales.' }] },
  { id: 'd14', date: '28-may', region: 'Tokio → Seúl', theme: 'blue', mainActivity: 'Regreso (Tramo 1)', activities: [{ id: 'a36', time: '16:00', name: 'Narita (NRT)', notes: 'Vuelo KE714 a las 20:55. 🇰🇷 Escala nocturna Seúl.' }] },
  { id: 'd15', date: '29-may', region: 'Seúl → COL', theme: 'blue', mainActivity: 'Regreso a Casa', activities: [{ id: 'a39', time: '22:00', name: 'Aterrizaje Medellín (MDE)', notes: '✈️ ¡Llegada triunfal! 🎌' }] }
];

const initialChecklist = [
  { id: 'c_v1', category: 'transporte', text: 'Vuelos MDE-MEX-NRT', completed: true },
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park (17 Mayo) - OK', completed: true },
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

  const sync = async (newIt, newCk) => {
    await setDoc(doc(db, "viaje", "datos"), { itinerary: newIt || itinerary, checklist: newCk || checklist });
  };

  const toggleCheck = async (id) => {
    const updated = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklist(updated);
    await sync(itinerary, updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm pt-safe">
        <div className="max-w-md mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-black italic underline decoration-amber-400 tracking-tight">🎌 JAPAN 2026</h1>
            <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full animate-pulse uppercase tracking-tighter">En Línea ☁️</span>
          </div>
          <div className="flex px-2 pb-2">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex flex-col items-center py-2 rounded-2xl ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>
                <item.icon className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-2xl relative">
               <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-indigo-100"><Train className="w-5 h-5" /> Sincronización Real</h3>
               <p className="text-xs opacity-90 leading-relaxed font-medium">Todos tus planes (México, Seúl y los 15 días en Japón) ahora son colaborativos. Mauro verá lo que tú veas.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 text-center">
                <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                <p className="text-lg font-black tracking-tight italic">13 Noches</p>
              </div>
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 text-center">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-lg font-black tracking-tight italic">TKY / OSK</p>
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
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[28px] border ${isExpanded ? 'bg-white shadow-xl ring-2 ring-slate-100' : theme.bg + ' ' + theme.border}`}>
                    <div className="flex items-center gap-3 text-left">
                      <div className={`px-4 py-1.5 rounded-full ${theme.iconBg} ${theme.iconText} text-[10px] font-black shadow-sm`}>{day.date}</div>
                      <span className="font-black text-[11px] text-slate-800 tracking-tight uppercase">{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 bg-white rounded-[28px] p-5 border border-slate-100 shadow-inner animate-in slide-in-from-top-4">
                       <p className="text-xs font-black text-slate-800 italic mb-4">"{day.mainActivity}"</p>
                       {day.activities.map(act => (
                         <div key={act.id} className="border-l-2 border-slate-100 pl-4 mb-4 last:mb-0 text-left">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">{act.time}</span>
                             <span className="font-black text-xs text-slate-800 uppercase tracking-tight">{act.name}</span>
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
          <div className="bg-white rounded-[40px] p-8 border shadow-sm border-slate-100">
            <h3 className="font-black text-slate-900 text-lg uppercase mb-8 tracking-tighter text-left italic underline decoration-indigo-400">Control de Reservas</h3>
            <div className="space-y-2 text-left">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[24px] cursor-pointer group transition-all active:scale-95">
                  <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-slate-900 focus:ring-0 checked:bg-slate-900 transition-all cursor-pointer" />
                  <span className={`text-[11px] font-black italic tracking-tight ${item.completed ? 'text-slate-300 line-through decoration-[2px]' : 'text-slate-700'}`}>{item.text}</span>
                </label>
              ))}
            </div>
            <p className="mt-6 text-[9px] font-bold text-amber-600 bg-amber-50 p-4 rounded-2xl italic">⚠️ IMPORTANTE: Al marcar aquí, los 15 días se guardarán para siempre en la nube.</p>
          </div>
        )}
      </main>
    </div>
  );
}
