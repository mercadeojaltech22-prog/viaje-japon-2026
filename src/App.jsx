import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Train, Ticket, 
  ChevronDown, ChevronUp, Zap, Clock, AlignLeft, Trash2, Plus, AlertTriangle, Building
} from 'lucide-react';

// --- TUS LLAVES DE FIREBASE ---
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

// --- TUS 15 DÍAS COMPLETOS (CON ESCALAS Y NOTAS) ---
const initialItinerary = [
  { id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Salida MDE → MEX', activities: [{ id: 'a_v1', time: '01:00', name: 'Vuelo MDE → MEX (AM799)', notes: '✈️ Llegada 04:35 AM. ⏱️ ESCALA: 17h 40m. 🇲🇽 LOGÍSTICA: Hay tiempo para salir. Deben hacer migración de entrada a México. Recomendado: Desayunar tacos en el Centro Histórico, caminar por Reforma y el Ángel. Estar de vuelta 3h antes.' }, { id: 'a_v2', time: '22:15', name: 'Vuelo MEX → NRT (AM58)', notes: '✈️ Salida hacia Tokio. Escala larga para trámites migratorios cómoda y descanso antes del tramo largo.' }] },
  { id: 'd_v2', date: '14-may', region: 'En tránsito', theme: 'blue', mainActivity: 'Cruze del Pacífico', activities: [{ id: 'a_v3', time: '12:00', name: 'Vuelo en curso sobre el Pacífico', notes: '✈️ Cruzando la línea internacional de fecha. Hidratarse mucho y tratar de ajustar el sueño al horario de Japón.' }] },
  { id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Aterrizaje + Ueno + Asakusa', activities: [{ id: 'a1', time: '06:30', name: 'Aterrizaje en Narita (NRT)', notes: '✈️ AM58. 1. Pasar migración (Visit Japan Web QR). 2. ATM 7-Eleven para efectivo. 3. Activar eSIM. 4. Cargar Suica/Pasmo en el cel.' }, { id: 'a2', time: '08:30', name: 'Traslado Keisei Skyliner a Ueno', notes: '🚆 Traslado rápido (~40 min, ¥2,570, Reserva recomendada). Dejar maletas en Hotel Tokio 1 (Ueno). Si la habitación no está, las guardan en recepción.' }, { id: 'a3', time: '13:00', name: 'Templo Senso-ji (Asakusa)', notes: '🚆 Línea Ginza (G). Recorrer calle Nakamise. ⛩️ El templo está abierto siempre, pero los puestos cierran a las 17:00.' }, { id: 'a4', time: '17:30', name: 'Tokyo Skytree (Atardecer)', notes: '🎟️ Reserva obligatoria. 🚶‍♂️ Paseo de 15 min cruzando el río Sumida. Ver la ciudad iluminada.' }, { id: 'a4b', time: '19:30', name: 'Hobby Off / Don Quijote Asakusa', notes: '🛍️ Compras de figuras y snacks. Don Quijote abre 24h.' }] },
  { id: 'd2', date: '16-may', region: 'Tokio → Osaka', theme: 'blue', mainActivity: 'Shibuya, Odaiba y Shinkansen', activities: [{ id: 'a5', time: '09:00', name: 'Shibuya (Cruce y Hachiko)', notes: '🚆 JR Yamanote. Ver el cruce más famoso. Almuerzo rápido por la zona.' }, { id: 'a6', time: '14:00', name: 'Odaiba (Gundam Gigante)', notes: '🚆 Línea Rinkai o Yurikamome. Ver el robot y la Estatua de la Libertad pequeña. ⚠️ Estar en la estación para el Shinkansen a las 17:30.' }, { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Salida desde Estación Tokio o Shinagawa (~¥14,500, Smart EX). 🧳 MALETAS: Recomendado enviarlas por Yamato Takkyubin antes de las 10:00 AM para que lleguen mañana a Osaka.' }] },
  { id: 'd3', date: '17-may', region: 'Nagoya / Osaka', theme: 'rose', mainActivity: 'Ghibli Park (10:00 AM)', activities: [{ id: 'a8', time: '07:15', name: 'Salida Hotel Osaka', notes: '🚆 Metro Midosuji a Shin-Osaka. Desayuno de estación (Eki-ben).' }, { id: 'a9', time: '07:45', name: 'Shinkansen a Nagoya', notes: '🚆 ~50 min. En Nagoya cambiar a Metro Línea Higashiyama hasta Fujigaoka.' }, { id: 'a10', time: '09:15', name: 'Tren Linimo a Nagakute', notes: '🚆 Transbordo al tren magnético Linimo. El paisaje es muy bonito.' }, { id: 'a11', time: '10:00', name: 'ENTRADA GHIBLI PARK', notes: '🎟️ CONFIRMADA. No hay re-entrada. Recorrer el Gran Almacén Ghibli. El parque cierra a las 17:00.' }, { id: 'a12', time: '18:30', name: 'Regreso y Cena en Dotonbori', notes: '🚆 Deshacer ruta. Cena de bienvenida en Osaka: Takoyaki y Okonomiyaki bajo los neones.' }] },
  { id: 'd4', date: '18-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Universal Studios Japan (USJ)', activities: [{ id: 'a13', time: '07:30', name: 'Salida a USJ', notes: '🚆 JR Yumesaki Line. 🎟️ CONFIRMADO. Usar la App oficial de USJ para pedir el "Timed Entry Ticket" de Super Nintendo World apenas entren al parque.' }] },
  { id: 'd5', date: '19-may', region: 'Nara', theme: 'emerald', mainActivity: 'Ciervos y Templos de Nara', activities: [{ id: 'a14', time: '09:00', name: 'Tren a Nara', notes: '🚆 Línea Kintetsu-Nara (¥680, más rápido). 🦌 Comprar galletas (shika-senbei) para los ciervos. Visitar Templo Todai-ji y Kasuga Taisha.' }] },
  { id: 'd6', date: '20-may', region: 'Kioto Sur', theme: 'emerald', mainActivity: 'Inari, Uji y Calles Tradicionales', activities: [{ id: 'a15', time: '07:00', name: 'Fushimi Inari (Miles de Torii)', notes: '⛩️ CRÍTICO: Llegar máximo 7:30 AM para evitar las masas. 🚆 Tren JR Nara desde Osaka (45 min).' }, { id: 'a16', time: '10:30', name: 'Uji (Matcha de Verdad)', notes: '🚆 Tren directo desde Inari (15 min). Visitar Templo Byodo-in y probar helado de té verde.' }, { id: 'a17', time: '14:30', name: 'Ninenzaka y Sannenzaka', notes: '🚶‍♂️ Calles históricas. El Starbucks tradicional en casa de madera está aquí. Caminar hacia Kiyomizu-dera.' }, { id: 'a18', time: '17:00', name: 'Gion (Distrito de Geishas)', notes: '🚶‍♂️ Caminar por la calle Hanamikoji al atardecer. Cena por Pontocho.' }] },
  { id: 'd7', date: '21-may', region: 'Kioto Norte', theme: 'emerald', mainActivity: 'Arashiyama y Pabellón Dorado', activities: [{ id: 'a19', time: '07:30', name: 'Arashiyama (Bambú)', notes: '🚆 JR Sagano Line. Bosque de bambú, Templo Tenryu-ji y el puente de madera Togetsukyo.' }, { id: 'a20', time: '11:00', name: 'Kinkaku-ji (Pabellón de Oro)', notes: '🚌 Bus local (204/205). Abre 9:00 - 17:00. Espectacular con luz de mañana.' }, { id: 'a21', time: '13:30', name: 'Mercado Nishiki (Almuerzo)', notes: '🚌 Bus al centro. Probar de todo en los puestos. Comprar palillos japoneses de recuerdo.' }] },
  { id: 'd8', date: '22-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Castillo y Pokémon Café', activities: [{ id: 'a22', time: '09:30', name: 'Castillo Osaka / Shitenno-ji', notes: '🚆 JR Loop Line. Shitenno-ji es el templo budista más antiguo administrado oficialmente.' }, { id: 'a23', time: '13:00', name: 'Pokémon Café Osaka', notes: '🎟️ RESERVA OBLIGATORIA (Chequear 31 días antes 6:00 PM hora JPN). Ser muy puntuales.' }, { id: 'a24', time: '18:00', name: 'Shinsekai', notes: '🚆 Metro Sakaisuji. Zona retro con vibras de los 80s. Cenar Kushikatsu (brochetas fritas).' }] },
  { id: 'd9', date: '23-may', region: 'Traslado Fuji → Tokio', theme: 'rose', mainActivity: 'Shibazakura y Vista al Fuji', activities: [{ id: 'a25', time: '06:30', name: 'Salida Osaka → Mishima', notes: '🚆 Shinkansen Kodama (~¥12,000). 🧳 Haber enviado maletas ayer a Tokio para ir solo con morral.' }, { id: 'a26', time: '09:30', name: 'Bus Mishima → Kawaguchiko', notes: '🚌 Bus expreso (¥2,300). Comprar ticket al llegar a la estación Mishima.' }, { id: 'a27', time: '11:30', name: 'Festival Shibazakura', notes: '🚌 Tomar el "Shibazakura Liner" (30 min). Ver el mar de flores rosas con el Fuji al fondo. 🍜 Almorzar Houtou Noodles.' }, { id: 'a28', time: '16:30', name: 'Highway Bus a Shinjuku (Tokio)', notes: '🚌 Directo a Tokio (~¥2,200). ⚠️ ¡Reservar este bus semanas antes!' }] },
  { id: 'd10', date: '24-may', region: 'Kamakura', theme: 'rose', mainActivity: 'Gran Buda y Atardecer', activities: [{ id: 'a29', time: '09:30', name: 'Kamakura (Daibutsu)', notes: '🚆 JR Shonan-Shinjuku Line. Visitar el Buda Gigante y el Templo Hasedera (vistas al mar).' }, { id: 'a30', time: '15:30', name: 'Isla de Enoshima', notes: '🚆 Tren Enoden (clásico). Caminar por la isla y ver el atardecer.' }] },
  { id: 'd11', date: '25-may', region: 'Tokio', theme: 'blue', mainActivity: 'DÍA LIBRE y Despedida', activities: [{ id: 'a31', time: '10:00', name: 'DÍA LIBRE (Shopping)', notes: 'Shimokitazawa (Ropa vintage) o Nakano Broadway (Anime retro).' }, { id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: '✈️ Salida hacia el aeropuerto. El grupo restante se muda al Hotel Tokio 3 (Ueno).' }] },
  { id: 'd12', date: '26-may', region: 'Tokio', theme: 'blue', mainActivity: 'teamLab y Harajuku', activities: [{ id: 'a33', time: '09:00', name: 'teamLab Planets (Toyosu)', notes: '🎟️ Reserva previa. 🚆 Línea Yurikamome. Se entra descalzo al agua. Experiencia inmersiva.' }, { id: 'a34', time: '13:00', name: 'Harajuku / Omotesando', notes: '🚆 JR Yamanote. Calle Takeshita (locura) y Santuario Meiji Jingu (paz).' }] },
  { id: 'd13', date: '27-may', region: 'Tokio', theme: 'blue', mainActivity: 'Akihabara Final Run', activities: [{ id: 'a35', time: '10:30', name: 'Akihabara', notes: '🚆 Línea Yamanote o Hibiya. Arcades de SEGA/GiGO y compras de electrónica finales.' }] },
  { id: 'd14', date: '28-may', region: 'Tokio → Seúl', theme: 'blue', mainActivity: 'Regreso (Tramo 1)', activities: [{ id: 'a36', time: '16:00', name: 'Traslado a Narita (NRT)', notes: '🚆 Keisei Skyliner. Estar 3h antes. Vuelo KE714 a las 20:55.' }, { id: 'a37', time: '23:25', name: 'Llegada Seúl (ICN)', notes: '🇰🇷 ⏱️ ESCALA NOCTURNA: 12h 15m. Recomendado: Hotel cápsula en el aeropuerto o hotel cercano con transfer.' }] },
  { id: 'd15', date: '29-may', region: 'Seúl → COL', theme: 'blue', mainActivity: 'Regreso a Casa', activities: [{ id: 'a38', time: '11:40', name: 'Vuelo ICN → MEX (AM91)', notes: '✈️ ⏱️ ESCALA MEX: 5h 40m en Ciudad de México. No da para salir, mejor esperar en sala VIP.' }, { id: 'a39', time: '22:00', name: 'Aterrizaje en Medellín (MDE)', notes: '✈️ AM798. ¡Llegada triunfal! 🎌' }] }
];

// --- LISTA DE CHEQUEO COMPLETA ---
const initialChecklist = [
  { id: 'c_v1', category: 'transporte', text: 'Ida: MDE-MEX (AM799) y MEX-NRT (AM58)', completed: true },
  { id: 'c_v2', category: 'transporte', text: 'Regreso: NRT-ICN (KE714), ICN-MEX (AM91), MEX-MDE (AM798)', completed: true },
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (Ueno) - 15 Mayo', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (Namba) - 16-23 Mayo', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (Ueno) - 23-25 Mayo', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (Ueno) - 25-28 Mayo', completed: true },
  { id: 'c_t1', category: 'transporte', text: 'Shinkansen: Tokio → Osaka (16 Mayo)', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Shinkansen: Osaka → Mishima (23 Mayo)', completed: false },
  { id: 'c_t3', category: 'transporte', text: 'Highway Bus: Kawaguchiko → Shinjuku (23 Mayo)', completed: false },
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park (17 Mayo) - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios Japan (18 Mayo) - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Tokyo Skytree (15 Mayo)', completed: false },
  { id: 'c_a4', category: 'atraccion', text: 'Pokémon Café Osaka (22 Mayo)', completed: false },
  { id: 'c_a5', category: 'atraccion', text: 'teamLab Planets (26 Mayo)', completed: false },
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
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic underline decoration-amber-400">🎌 JAPAN 2026</h1>
            <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full uppercase tracking-tighter animate-pulse">En Línea ☁️</span>
          </div>
          <div className="flex px-2 pb-2 overflow-x-auto hide-scrollbar">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'calendario', icon: CalendarDays, label: 'Mapa' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 min-w-[75px] flex flex-col items-center justify-center gap-1 py-2.5 px-1 mx-1 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl scale-100' : 'text-slate-400 hover:bg-slate-100 scale-95'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                <Moon className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Noches</p>
                <p className="text-lg font-black text-slate-800 tracking-tight">13 (JP)</p>
              </div>
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                <Zap className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base</p>
                <p className="text-lg font-black text-slate-800 tracking-tight">TKY/OSK</p>
              </div>
            </div>

            <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Train className="w-24 h-24" /></div>
               <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-indigo-100"><Train className="w-5 h-5" /> Logística Shinkansen</h3>
               <ul className="text-xs space-y-3 opacity-90 font-medium">
                 <li className="flex gap-2"><span>•</span> <strong>Smart EX:</strong> App obligatoria para comprar billetes. Se asocia a tu Suica digital.</li>
                 <li className="flex gap-2"><span>•</span> <strong>Maletas Grandes:</strong> En el Shinkansen se DEBE reservar asiento con espacio para equipaje si miden más de 160cm (total).</li>
                 <li className="flex gap-2"><span>•</span> <strong>Yamato Takkyubin:</strong> Envía maletas el día anterior (¥2500 aprox). Viaja ligero entre ciudades, ¡tus rodillas lo agradecerán!</li>
               </ul>
            </div>

            <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 shadow-sm">
               <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-3"><Zap className="w-5 h-5" /> Tips de Movilidad</h3>
               <ul className="text-xs text-emerald-800 space-y-3 font-medium">
                 <li className="flex gap-2"><span>•</span> <strong>Suica Digital:</strong> Agrégala al Wallet de tu móvil. Se recarga en 2 segundos y sirve para metros, máquinas y tiendas.</li>
                 <li className="flex gap-2"><span>•</span> <strong>Google Maps:</strong> Te dice hasta el número de salida del metro. Síguelo a ciegas.</li>
                 <li className="flex gap-2"><span>•</span> <strong>Efectivo:</strong> Indispensable para templos pequeños, el "Shibazakura Liner" y recargar Suica física si no usas la digital.</li>
               </ul>
            </div>
          </div>
        )}

        {activeTab === 'calendario' && (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Panorama de Actividades</p>
            </div>
            {itinerary.map((day) => (
              <div key={day.id} className="flex border-b border-slate-50 last:border-0 text-sm">
                <div className={`w-20 ${themeStyles[day.theme].bg} p-4 font-black text-center border-r border-slate-100 flex flex-col justify-center`}>
                  <span className={`text-[10px] ${themeStyles[day.theme].text} opacity-60 uppercase`}>{day.date.split('-')[1]}</span>
                  <span className={`text-base ${themeStyles[day.theme].text}`}>{day.date.split('-')[0]}</span>
                </div>
                <div className="flex-1 p-4 font-bold text-slate-700 flex items-center leading-tight">{day.mainActivity}</div>
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
                      <div className={`px-4 py-1.5 rounded-full ${theme.iconBg} ${theme.iconText} text-xs font-black shadow-sm`}>{day.date}</div>
                      <span className="font-black text-sm text-slate-800 tracking-tight uppercase">{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-3 bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
                      <div className="mb-8">
                         <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Objetivo</h3>
                         <p className="text-sm font-black text-slate-800 leading-tight italic text-left">"{day.mainActivity}"</p>
                      </div>
                      <div className="space-y-8">
                        {day.activities.map((act) => (
                          <div key={act.id} className="relative pl-8 border-l-2 border-slate-100 last:border-l-0 text-left">
                            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full ${theme.iconBg} border-4 border-white shadow-md`} />
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-[10px] font-black ${theme.iconText} tracking-tighter opacity-70`}>{act.time}</span>
                              <span className="font-black text-sm text-slate-800 leading-none tracking-tight">{act.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-[20px] border border-slate-50 font-medium">{act.notes}</p>
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
          <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            {[
              { cat: 'hospedaje', label: 'Hospedajes', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { cat: 'transporte', label: 'Vuelos y Shinkansen', icon: Train, color: 'text-rose-600', bg: 'bg-rose-50' },
              { cat: 'atraccion', label: 'Atracciones', icon: Ticket, color: 'text-emerald-600', bg: 'bg-emerald-50' }
            ].map((section) => (
              <div key={section.cat} className="bg-white rounded-[40px] p-8 border shadow-sm border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 ${section.bg} ${section.color} rounded-[20px]`}><section.icon className="w-6 h-6" /></div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase">{section.label}</h3>
                </div>
                <div className="space-y-3 text-left">
                  {checklist.filter(item => item.category === section.cat).map(item => (
                    <label key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[24px] cursor-pointer transition-all active:scale-95 group border border-transparent hover:border-slate-100">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className="w-7 h-7 rounded-[10px] border-2 border-slate-200 text-slate-900 focus:ring-0 checked:bg-slate-900 transition-all cursor-pointer" />
                      </div>
                      <span className={`text-sm font-black tracking-tight transition-all ${item.completed ? 'text-slate-300 line-through decoration-[3px]' : 'text-slate-700'}`}>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-4 text-left">
               <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
               <div>
                  <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-1">Nota de Seguridad</p>
                  <p className="text-xs font-medium text-amber-800 leading-relaxed">Verificar fechas de Shinkansen y Pokémon Café <strong>31 días antes</strong>. Las plazas se agotan en minutos.</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
