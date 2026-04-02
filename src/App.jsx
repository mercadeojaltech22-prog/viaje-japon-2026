import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Train, Ticket, 
  ChevronDown, ChevronUp, Zap, Clock, ShoppingBag, AlertTriangle, Building, BookOpen
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
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

// --- ITINERARIO MAESTRO (SÚPER DETALLADO) ---
const initialItinerary = [
  { 
    id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Escala en México', 
    activities: [
      { id: 'a_v1', time: '01:00', name: 'Salida MDE → MEX', notes: '🇲🇽 LLEGADA 04:35 AM. ⚠️ IMPORTANTE: En México es obligatorio pasar migración y entrar al país aunque estén en tránsito. Tip: Salir a desayunar tacos al Centro Histórico.' },
      { id: 'a_v2', time: '22:15', name: 'MEX → NRT', notes: '✈️ Tramo largo. Estar de vuelta en el aeropuerto 3 horas antes.' }
    ] 
  },
  { id: 'd_v2', date: '14-may', region: 'Vuelo', theme: 'blue', mainActivity: 'Cruce Pacífico', activities: [{ id: 'a_v3', time: 'En vuelo', name: 'Día perdido en el aire', notes: 'Ajustar el reloj mental al horario de Japón.' }] },
  { 
    id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Ueno + Asakusa', 
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje Narita', notes: 'Migración y recoger Suica/Pasmo. Activar eSIM.' },
      { id: 'a3', time: '13:00', name: 'Senso-ji (Asakusa)', hours: '6:00 - 17:00 (Templo)', notes: '🛍️ RECOMENDACIÓN: Comprar el "Goshuincho" (Libro de sellos) aquí. Los puestos de Nakamise cierran a las 17:00.' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree', hours: '10:00 - 21:00', notes: '🎟️ Reserva recomendada para el atardecer.' }
    ] 
  },
  { 
    id: 'd2', date: '16-may', region: 'Tokio → Osaka', theme: 'blue', mainActivity: 'Shibuya + Shinkansen', 
    activities: [
      { id: 'a5', time: '09:00', name: 'Shibuya Crossing', notes: 'Ver el cruce de cebra más famoso y la estatua de Hachiko.' },
      { id: 'a5b', time: '10:30', name: 'Shibuya Sky', hours: '10:00 - 22:30', notes: '🎟️ RESERVA OBLIGATORIA (Se agotan 4 semanas antes). La mejor vista panorámica al aire libre.' },
      { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Tip: Comprar un Eki-ben (lunch box) en la estación para cenar en el tren bala.' }
    ] 
  },
  { 
    id: 'd3', date: '17-may', region: 'Ghibli / Osaka', theme: 'rose', mainActivity: 'Ghibli Park', 
    activities: [
      { id: 'a11', time: '10:00', name: 'Ghibli Park (Nagoya)', hours: '10:00 - 17:00', notes: '🎟️ CONFIRMADO. 🛍️ Tip: La tienda de souvenirs tiene mercancía exclusiva de Studio Ghibli que NO venden en Tokio.' }
    ] 
  },
  { 
    id: 'd4', date: '18-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Universal Studios', 
    activities: [
      { id: 'a13', time: '08:00', name: 'USJ', hours: 'Varia (~8:00 - 21:00)', notes: '🎟️ CONFIRMADO. Usar la app oficial para pedir el ticket de entrada a Super Nintendo World apenas pasen la puerta.' }
    ] 
  },
  { 
    id: 'd5', date: '19-may', region: 'Nara', theme: 'emerald', mainActivity: 'Ciervos y Templos', 
    activities: [
      { id: 'a14', time: '09:30', name: 'Todai-ji', hours: '7:30 - 17:30', notes: '🦌 Comprar galletas oficiales (shika-senbei). Ver el Buda Gigante de bronce.' }
    ] 
  },
  { 
    id: 'd6', date: '20-may', region: 'Kioto Sur', theme: 'emerald', mainActivity: 'Fushimi Inari + Calles Antiguas', 
    activities: [
      { id: 'a15', time: '07:00', name: 'Fushimi Inari', hours: 'Abierto 24h', notes: '⛩️ Tip: Subir hasta el primer mirador (cruce de caminos) para fotos perfectas sin tanta multitud.' },
      { id: 'a17', time: '14:30', name: 'Ninenzaka y Sannenzaka', notes: 'Caminar por las calles históricas. ☕ Aquí está el Starbucks tradicional en una casa de madera.' }
    ] 
  },
  { 
    id: 'd7', date: '21-may', region: 'Kioto Norte', theme: 'emerald', mainActivity: 'Arashiyama + Kinkaku-ji', 
    activities: [
      { id: 'a19', time: '08:00', name: 'Bosque de Bambú', hours: 'Abierto 24h', notes: 'Ir temprano para evitar las multitudes. Visitar el Templo Tenryu-ji al lado.' },
      { id: 'a20', time: '11:00', name: 'Kinkaku-ji (Pabellón Oro)', hours: '9:00 - 17:00', notes: 'Espectacular para fotos con la luz de la mañana.' }
    ] 
  },
  { 
    id: 'd8', date: '22-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Castillo + Pokémon Café', 
    activities: [
      { id: 'a22', time: '09:30', name: 'Castillo de Osaka', hours: '9:00 - 17:00', notes: 'Recorrer los jardines exteriores.' },
      { id: 'a23', time: '13:00', name: 'Pokémon Café Osaka', hours: '10:00 - 21:30', notes: '🎟️ RESERVA CRÍTICA. 🛍️ Tip: Solo aquí venden el Pikachu vestido de Chef.' }
    ] 
  },
  { 
    id: 'd9', date: '23-may', region: 'Fuji → Tokio', theme: 'rose', mainActivity: 'Fuji + Omoide Yokocho', 
    activities: [
      { id: 'a27', time: '11:00', name: 'Shibazakura Festival', hours: '8:00 - 16:00', notes: 'Ver el Fuji rodeado de campos de flores rosas.' },
      { id: 'a28', time: '16:30', name: 'Bus directo a Shinjuku', notes: '🎟️ Reservar asiento en bus Highway con tiempo.' },
      { id: 'a28b', time: '19:30', name: 'Omoide Yokocho (Shinjuku)', hours: 'Bares cierran tarde', notes: '🍢 Tip: El famoso callejón de luces rojas. Yakitoris, cervezas y ambiente brutal para ir los 5 juntos.' }
    ] 
  },
  { 
    id: 'd10', date: '24-may', region: 'Kamakura', theme: 'rose', mainActivity: 'Gran Buda + Costa', 
    activities: [
      { id: 'a29', time: '10:00', name: 'Buda Gigante (Daibutsu)', hours: '8:00 - 17:30', notes: 'Templo Kotoku-in. Luego bajar caminando hacia el mar.' },
      { id: 'a29b', time: '13:30', name: 'Cruce Kamakurakokomae', notes: '📸 PARADA OBLIGATORIA: El famoso cruce de tren frente al mar que sale en los animes.' },
      { id: 'a30', time: '15:30', name: 'Isla de Enoshima', notes: 'Caminar por la isla, ver el atardecer y comer mariscos.' },
      { id: 'a30b', time: '18:30', name: 'Regreso a Tokio', notes: '🚆 Tren directo Odakyu Romancecar desde la estación Katase-Enoshima hasta Shinjuku (1h 15m).' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'Tokio', theme: 'blue', mainActivity: 'Día Libre / Despedida', 
    activities: [
      { id: 'a31', time: '10:00', name: 'Shopping Libre', notes: '🛍️ Recomendado: Nakano Broadway (Anime retro/barato) o Shimokitazawa (Ropa vintage).' },
      { id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: '✈️ Salida hacia el aeropuerto. Reubicación en hotel de Ueno.' }
    ] 
  },
  { 
    id: 'd12', date: '26-may', region: 'Tokio', theme: 'blue', mainActivity: 'teamLab + Harajuku', 
    activities: [
      { id: 'a33', time: '09:00', name: 'teamLab Planets', hours: '9:00 - 22:00', notes: '🎟️ Reserva previa. Tip: Ir con pantalón que se pueda arremangar hasta la rodilla.' },
      { id: 'a34', time: '13:00', name: 'Harajuku / Takeshita Dori', notes: 'Locura visual, crepes de fresa y compras excéntricas.' }
    ] 
  },
  { 
    id: 'd13', date: '27-may', region: 'Tokio', theme: 'blue', mainActivity: 'Akihabara', 
    activities: [
      { id: 'a35', time: '11:00', name: 'Akihabara Run', hours: 'Tiendas abren 10-11 AM', notes: '🕹️ Gachapones, arcades de SEGA/GiGO y cultura Otaku pura.' }
    ] 
  },
  { 
    id: 'd14', date: '28-may', region: 'Regreso 1', theme: 'blue', mainActivity: 'Compras Finales + Seúl', 
    activities: [
      { id: 'a35b', time: '10:00', name: 'Yamashiroya (Ueno)', hours: '11:00 - 20:30', notes: '🛍️ Edificio gigante de juguetes y hobbies. Ideal para comprar kits de armar casas en miniatura japonesas y recuerdos de última hora.' },
      { id: 'a36', time: '16:00', name: 'Salida a Narita (NRT)', notes: 'Vuelo a Seúl a las 20:55.' },
      { id: 'a37', time: '23:25', name: 'Llegada a Seúl', notes: '🇰🇷 ESCALA NOCTURNA. ⚠️ Si quieren salir a la ciudad a comer, DEBEN tramitar el K-ETA online semanas antes. Si no, dormir en el hotel cápsula Darakhyu dentro de tránsito.' }
    ] 
  },
  { 
    id: 'd15', date: '29-may', region: 'Regreso 2', theme: 'blue', mainActivity: 'Seúl → MDE', 
    activities: [
      { id: 'a39', time: '22:00', name: 'Aterrizaje Medellín (MDE)', notes: '✈️ Fin de la aventura. ¡Misión cumplida!' }
    ] 
  }
];

// --- LISTA DE CHEQUEO ACTUALIZADA ---
const initialChecklist = [
  { id: 'c_v1', category: 'transporte', text: 'Vuelos Ida: MDE-MEX-NRT', completed: true },
  { id: 'c_v2', category: 'transporte', text: 'Vuelos Regreso: NRT-ICN-MEX-MDE', completed: true },
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (15 Mayo)', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (16-23 Mayo)', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (23-25 Mayo)', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (25-28 Mayo)', completed: true },
  { id: 'c_t1', category: 'transporte', text: 'Shinkansen: Tokio → Osaka', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Bus: Kawaguchiko → Shinjuku', completed: false },
  { id: 'c_t3', category: 'transporte', text: 'K-ETA para Corea del Sur', completed: false },
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Shibuya Sky (Vista 360°)', completed: false },
  { id: 'c_a4', category: 'atraccion', text: 'Pokémon Café Osaka', completed: false },
  { id: 'c_a5', category: 'atraccion', text: 'teamLab Planets', completed: false },
  { id: 'c_a6', category: 'atraccion', text: 'Tokyo Skytree', completed: false },
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
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-10">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm pt-safe">
        <div className="max-w-md mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic underline decoration-amber-400 uppercase">🎌 JAPAN 2026</h1>
            <span className="text-[9px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full animate-pulse tracking-tighter">CONECTADO ☁️</span>
          </div>
          <div className="flex px-2 pb-2 overflow-x-auto hide-scrollbar">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'calendario', icon: CalendarDays, label: 'Mapa' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1 py-2.5 px-1 mx-1 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-100 scale-95'}`}>
                <item.icon className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                <Moon className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-lg font-black tracking-tight">13 Noches</p>
              </div>
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 text-right">
                <Zap className="w-5 h-5 text-amber-500 mb-2 ml-auto" />
                <p className="text-lg font-black tracking-tighter">TKY / OSK</p>
              </div>
            </div>
            <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-2xl relative">
               <h3 className="font-black text-lg mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Goshuincho Tip</h3>
               <p className="text-xs opacity-90 leading-relaxed font-medium text-left">El 15 de Mayo en Senso-ji compra tu libro de sellos. En cada templo te pintarán caligrafía única por ¥300. ¡El mejor recuerdo! ⛩️</p>
            </div>
            <div className="bg-white rounded-[32px] p-6 border border-slate-200">
               <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3"><ShoppingBag className="w-5 h-5" /> Guía de Compras Express</h3>
               <ul className="text-[11px] text-slate-600 space-y-3 font-medium text-left">
                 <li>• <strong>Yamashiroya (Ueno):</strong> 6 pisos de hobbies, casitas en miniatura y Ghibli.</li>
                 <li>• <strong>Akihabara:</strong> Gachapones raros y figuras de anime.</li>
                 <li>• <strong>Don Quijote:</strong> KitKats de matcha, snacks baratos y cosméticos.</li>
               </ul>
            </div>
          </div>
        )}

        {activeTab === 'calendario' && (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
            {itinerary.map((day) => (
              <div key={day.id} className="flex border-b border-slate-50 last:border-0 text-sm">
                <div className={`w-16 ${themeStyles[day.theme].bg} p-4 font-black text-center border-r border-slate-100 flex flex-col justify-center`}>
                  <span className={`text-[10px] ${themeStyles[day.theme].text} opacity-60 uppercase`}>{day.date.split('-')[1]}</span>
                  <span className={`text-base ${themeStyles[day.theme].text}`}>{day.date.split('-')[0]}</span>
                </div>
                <div className="flex-1 p-4 font-bold text-slate-700 flex items-center leading-tight text-left italic">{day.mainActivity}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'itinerario' && (
          <div className="space-y-4 pb-10">
            {itinerary.map((day) => {
              const theme = themeStyles[day.theme];
              const isExpanded = expandedDays.includes(day.id);
              return (
                <div key={day.id}>
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[28px] border transition-all duration-300 ${isExpanded ? 'bg-white shadow-xl ring-2 ring-slate-100' : theme.bg + ' ' + theme.border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1.5 rounded-full ${theme.iconBg} ${theme.iconText} text-[10px] font-black`}>{day.date}</div>
                      <span className="font-black text-[11px] uppercase tracking-tight">{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-3 py-2 animate-in slide-in-from-top-4">
                      <div className="px-4 mb-4">
                         <p className="text-[13px] font-black text-slate-800 italic text-left">"{day.mainActivity}"</p>
                      </div>
                      <div className="space-y-4 px-2">
                        {day.activities.map((act) => (
                          <div key={act.id} className="relative pl-6 border-l-2 border-slate-200 ml-3 last:border-l-0 text-left">
                            <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ${theme.iconBg} border-2 border-white`} />
                            <div className="mb-1">
                              <span className={`text-[9px] font-black ${theme.iconText} uppercase tracking-tighter block`}>{act.time}</span>
                              <span className="font-black text-sm text-slate-800 leading-none">{act.name}</span>
                            </div>
                            {act.hours && <p className="text-[9px] font-bold text-amber-600 uppercase mb-1 tracking-tighter italic">⏱️ {act.hours}</p>}
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{act.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="bg-white rounded-[40px] p-8 border shadow-sm border-slate-100 text-left">
            <h3 className="font-black text-slate-900 text-lg uppercase mb-8 italic underline decoration-indigo-300">Reserva y Compra</h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[24px] cursor-pointer active:scale-95 transition-all">
                  <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-slate-900 checked:bg-slate-900 transition-all" />
                  <span className={`text-[11px] font-black italic tracking-tight ${item.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
