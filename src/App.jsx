import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Sun, Train, Ticket, Search,
  ChevronDown, ChevronUp, Zap, ShoppingBag, AlertTriangle, BookOpen, Building, Lightbulb, MapPin, CloudCog
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
    routeQuery: 'saddr=Jose+Maria+Cordova+International+Airport&daddr=Mexico+City+International+Airport+to:Narita+International+Airport',
    activities: [
      { id: 'a_v1', time: '01:00', name: 'Salida MDE → MEX', notes: '✈️ Llegada 04:35 AM. ⏱️ ESCALA: 17h 40m. 🇲🇽 LOGÍSTICA: Es obligatorio hacer pre-registro y migración en México si se desea salir a conocer. Recomendación: Salir a desayunar tacos al Centro Histórico.', link: 'https://www.inm.gob.mx/spublic/portal/inmex.html', linkLabel: '📝 Pre-registro MX' },
      { id: 'a_v2', time: '22:15', name: 'MEX → NRT', notes: '✈️ Tramo largo hacia Tokio. Estar de vuelta en el aeropuerto 3 horas antes.' }
    ] 
  },
  { 
    id: 'd1', date: '15-may', region: 'TOKIO (UENO/ASAKUSA)', theme: 'blue', mainActivity: 'Asakusa + Skytree + Compras', 
    routeQuery: 'saddr=Narita+International+Airport&daddr=Senso-ji+to:Asakusa+Hanayashiki+to:Tokyo+Skytree+to:Don+Quijote+Asakusa',
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje Narita (NRT)', notes: 'Pasar migración. Recoger Suica/Pasmo. 🚆 TRASLADO: Tomar Tren Keisei Skyliner (Aeropuerto ↔ Tokio) hasta Ueno.' },
      { id: 'a2', time: '13:00', name: 'Templo Senso-ji', notes: '⛩️ Recorrer Nakamise. 🛍️ Comprar el "Goshuincho" (Libro de sellos). Ver el Centro Turístico Asakusa (Mirador piso 8 gratis).' },
      { id: 'a3', time: '15:00', name: 'Asakusa Hanayashiki', notes: '🎢 Parque vintage japonés. Luego ver el edificio Asahi y cruzar hacia el Skytree.' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree', hours: '10:00 - 21:00', notes: '🎟️ Subir para ver el atardecer sobre Tokio. (Reserva previa).' },
      { id: 'a5', time: '19:30', name: 'Don Quijote + Hobby Off', notes: '🛍️ Donki para snacks y Hobby Off para figuras de anime baratas.' }
    ] 
  },
  { 
    id: 'd2', date: '16-may', region: 'TOKIO → OSAKA', theme: 'blue', mainActivity: 'Shibuya + Odaiba + Shinkansen', 
    routeQuery: 'saddr=Shibuya+Crossing&daddr=Shibuya+Sky+to:Odaiba+Gundam+Base+to:Tokyo+Station+to:Shin-Osaka+Station',
    activities: [
      { id: 'a5', time: '09:00', name: 'Shibuya y Hachiko', notes: 'Cruce peatonal famoso y foto con el perrito.' },
      { id: 'a5b', time: '10:30', name: 'Shibuya Sky', notes: '🎟️ RESERVA OBLIGATORIA (4 semanas antes). Vista panorámica increíble.' },
      { id: 'a6', time: '14:00', name: 'Odaiba (Gundam Base)', notes: '🚆 Tren Yurikamome. Ver el Gundam gigante y centro comercial DiverCity.' },
      { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Salida Estación Tokio. Comprar Eki-ben en la estación para cenar en el tren bala.' }
    ] 
  },
  { 
    id: 'd3', date: '17-may', region: 'NAGOYA (GHIBLI PARK)', theme: 'rose', mainActivity: 'Parque Ghibli + Noche Osaka', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Ghibli+Park,+Aichi+to:Dotonbori,+Osaka',
    activities: [
      { id: 'a11', time: '10:00', name: 'Parque Ghibli (Nagoya)', hours: '10:00 - 17:00', notes: '🎟️ CONFIRMADO. 🛍️ La tienda "Adventurous Spirit" tiene cosas únicas.', link: 'https://quickticket.moala.fun/books?id=14afc57f-d0b6-4a66-a902-7bb79d1e4e7f', linkLabel: '🎟️ Abrir Ticket QR' },
      { id: 'a11b', time: '17:30', name: 'Regreso a Osaka', notes: '🚆 LOGÍSTICA: Tren Linimo -> Metro Higashiyama -> Shinkansen desde Nagoya a Shin-Osaka (aprox 1.5h).' },
      { id: 'a12', time: '19:30', name: 'Dotonbori (Osaka)', notes: '🐙 Noche de neones, Takoyaki y el famoso cartel de Glico Man.' }
    ] 
  },
  { 
    id: 'd4', date: '18-may', region: 'OSAKA (UNIVERSAL STUDIOS)', theme: 'emerald', mainActivity: 'Universal Studios Japan (USJ)', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Universal+Studios+Japan',
    activities: [
      { id: 'a13', time: '08:00', name: 'Día en USJ', notes: '🚆 TRASLADO: JR Yumesaki Line desde Nishikujo. 🚆 REGRESO: Misma ruta inversa hacia Namba/Osaka.' }
    ] 
  },
  { 
    id: 'd5', date: '19-may', region: 'NARA', theme: 'emerald', mainActivity: 'Templos y Tradición de Nara', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Todai-ji,+Nara+to:Kasuga+Taisha+to:Naramachi',
    activities: [
      { id: 'a14', time: '09:30', name: 'Todai-ji + Kasuga Taisha', notes: '🦌 Ciervos y Buda gigante. 🚆 TRASLADO: Tren Kintetsu desde Namba. 🚆 REGRESO: Tren Kintetsu vuelta a Osaka.' },
      { id: 'a14b', time: '15:00', name: 'Naramachi', notes: '🚶 Distrito antiguo. 🛍️ Souvenirs y destilerías de sake.' }
    ] 
  },
  { 
    id: 'd9', date: '23-may', region: 'FUJI → TOKIO', theme: 'rose', mainActivity: 'Fuji Shibazakura + Omoide Yokocho', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Fuji+Shibazakura+Festival+to:Omoide+Yokocho,+Shinjuku',
    activities: [
      { id: 'a25', time: '06:30', name: 'Salida Osaka → Mishima', notes: '🚆 Shinkansen Kodama muy temprano.' },
      { id: 'a27', time: '11:00', name: 'Shibazakura Festival', notes: '🌸 Mar de flores rosas frente al Fuji. 🚌 TRASLADO: Bus local desde Mishima.' },
      { id: 'a28', time: '16:30', name: 'Bus de Larga Distancia (Highway Bus)', notes: '🚌 Regreso directo del Fuji a Shinjuku (Tokio). 🎟️ RESERVA PREVIA OBLIGATORIA.' },
      { id: 'a28b', time: '19:30', name: 'Omoide Yokocho (Shinjuku)', notes: '🍢 Humo, yakitoris y cervezas en el callejón retro.' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'TOKIO', theme: 'blue', mainActivity: 'Shimokitazawa + Nintendo + Despedida', 
    routeQuery: 'saddr=Shimokitazawa+Station&daddr=Nintendo+Tokyo+to:Ueno+Station',
    activities: [
      { id: 'a31', time: '10:00', name: 'Shimokitazawa', notes: '🛍️ Barrio bohemio: ropa vintage y cafés. 🚆 TRASLADO: A solo 5 min de Shibuya en la línea Keio Inokashira.' },
      { id: 'a31b', time: '13:00', name: 'Nintendo Tokyo (Shibuya PARCO)', notes: '🕹️ Tienda oficial en el piso 6. Aprovechar para compras finales de figuras y regalos.' },
      { id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: '✈️ Ellos salen al aeropuerto. El resto del grupo se muda al Hotel Tokio 3 (Ueno).' }
    ] 
  }
];

// --- LISTA DE CHEQUEO A PRUEBA DE BOBOS ---
const initialChecklist = [
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (Ueno) - 15 Mayo (1 Noche, 5 Personas)', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (Namba) - 16 al 23 Mayo (7 Noches, 5 Personas)', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (Ueno) - 23 al 25 Mayo (2 Noches, 5 Personas)', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (Ueno) - 25 al 28 Mayo (3 Noches, 3 Personas)', completed: true },
  
  { id: 'c_t1', category: 'transporte', text: 'Shinkansen: Tokio → Osaka (30 días antes)', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Bus de Larga Distancia (Highway Bus): Kawaguchiko → Shinjuku', completed: false },
  { id: 'c_t4', category: 'transporte', text: 'Tren Keisei Skyliner (Aeropuerto Narita ↔ Tokio)', completed: false },
  
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Shibuya Sky (4 semanas antes)', completed: false },
  { id: 'c_a4', category: 'atraccion', text: 'Pokémon Café Osaka (31 días antes)', completed: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [expandedDays, setExpandedDays] = useState([]);
  const [selectedMapDay, setSelectedMapDay] = useState('d1');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.body.style.backgroundColor = isDarkMode ? '#020617' : '#ffffff';
  }, [isDarkMode]);

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
    setChecklist(updated); await sync(itinerary, updated);
  };

  const forceUpdateCloud = async () => {
    if(window.confirm("¿Forzar actualización total?")) {
      const mergedChecklist = initialChecklist.map(initItem => {
        const existingItem = checklist.find(c => c.id === initItem.id);
        return existingItem ? { ...initItem, completed: existingItem.completed } : initItem;
      });
      await setDoc(doc(db, "viaje", "datos"), { itinerary: initialItinerary, checklist: mergedChecklist });
      alert("¡Nube actualizada!");
    }
  };

  const getTheme = (themeName) => {
    if (themeName === 'blue') return { bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100', text: isDarkMode ? 'text-blue-300' : 'text-blue-900', pillBg: isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200', dot: 'bg-blue-500' };
    if (themeName === 'emerald') return { bg: isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100', text: isDarkMode ? 'text-emerald-300' : 'text-emerald-900', pillBg: isDarkMode ? 'bg-emerald-800/50' : 'bg-emerald-200', dot: 'bg-emerald-500' };
    return { bg: isDarkMode ? 'bg-rose-900/30' : 'bg-rose-100', text: isDarkMode ? 'text-rose-300' : 'text-rose-900', pillBg: isDarkMode ? 'bg-rose-800/50' : 'bg-rose-200', dot: 'bg-rose-500' };
  };

  const filteredItinerary = itinerary.filter(day => 
    day.mainActivity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.activities.some(act => act.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`min-h-screen touch-pan-y ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800'} font-sans pb-10 transition-colors duration-300`}>
      <div className={`sticky top-0 z-20 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} border-b pt-safe`}>
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter italic">🎌 JAPAN 2026</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2">{isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}</button>
        </div>
        <div className="flex px-3 pb-2 justify-between max-w-md mx-auto">
          {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'mapa', icon: MapPin, label: 'Mapa' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center gap-1.5 py-3 w-20 rounded-[20px] ${activeTab === item.id ? (isDarkMode ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-900 text-white shadow-lg') : 'text-slate-400'}`}>
              <item.icon className="w-5 h-5" /><span className="text-[8px] font-black uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        {activeTab === 'resumen' && (
          <div className="space-y-4 animate-in fade-in">
            <div className={`rounded-[28px] p-6 border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
               <h3 className="font-black text-base mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-emerald-900 dark:text-emerald-300" /> Guía de Compras</h3>
               <ul className="text-xs space-y-3 font-medium">
                 <li>• <strong>Loft:</strong> El paraíso del diseño y la papelería.</li>
                 <li>• <strong>Matsumoto Kiyoshi:</strong> Skincare y cosméticos virales.</li>
                 <li>• <strong>Okashi No Machioka:</strong> Dulces y snacks al mejor precio.</li>
                 <li>• <strong>Lawson Store 100 / Daiso:</strong> Todo a 100 yenes. Souvenirs perfectos.</li>
               </ul>
            </div>
            <div className="pt-8 flex justify-end">
              <button onClick={forceUpdateCloud} className="text-slate-200 dark:text-slate-800"><CloudCog className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {activeTab === 'itinerario' && (
          <div className="space-y-4 pb-10">
            <div className={`flex items-center mb-6 p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <Search className="w-4 h-4 ml-3 text-slate-400" />
              <input type="text" placeholder="Buscar Skytree, Nintendo, USJ..." className="w-full bg-transparent p-3 text-xs font-bold focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {filteredItinerary.map((day) => {
              const theme = getTheme(day.theme);
              const isExpanded = expandedDays.includes(day.id) || searchTerm !== '';
              return (
                <div key={day.id} className="mb-4">
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[24px] ${isExpanded ? (isDarkMode ? 'bg-slate-900' : 'bg-slate-50') : theme.bg}`}>
                    <div className="flex items-center gap-4 text-left">
                      <div className={`px-4 py-2 rounded-[16px] ${theme.pillBg} ${theme.text} text-[11px] font-black`}>{day.date}</div>
                      <div className="flex flex-col">
                        <span className={`font-black text-[12px] ${theme.text} uppercase`}>{day.region}</span>
                        {(day.mainActivity.includes("Ghibli") || day.mainActivity.includes("USJ")) && <span className="text-[9px] font-black opacity-60 uppercase">🎡 {day.mainActivity}</span>}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2">
                      <div className="space-y-6">
                        {day.activities.map((act) => (
                          <div key={act.id} className="relative pl-6 border-l-2 ml-2 text-left">
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${theme.dot} border-[3px] ${isDarkMode ? 'border-slate-950' : 'border-white'}`} />
                            <div className="mb-1"><span className="text-[11px] font-black uppercase block">{act.time}</span><span className="font-black text-[13px] uppercase">{act.name}</span></div>
                            <p className="text-[12px] opacity-70 leading-relaxed">{act.notes}</p>
                            {act.link && <a href={act.link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 mt-3 text-[10px] font-black ${theme.text} ${theme.pillBg} px-4 py-2 rounded-xl`} onClick={(e) => e.stopPropagation()}>{act.linkLabel} 🔗</a>}
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
        {/* MAPA Y RESERVAS IGUAL... */}
      </main>
    </div>
  );
}
