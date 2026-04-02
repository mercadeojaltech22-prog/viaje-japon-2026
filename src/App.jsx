import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Train, Ticket, 
  ChevronDown, ChevronUp, Zap, ShoppingBag, AlertTriangle, BookOpen, Building, Lightbulb
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

// --- ITINERARIO MAESTRO ---
const initialItinerary = [
  { 
    id: 'd_v1', date: '13-may', region: 'VUELO IDA', theme: 'blue', mainActivity: 'Salida MDE → MEX', 
    activities: [
      { id: 'a_v1', time: '01:00', name: 'Salida MDE → MEX', notes: '✈️ Llegada 04:35 AM. ⏱️ ESCALA: 17h 40m. 🇲🇽 LOGÍSTICA: Es obligatorio hacer pre-registro y migración en México si se desea salir a conocer. Recomendación: Salir a desayunar tacos al Centro Histórico.', link: 'https://www.inm.gob.mx/spublic/portal/inmex.html', linkLabel: '📝 Llenar Pre-registro (México)' },
      { id: 'a_v2', time: '22:15', name: 'MEX → NRT', notes: '✈️ Tramo largo hacia Tokio. Estar de vuelta en el aeropuerto 3 horas antes.' }
    ] 
  },
  { 
    id: 'd_v2', date: '14-may', region: 'EN TRÁNSITO', theme: 'blue', mainActivity: 'Cruce del Pacífico', 
    activities: [
      { id: 'a_v3', time: '12:00', name: 'Día en el aire', notes: '✈️ Cruzando la línea internacional de fecha. Tratar de ajustar el sueño al horario de Japón.' }
    ] 
  },
  { 
    id: 'd1', date: '15-may', region: 'TOKIO', theme: 'blue', mainActivity: 'Aterrizaje + Ueno + Asakusa', 
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje Narita (NRT)', notes: 'Pasar migración (Mostrar QR de Visit Japan Web). Recoger Suica/Pasmo y activar eSIM. Dejar maletas en hotel.', link: 'https://www.vjw.digital.go.jp/', linkLabel: '🛂 Llenar Visit Japan Web' },
      { id: 'a3', time: '13:00', name: 'Templo Senso-ji', hours: 'Abre 6:00 - Cierra 17:00', notes: '⛩️ Comprar el "Goshuincho" (Libro de sellos). En cada templo pondrán una caligrafía única. La calle Nakamise (comida) cierra a las 17:00.' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree', hours: 'Abre 10:00 - Cierra 21:00', notes: '🎟️ Reserva obligatoria. Subir para el atardecer.' }
    ] 
  },
  { 
    id: 'd2', date: '16-may', region: 'TOKIO → OSAKA', theme: 'blue', mainActivity: 'Shibuya + Shinkansen', 
    activities: [
      { id: 'a5', time: '09:00', name: 'Shibuya Crossing', notes: 'Cruce peatonal más famoso y foto con Hachiko.' },
      { id: 'a5b', time: '10:30', name: 'Shibuya Sky', hours: 'Abre 10:00 - Cierra 22:30', notes: '🎟️ RESERVA OBLIGATORIA (Hacerla 4 semanas antes). Vista panorámica al aire libre.' },
      { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Tip: Comprar Eki-ben (lunch box japonesas) en la estación para cenar adentro del tren bala.' }
    ] 
  },
  { 
    id: 'd3', date: '17-may', region: 'NAGOYA / OSAKA', theme: 'rose', mainActivity: 'Ghibli Park', 
    activities: [
      { id: 'a11', time: '10:00', name: 'Ghibli Park', hours: 'Abre 10:00 - Cierra 17:00', notes: '🎟️ CONFIRMADO. 🛍️ La tienda "Adventurous Spirit" tiene mercancía exclusiva que no venden en Tokio.' }
    ] 
  },
  { 
    id: 'd4', date: '18-may', region: 'OSAKA', theme: 'emerald', mainActivity: 'Universal Studios Japan', 
    activities: [
      { id: 'a13', time: '08:00', name: 'USJ', hours: 'Varia (~8:00 - 21:00)', notes: '🎟️ CONFIRMADO. Apenas se pase la puerta de entrada, usar la app de USJ para sacar el "Timed Entry Ticket" de Nintendo.' }
    ] 
  },
  { 
    id: 'd5', date: '19-may', region: 'NARA', theme: 'emerald', mainActivity: 'Ciervos y Templos', 
    activities: [
      { id: 'a14', time: '09:30', name: 'Templo Todai-ji', hours: 'Abre 7:30 - Cierra 17:30', notes: '🦌 Comprar galletas oficiales para los ciervos. El Buda de bronce adentro es gigante.' }
    ] 
  },
  { 
    id: 'd6', date: '20-may', region: 'KIOTO SUR', theme: 'emerald', mainActivity: 'Fushimi Inari + Calles Tradicionales', 
    activities: [
      { id: 'a15', time: '07:00', name: 'Fushimi Inari', hours: 'Abierto 24 horas', notes: '⛩️ Subir temprano hasta el primer mirador para tomar fotos sin tanta gente.' },
      { id: 'a17', time: '14:30', name: 'Ninenzaka y Sannenzaka', notes: 'Caminar por las calles de madera. ☕ Buscar el Starbucks escondido en una casa tradicional.' }
    ] 
  },
  { 
    id: 'd7', date: '21-may', region: 'KIOTO NORTE', theme: 'emerald', mainActivity: 'Pabellón Dorado', 
    activities: [
      { id: 'a19', time: '08:00', name: 'Bosque de Bambú', hours: 'Abierto 24 horas', notes: 'Llegar temprano para disfrutar la paz del bosque.' },
      { id: 'a20', time: '11:00', name: 'Kinkaku-ji (Pabellón Oro)', hours: 'Abre 9:00 - Cierra 17:00', notes: 'Espectacular para fotos con el reflejo del agua.' }
    ] 
  },
  { 
    id: 'd8', date: '22-may', region: 'OSAKA', theme: 'emerald', mainActivity: 'Castillo + Pokémon Café', 
    activities: [
      { id: 'a22', time: '09:30', name: 'Castillo de Osaka', hours: 'Abre 9:00 - Cierra 17:00', notes: 'Recorrido por los jardines exteriores.' },
      { id: 'a23', time: '13:00', name: 'Pokémon Café', hours: 'Abre 10:00 - Cierra 21:30', notes: '🎟️ RESERVA CRÍTICA. 🛍️ Solo aquí venden al Pikachu Chef exclusivo.' }
    ] 
  },
  { 
    id: 'd9', date: '23-may', region: 'TRASLADO FUJI → TOKIO', theme: 'rose', mainActivity: 'Fuji + Omoide Yokocho', 
    activities: [
      { id: 'a27', time: '11:00', name: 'Shibazakura Festival', hours: 'Abre 8:00 - Cierra 16:00', notes: 'Ver el Fuji con los campos de flores rosas.' },
      { id: 'a28', time: '16:30', name: 'Highway Bus', notes: '🚌 Regreso directo a la estación de Shinjuku en Tokio.' },
      { id: 'a28b', time: '19:30', name: 'Omoide Yokocho (Shinjuku)', hours: 'Bares cierran medianoche', notes: '🍢 El famoso callejón retro. Yakitoris y cervezas. ¡Plan perfecto para cenar los 5 juntos!' }
    ] 
  },
  { 
    id: 'd10', date: '24-may', region: 'KAMAKURA', theme: 'rose', mainActivity: 'Gran Buda + Atardecer Costero', 
    activities: [
      { id: 'a29', time: '09:30', name: 'Buda Gigante', hours: 'Abre 8:00 - Cierra 17:30', notes: 'Templo Kotoku-in.' },
      { id: 'a29b', time: '12:00', name: 'Cruce Kamakurakokomae', notes: '📸 PARADA FOTOGRÁFICA: El famoso cruce de tren verde frente al mar (De la intro del anime Slam Dunk).' },
      { id: 'a30', time: '15:30', name: 'Isla de Enoshima', notes: 'Caminar cruzando el puente, ver el atardecer en los acantilados.' },
      { id: 'a30b', time: '18:30', name: 'Regreso a Tokio', notes: '🚆 Tomar el tren Odakyu Romancecar directo desde la costa hasta Shinjuku (1h 15m).' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'TOKIO', theme: 'blue', mainActivity: 'DÍA LIBRE y Despedida', 
    activities: [
      { id: 'a31', time: '10:00', name: 'Shopping Libre', notes: '🛍️ Recomendaciones: Nakano Broadway (Cosas retro) o Shimokitazawa (Vintage).' },
      { id: 'a32', time: '20:00', name: 'Despedida', notes: '✈️ Vuelo al aeropuerto. El resto del grupo se muda al Hotel Tokio 3 (Ueno).' }
    ] 
  },
  { 
    id: 'd12', date: '26-may', region: 'TOKIO', theme: 'blue', mainActivity: 'teamLab + Harajuku', 
    activities: [
      { id: 'a33', time: '09:00', name: 'teamLab Planets', hours: 'Abre 9:00 - Cierra 22:00', notes: '🎟️ Reserva obligatoria. Importante llevar pantalón que se pueda arremangar hasta la rodilla.' },
      { id: 'a34', time: '13:00', name: 'Harajuku / Takeshita Dori', notes: 'Comer crepes callejeros y ver las tiendas de moda extravagante.' }
    ] 
  },
  { 
    id: 'd13', date: '27-may', region: 'TOKIO', theme: 'blue', mainActivity: 'Akihabara', 
    activities: [
      { id: 'a35', time: '11:00', name: 'Akihabara', hours: 'Tiendas abren 10:00 - 11:00 AM', notes: '🕹️ Gachapones, electrónica y arcades de SEGA/GiGO.' }
    ] 
  },
  { 
    id: 'd14', date: '28-may', region: 'TOKIO → SEÚL', theme: 'blue', mainActivity: 'Compras + Tramo 1', 
    activities: [
      { id: 'a35b', time: '09:00', name: 'Compras última hora (Ueno)', hours: 'Abre 11:00 AM', notes: '🛍️ Aprovechar la mañana para visitar Yamashiroya (6 pisos de juguetes y kits de casas en miniatura).' },
      { id: 'a36', time: '16:00', name: 'Salida a Narita (NRT)', notes: '🚆 Tren Keisei Skyliner. Vuelo a Seúl a las 20:55.' },
      { id: 'a37', time: '23:25', name: 'Llegada a Seúl (ICN)', notes: '🇰🇷 ⏱️ ESCALA NOCTURNA. ⚠️ CRÍTICO: Si se desea salir del aeropuerto a la ciudad, es obligatorio tramitar el permiso K-ETA por internet semanas antes. Si no, dormir en el hotel cápsula Darakhyu dentro de la terminal.', link: 'https://www.k-eta.go.kr/', linkLabel: '🇰🇷 Tramitar K-ETA Oficial' }
    ] 
  },
  { 
    id: 'd15', date: '29-may', region: 'SEÚL → COL', theme: 'blue', mainActivity: 'Regreso a Casa', 
    activities: [
      { id: 'a38', time: '11:40', name: 'Vuelo ICN → MEX', notes: '✈️ ⏱️ Escala en CDMX. Mejor descansar en sala VIP, no da el tiempo para salir.' },
      { id: 'a39', time: '22:00', name: 'Aterrizaje Medellín (MDE)', notes: '✈️ Fin de la aventura. 🎌' }
    ] 
  }
];

// --- LISTA DE CHEQUEO ACTUALIZADA ---
const initialChecklist = [
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (Ueno) - 15 Mayo', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (Namba) - 16-23 Mayo', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (Ueno) - 23-25 Mayo', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (Ueno) - 25-28 Mayo', completed: true },
  
  { id: 'c_v1', category: 'transporte', text: 'Vuelos Ida (MDE-MEX-NRT)', completed: true },
  { id: 'c_v2', category: 'transporte', text: 'Vuelos Regreso (NRT-ICN-MEX-MDE)', completed: true },
  { id: 'c_t1', category: 'transporte', text: 'Shinkansen: Tokio → Osaka', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Bus Highway: Kawaguchiko → Shinjuku', completed: false },
  { id: 'c_t4', category: 'transporte', text: 'Tren Narita Express o Keisei Skyliner', completed: false },
  { id: 'c_t3', category: 'transporte', text: 'Permiso K-ETA (Corea del Sur)', completed: false },
  
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Shibuya Sky', completed: false },
  { id: 'c_a4', category: 'atraccion', text: 'Pokémon Café Osaka', completed: false },
  { id: 'c_a5', category: 'atraccion', text: 'teamLab Planets', completed: false },
  { id: 'c_a6', category: 'atraccion', text: 'Tokyo Skytree', completed: false }
];

// COLORES PARA LAS FRANJITAS COMPLETAS
const themeStyles = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-900', pillBg: 'bg-blue-200', dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-900', pillBg: 'bg-emerald-200', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-900', pillBg: 'bg-rose-200', dot: 'bg-rose-500' }
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

  // BOTÓN MÁGICO PARA FORZAR LA NUBE
  const forceUpdateCloud = async () => {
    if(window.confirm("¿Sobreescribir la base de datos de la nube con los nuevos enlaces integrados?")) {
      await setDoc(doc(db, "viaje", "datos"), { itinerary: initialItinerary, checklist: initialChecklist });
      alert("¡Nube actualizada! Los links oficiales están listos para usarse.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-10">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 pt-safe">
        <div className="max-w-md mx-auto">
          <div className="px-5 py-4 flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">🎌 JAPAN 2026</h1>
            <div className="flex gap-2">
              <button onClick={forceUpdateCloud} className="text-[9px] font-bold px-3 py-1 bg-rose-100 text-rose-700 rounded-full animate-bounce border border-rose-200 shadow-sm active:scale-95">
                🔄 FORZAR NUBE
              </button>
              <span className="text-[9px] font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full animate-pulse border border-green-100">☁️ Sincronizado</span>
            </div>
          </div>
          <div className="flex px-3 pb-2 justify-between">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center gap-1.5 py-3 w-24 rounded-[20px] transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        
        {/* INFO */}
        {activeTab === 'resumen' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-[28px] p-5">
                <Moon className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Noches</p>
                <p className="text-xl font-black text-slate-900">13 (JP)</p>
              </div>
              <div className="bg-slate-50 rounded-[28px] p-5">
                <Zap className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Bases</p>
                <p className="text-xl font-black text-slate-900">TKY/OSK</p>
              </div>
            </div>

            <div className="bg-rose-50 rounded-[28px] p-6 border border-rose-100">
               <h3 className="font-black text-base mb-4 text-rose-900 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Tips de Supervivencia</h3>
               <ul className="text-xs text-rose-800 space-y-3 font-medium">
                 <li>• <strong>Maletas (Yamato Takkyubin):</strong> Viajen ligeros en el Shinkansen. Es súper recomendado enviar las maletas grandes desde el hotel de Tokio al de Osaka un día antes (aprox ¥2500).</li>
                 <li>• <strong>Suica en el Celular:</strong> Si tienen iPhone, agreguen la tarjeta Suica a su Apple Wallet desde su país. Se recarga en 2 segundos con Apple Pay y los salva de hacer filas en las máquinas de metro.</li>
                 <li>• <strong>Cultura de Basura:</strong> En Japón no se come caminando por la calle y es casi imposible encontrar basureros públicos. Lleven siempre una bolsita en la mochila para guardar sus empaques.</li>
                 <li>• <strong>Compras Tax-Free:</strong> Lleven su pasaporte físico (no foto) siempre encima. En compras mayores a ¥5,000 en la mayoría de tiendas grandes, les descuentan el 10% de impuestos al pagar.</li>
               </ul>
            </div>

            <div className="bg-indigo-50 rounded-[28px] p-6 border border-indigo-100">
               <h3 className="font-black text-base mb-3 text-indigo-900 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Goshuincho Tip</h3>
               <p className="text-xs text-indigo-800 leading-relaxed font-medium">Comprar el libro de sellos (Goshuincho) el primer día en el Templo Senso-ji. En cada templo o santuario, los monjes harán una caligrafía única a mano por ¥300-¥500. Es el recuerdo más lindo del viaje. ⛩️</p>
            </div>

            <div className="bg-emerald-50 rounded-[28px] p-6 border border-emerald-100">
               <h3 className="font-black text-base mb-4 text-emerald-900 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Compras Rápidas</h3>
               <ul className="text-xs text-emerald-800 space-y-3 font-medium">
                 <li>• <strong>Yamashiroya (Ueno):</strong> 6 pisos inmensos de juguetes, Ghibli y casitas en miniatura japonesas.</li>
                 <li>• <strong>Don Quijote (Donki):</strong> La cadena que abre 24h. Ideal para comprar KitKats raros de matcha y souvenirs a las 11 de la noche.</li>
                 <li>• <strong>Uniqlo (Ginza):</strong> 12 pisos enteros de ropa. El más grande del mundo.</li>
               </ul>
            </div>
          </div>
        )}

        {/* RUTA CON LAS FRANJITAS */}
        {activeTab === 'itinerario' && (
          <div className="space-y-4 pb-10">
            {itinerary.map((day) => {
              const theme = themeStyles[day.theme];
              const isExpanded = expandedDays.includes(day.id);
              
              return (
                <div key={day.id} className="transition-all duration-300">
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[24px] transition-all duration-300 ${isExpanded ? 'bg-slate-50 mb-2' : theme.bg}`}>
                    <div className="flex items-center gap-4 text-left">
                      <div className={`px-4 py-2 rounded-[16px] ${theme.pillBg} ${theme.text} text-[11px] font-black tracking-tight`}>{day.date}</div>
                      <span className={`font-black text-[13px] ${theme.text} uppercase tracking-tighter`}>{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className={`w-5 h-5 ${theme.text} opacity-50`} /> : <ChevronDown className={`w-5 h-5 ${theme.text} opacity-50`} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2">
                      <div className="mb-6">
                         <p className="text-[14px] font-black text-slate-800 italic">"{day.mainActivity}"</p>
                      </div>
                      
                      <div className="space-y-0">
                        {day.activities.map((act) => (
                          <div key={act.id} className="relative pl-6 border-l-2 border-slate-100 ml-2 pb-6 last:pb-0 text-left">
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${theme.dot} border-[3px] border-white shadow-sm`} />
                            
                            <div className="mb-1">
                              <span className={`text-[11px] font-black ${theme.text} uppercase tracking-tight block mb-0.5`}>{act.time}</span>
                              <span className="font-black text-[13px] text-slate-800 leading-tight uppercase">{act.name}</span>
                            </div>
                            
                            {act.hours && <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-tight">⏱️ {act.hours}</p>}
                            <p className="text-[12px] text-slate-600 font-medium leading-relaxed mt-2">{act.notes}</p>
                            
                            {/* BOTÓN CON LINK INCORPORADO */}
                            {act.link && (
                              <a 
                                href={act.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`inline-flex items-center gap-1 mt-3 text-[11px] font-black ${theme.text} ${theme.pillBg} px-4 py-2 rounded-xl hover:opacity-80 transition-all shadow-sm active:scale-95`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {act.linkLabel} 🔗
                              </a>
                            )}
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

        {/* CHECK DIVIDIDO POR CATEGORÍAS */}
        {activeTab === 'reservas' && (
          <div className="space-y-8 pb-24 animate-in fade-in duration-300">
            
            {/* SECCIÓN HOSPEDAJE */}
            <div className="bg-slate-50 rounded-[32px] p-6">
               <h3 className="font-black text-slate-900 text-sm uppercase mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-indigo-500" /> Hospedajes</h3>
               <div className="space-y-2">
                 {checklist.filter(i => i.category === 'hospedaje').map(item => (
                   <label key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-[20px] cursor-pointer active:scale-95 transition-all shadow-sm">
                     <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className="w-6 h-6 rounded-lg border-2 border-slate-300 text-indigo-600 checked:bg-indigo-600 transition-all" />
                     <span className={`text-[12px] font-black italic tracking-tight ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</span>
                   </label>
                 ))}
               </div>
            </div>

            {/* SECCIÓN TRANSPORTE */}
            <div className="bg-slate-50 rounded-[32px] p-6">
               <h3 className="font-black text-slate-900 text-sm uppercase mb-4 flex items-center gap-2"><Train className="w-5 h-5 text-rose-500" /> Transportes y Trámites</h3>
               <div className="space-y-2">
                 {checklist.filter(i => i.category === 'transporte').map(item => (
                   <label key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-[20px] cursor-pointer active:scale-95 transition-all shadow-sm">
                     <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className="w-6 h-6 rounded-lg border-2 border-slate-300 text-rose-600 checked:bg-rose-600 transition-all" />
                     <span className={`text-[12px] font-black italic tracking-tight ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</span>
                   </label>
                 ))}
               </div>
               <div className="mt-4 p-4 bg-rose-100/50 rounded-[20px] flex gap-3 text-left border border-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p className="text-[11px] font-medium text-rose-800 leading-relaxed"><strong>¡Atención!</strong> Los tickets de trenes bala (App SmartEX) y buses de larga distancia (Highway Bus al Fuji) se habilitan para comprar exactamente <strong>30 días antes</strong> de la fecha del viaje.</p>
               </div>
            </div>

            {/* SECCIÓN ATRACCIONES */}
            <div className="bg-slate-50 rounded-[32px] p-6">
               <h3 className="font-black text-slate-900 text-sm uppercase mb-4 flex items-center gap-2"><Ticket className="w-5 h-5 text-emerald-500" /> Atracciones</h3>
               <div className="space-y-2">
                 {checklist.filter(i => i.category === 'atraccion').map(item => (
                   <label key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-[20px] cursor-pointer active:scale-95 transition-all shadow-sm">
                     <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className="w-6 h-6 rounded-lg border-2 border-slate-300 text-emerald-600 checked:bg-emerald-600 transition-all" />
                     <span className={`text-[12px] font-black italic tracking-tight ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</span>
                   </label>
                 ))}
               </div>
               <div className="mt-4 p-4 bg-amber-50 rounded-[20px] flex gap-3 text-left border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] font-medium text-amber-800 leading-relaxed"><strong>Advertencia Nivel Extremo:</strong> Las reservas para Shibuya Sky y Pokémon Café vuelan en minutos. Pongan una alarma <strong>4 semanas antes a las 6:00 PM (hora de Japón)</strong>.</p>
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
