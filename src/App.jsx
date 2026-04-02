import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Train, Ticket, 
  ChevronDown, ChevronUp, Zap, ShoppingBag, AlertTriangle, Building, BookOpen
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

// --- ITINERARIO MAESTRO (SÚPER DETALLADO Y LIMPIO) ---
const initialItinerary = [
  { 
    id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Escala en México', 
    activities: [
      { id: 'a_v1', time: '01:00', name: 'Salida MDE → MEX', notes: '✈️ Llegada 04:35 AM. ⏱️ ESCALA: 17h 40m. 🇲🇽 LOGÍSTICA: Deben hacer migración de entrada a México en caso de querer salir del aeropuerto. Recomendado: Desayunar tacos en el Centro Histórico, caminar por Reforma.' },
      { id: 'a_v2', time: '22:15', name: 'MEX → NRT', notes: '✈️ Tramo largo. Estar de vuelta en el aeropuerto 3 horas antes.' }
    ] 
  },
  { id: 'd_v2', date: '14-may', region: 'Vuelo', theme: 'blue', mainActivity: 'Cruce Pacífico', activities: [{ id: 'a_v3', time: 'En vuelo', name: 'Día en tránsito', notes: '✈️ Cruzando la línea internacional de fecha. Tratar de ajustar el sueño al horario de Japón.' }] },
  { 
    id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Ueno + Asakusa', 
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje Narita', notes: 'Migración (Visit Japan Web QR) y recoger Suica/Pasmo. Dejar maletas en Hotel Ueno.' },
      { id: 'a3', time: '13:00', name: 'Senso-ji (Asakusa)', hours: 'Abierto 6:00 - 17:00 (Templo principal)', notes: '🛍️ RECOMENDACIÓN: Comprar el "Goshuincho" (Libro de sellos) aquí. Los puestitos de comida en la calle Nakamise cierran a las 17:00.' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree', hours: 'Abre 10:00 - Cierra 21:00', notes: '🎟️ Reserva recomendada para subir al atardecer. Paseo de 15 min cruzando el río Sumida.' }
    ] 
  },
  { 
    id: 'd2', date: '16-may', region: 'Tokio → Osaka', theme: 'blue', mainActivity: 'Shibuya + Shinkansen', 
    activities: [
      { id: 'a5', time: '09:00', name: 'Shibuya Crossing', notes: 'Ver el cruce peatonal más famoso del mundo y la estatua del perrito Hachiko.' },
      { id: 'a5b', time: '10:30', name: 'Shibuya Sky', hours: 'Abre 10:00 - Cierra 22:30', notes: '🎟️ RESERVA OBLIGATORIA (Se agotan 4 semanas antes). La mejor vista panorámica desde las alturas.' },
      { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Tip: Comprar un Eki-ben (lunch box) en la estación de Tokio para cenar adentro del tren bala.' }
    ] 
  },
  { 
    id: 'd3', date: '17-may', region: 'Ghibli / Osaka', theme: 'rose', mainActivity: 'Ghibli Park', 
    activities: [
      { id: 'a11', time: '10:00', name: 'Ghibli Park (Nagoya)', hours: 'Abre 10:00 - Cierra 17:00', notes: '🎟️ CONFIRMADO. 🛍️ Tip: La tienda de souvenirs "Adventurous Spirit" tiene mercancía que NO venden en Tokio.' }
    ] 
  },
  { 
    id: 'd4', date: '18-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Universal Studios Japan', 
    activities: [
      { id: 'a13', time: '08:00', name: 'USJ', hours: 'Varia según el día (~8:00 - 21:00)', notes: '🎟️ CONFIRMADO. Apenas pasen la puerta, usen la app oficial de USJ para pedir el "Timed Entry Ticket" a Super Nintendo World.' }
    ] 
  },
  { 
    id: 'd5', date: '19-may', region: 'Nara', theme: 'emerald', mainActivity: 'Ciervos y Templos', 
    activities: [
      { id: 'a14', time: '09:30', name: 'Templo Todai-ji', hours: 'Abre 7:30 - Cierra 17:30', notes: '🦌 Comprar galletas oficiales (shika-senbei) para los ciervos. Ver el Buda Gigante de bronce adentro del templo.' }
    ] 
  },
  { 
    id: 'd6', date: '20-may', region: 'Kioto Sur', theme: 'emerald', mainActivity: 'Inari + Calles Antiguas', 
    activities: [
      { id: 'a15', time: '07:00', name: 'Fushimi Inari', hours: 'Abierto 24 horas', notes: '⛩️ Tip: El templo siempre está abierto. Subir hasta el primer mirador para tomar fotos sin tanta multitud.' },
      { id: 'a17', time: '14:30', name: 'Ninenzaka y Sannenzaka', notes: 'Caminar por las calles empedradas históricas. ☕ Aquí está el Starbucks escondido en una casa tradicional de madera.' }
    ] 
  },
  { 
    id: 'd7', date: '21-may', region: 'Kioto Norte', theme: 'emerald', mainActivity: 'Arashiyama + Kinkaku-ji', 
    activities: [
      { id: 'a19', time: '08:00', name: 'Bosque de Bambú', hours: 'Abierto 24 horas', notes: 'Ir muy temprano para evitar masas. Caminar por los senderos principales.' },
      { id: 'a20', time: '11:00', name: 'Kinkaku-ji (Pabellón de Oro)', hours: 'Abre 9:00 - Cierra 17:00', notes: 'Espectacular para fotos con el reflejo en el agua y el sol de la mañana.' }
    ] 
  },
  { 
    id: 'd8', date: '22-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Castillo + Pokémon Café', 
    activities: [
      { id: 'a22', time: '09:30', name: 'Castillo de Osaka', hours: 'Abre 9:00 - Cierra 17:00', notes: 'Recorrer los inmensos jardines exteriores y tomar fotos del castillo.' },
      { id: 'a23', time: '13:00', name: 'Pokémon Café Osaka', hours: 'Abre 10:00 - Cierra 21:30', notes: '🎟️ RESERVA CRÍTICA (31 días antes). 🛍️ Solo aquí venden al Pikachu exclusivo vestido de Chef.' }
    ] 
  },
  { 
    id: 'd9', date: '23-may', region: 'Fuji → Tokio', theme: 'rose', mainActivity: 'Fuji + Omoide Yokocho', 
    activities: [
      { id: 'a27', time: '11:00', name: 'Shibazakura Festival', hours: 'Abre 8:00 - Cierra 16:00', notes: 'Ver el Monte Fuji rodeado de inmensos campos de flores rosas.' },
      { id: 'a28', time: '16:30', name: 'Bus de regreso a Tokio', notes: '🎟️ Tomar el Highway Bus directo a Shinjuku (Reservar semanas antes por internet).' },
      { id: 'a28b', time: '19:30', name: 'Omoide Yokocho (Shinjuku)', hours: 'Bares abren tarde y cierran medianoche', notes: '🍢 Tip: El famoso "Callejón de los recuerdos". Lleno de humito, yakitoris y cervezas. ¡Ambiente brutal para ir los 5 juntos!' }
    ] 
  },
  { 
    id: 'd10', date: '24-may', region: 'Kamakura', theme: 'rose', mainActivity: 'Buda Gigante + Costa', 
    activities: [
      { id: 'a29', time: '09:30', name: 'Buda Gigante (Daibutsu)', hours: 'Abre 8:00 - Cierra 17:30', notes: 'Templo Kotoku-in. Buda gigante de bronce al aire libre.' },
      { id: 'a29b', time: '11:30', name: 'Cruce Kamakurakokomae', notes: '📸 PARADA OBLIGATORIA: El famoso cruce de tren verde frente al mar donde todo el mundo toma fotos (Sale en el anime Slam Dunk).' },
      { id: 'a30', time: '15:30', name: 'Isla de Enoshima', notes: 'Caminar cruzando el puente hacia la isla, subir a ver los santuarios y el atardecer.' },
      { id: 'a30b', time: '18:30', name: 'Regreso a Tokio', notes: '🚆 Tomar el tren Odakyu Romancecar directo desde Enoshima hasta Shinjuku (aprox. 1 hora).' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'Tokio', theme: 'blue', mainActivity: 'Día Libre / Despedida', 
    activities: [
      { id: 'a31', time: '10:00', name: 'Shopping Libre', notes: '🛍️ Para perderse comprando: Nakano Broadway (Anime barato) o Shimokitazawa (Ropa vintage).' },
      { id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: '✈️ Salida de ellos hacia el aeropuerto. Reubicación del grupo en el nuevo hotel de Ueno.' }
    ] 
  },
  { 
    id: 'd12', date: '26-may', region: 'Tokio', theme: 'blue', mainActivity: 'teamLab + Harajuku', 
    activities: [
      { id: 'a33', time: '09:00', name: 'teamLab Planets', hours: 'Abre 9:00 - Cierra 22:00', notes: '🎟️ Reserva previa obligatoria. Tip: Ir con pantalón que se pueda arremangar hasta la rodilla porque se entra al agua.' },
      { id: 'a34', time: '13:00', name: 'Harajuku / Takeshita Dori', notes: 'La calle de la moda excéntrica. Comer crepes de frutas y ver tiendas locas.' }
    ] 
  },
  { 
    id: 'd13', date: '27-may', region: 'Tokio', theme: 'blue', mainActivity: 'Akihabara', 
    activities: [
      { id: 'a35', time: '11:00', name: 'Akihabara Run', hours: 'La mayoría de tiendas abren a las 10:00 - 11:00 AM', notes: '🕹️ Buscar el edificio "Radio Kaikan" para figuras, y jugar en los arcades de GiGO.' }
    ] 
  },
  { 
    id: 'd14', date: '28-may', region: 'Regreso 1', theme: 'blue', mainActivity: 'Compras Mañana + Vuelo', 
    activities: [
      { id: 'a35b', time: '09:00', name: 'Compras última hora (Ueno)', notes: '🛍️ Aprovechar la mañana cerca al hotel. Visitar Yamashiroya (edificio de 6 pisos de hobbies) o comprar dulces en la calle Ameyoko.' },
      { id: 'a36', time: '16:00', name: 'Salida a Narita (NRT)', notes: '🚆 Tomar el tren Keisei Skyliner. Vuelo a Seúl sale a las 20:55.' },
      { id: 'a37', time: '23:25', name: 'Llegada a Seúl (ICN)', notes: '🇰🇷 ESCALA NOCTURNA: Recomendado usar el hotel cápsula (Darakhyu) que queda DENTRO del aeropuerto. ⚠️ IMPORTANTE: Si quieren salir del aeropuerto a la calle a comer algo (para decir que estuvieron en Corea), DEBEN tramitar semanas antes el permiso K-ETA por internet para que les hagan la entrada oficial.' }
    ] 
  },
  { 
    id: 'd15', date: '29-may', region: 'Regreso 2', theme: 'blue', mainActivity: 'Seúl → MDE', 
    activities: [
      { id: 'a38', time: '11:40', name: 'Vuelo ICN → MEX', notes: '✈️ ⏱️ Escala en CDMX. Mejor esperar en una sala VIP del aeropuerto porque no da el tiempo para salir.' },
      { id: 'a39', time: '22:00', name: 'Aterrizaje Medellín (MDE)', notes: '✈️ Fin de la aventura. ¡Misión cumplida! 🎌' }
    ] 
  }
];

const initialChecklist = [
  { id: 'c_v1', category: 'transporte', text: 'Vuelos Ida: MDE-MEX-NRT', completed: true },
  { id: 'c_v2', category: 'transporte', text: 'Vuelos Regreso: NRT-ICN-MEX-MDE', completed: true },
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (15 Mayo)', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (16-23 Mayo)', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (23-25 Mayo)', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (25-28 Mayo)', completed: true },
  { id: 'c_t1', category: 'transporte', text: 'Shinkansen: Tokio → Osaka', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Bus Highway: Kawaguchiko → Shinjuku', completed: false },
  { id: 'c_t3', category: 'transporte', text: 'Permiso K-ETA (Si salen en Corea)', completed: false },
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Shibuya Sky (Vista panorámica)', completed: false },
  { id: 'c_a4', category: 'atraccion', text: 'Pokémon Café Osaka', completed: false },
  { id: 'c_a5', category: 'atraccion', text: 'teamLab Planets', completed: false },
  { id: 'c_a6', category: 'atraccion', text: 'Tokyo Skytree', completed: false },
];

const themeStyles = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' }
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
    <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans pb-10 selection:bg-amber-100">
      {/* HEADER LIMPIO */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm pt-safe">
        <div className="max-w-md mx-auto">
          <div className="px-5 py-4 flex items-center justify-between">
            <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 italic">
               🎌 JAPAN 2026
               <div className="h-1 w-8 bg-amber-400 ml-1 rounded-full"></div>
            </h1>
            <span className="text-[9px] font-bold px-2 py-1 bg-amber-50 text-amber-600 rounded-full animate-pulse tracking-tighter border border-amber-100">
              EN LÍNEA ☁️
            </span>
          </div>
          <div className="flex px-3 pb-2 overflow-x-auto hide-scrollbar gap-1">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'calendario', icon: CalendarDays, label: 'Mapa' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        
        {/* PESTAÑA INFO (LIMPIA) */}
        {activeTab === 'resumen' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
                <Moon className="w-5 h-5 text-indigo-400 mb-2" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Noches</p>
                <p className="text-xl font-black text-slate-800 tracking-tight">13 (JP)</p>
              </div>
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 text-right">
                <Zap className="w-5 h-5 text-amber-400 mb-2 ml-auto" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Bases</p>
                <p className="text-xl font-black text-slate-800 tracking-tighter">TKY / OSK</p>
              </div>
            </div>

            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
               <h3 className="font-black text-base mb-3 text-slate-800 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Goshuincho Tip</h3>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">El 15 de Mayo en Senso-ji, compra tu libro de sellos sagrados. En cada templo te harán una caligrafía a mano por ¥300-¥500. ¡Es el mejor souvenir para traer de vuelta a Colombia! ⛩️</p>
            </div>

            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
               <h3 className="font-black text-base mb-4 text-slate-800 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-emerald-500" /> Guía de Compras Rápidas</h3>
               <ul className="text-xs text-slate-500 space-y-3 font-medium">
                 <li className="flex gap-2"><span>•</span> <span><strong>Yamashiroya (Ueno):</strong> 6 pisos enteros de juguetes, Ghibli y casitas en miniatura japonesas para armar.</span></li>
                 <li className="flex gap-2"><span>•</span> <span><strong>Don Quijote:</strong> Perfecto para comprar KitKats de matcha, dulces y recuerdos a las 11 de la noche (abre 24h).</span></li>
               </ul>
            </div>
          </div>
        )}

        {/* PESTAÑA MAPA */}
        {activeTab === 'calendario' && (
          <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
            {itinerary.map((day) => (
              <div key={day.id} className="flex border-b border-slate-50 last:border-0 text-sm">
                <div className={`w-16 ${themeStyles[day.theme].bg} p-4 text-center border-r border-slate-50 flex flex-col justify-center`}>
                  <span className={`text-[10px] ${themeStyles[day.theme].text} font-black opacity-50 uppercase`}>{day.date.split('-')[1]}</span>
                  <span className={`text-base font-black ${themeStyles[day.theme].text}`}>{day.date.split('-')[0]}</span>
                </div>
                <div className="flex-1 p-4 font-bold text-slate-700 flex items-center leading-tight italic">{day.mainActivity}</div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA RUTA (TIMELINE LIMPIO SIN CUADROS) */}
        {activeTab === 'itinerario' && (
          <div className="space-y-4 pb-10">
            {itinerary.map((day) => {
              const theme = themeStyles[day.theme];
              const isExpanded = expandedDays.includes(day.id);
              return (
                <div key={day.id} className="bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden">
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className="w-full flex items-center justify-between p-5 transition-all hover:bg-slate-50">
                    <div className="flex items-center gap-4 text-left">
                      <div className={`px-4 py-1.5 rounded-full ${theme.bg} ${theme.text} text-[11px] font-black tracking-tight`}>{day.date}</div>
                      <span className="font-black text-sm text-slate-800 tracking-tight uppercase">{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 border-t border-slate-50">
                      <div className="mb-6 mt-2">
                         <p className="text-[14px] font-black text-slate-800 italic">"{day.mainActivity}"</p>
                      </div>
                      
                      {/* DISEÑO DE LÍNEA DE TIEMPO LIMPIA */}
                      <div className="space-y-0">
                        {day.activities.map((act) => (
                          <div key={act.id} className="relative pl-6 border-l-2 border-slate-100 ml-2 pb-6 last:pb-0 text-left">
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${theme.dot} border-[3px] border-white shadow-sm`} />
                            
                            <div className="mb-1">
                              <span className={`text-[11px] font-black ${theme.text} uppercase tracking-tight block mb-0.5`}>{act.time}</span>
                              <span className="font-black text-sm text-slate-800 uppercase leading-none">{act.name}</span>
                            </div>
                            
                            {act.hours && <p className="text-[10px] font-bold text-slate-400 mt-1.5 tracking-tight">⏱️ {act.hours}</p>}
                            
                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1.5">{act.notes}</p>
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

        {/* PESTAÑA CHECK */}
        {activeTab === 'reservas' && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 text-left">
            <h3 className="font-black text-slate-800 text-lg uppercase mb-6 flex items-center gap-2">
               <CheckSquare className="w-5 h-5 text-slate-400" /> Control de Reservas
            </h3>
            <div className="space-y-1">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer active:scale-95 transition-all">
                  <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-slate-900 checked:bg-slate-900 focus:ring-slate-900 transition-all" />
                  <span className={`text-xs font-black italic tracking-tight transition-all ${item.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.text}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-6 p-5 bg-amber-50 rounded-[24px] border border-amber-100 flex gap-3">
               <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
               <div>
                  <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-1">Cuidado</p>
                  <p className="text-xs font-medium text-amber-800 leading-relaxed">Shibuya Sky y Pokémon Café vuelan apenas salen. Revisar web exacto <strong>4 semanas antes</strong>.</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
