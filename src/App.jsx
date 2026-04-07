import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Train, Ticket, Search,
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

// --- ITINERARIO MAESTRO CON LOGÍSTICA COMPLETA ---
const initialItinerary = [
  { 
    id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Salida MDE → MEX', 
    routeQuery: 'saddr=Jose+Maria+Cordova+International+Airport&daddr=Mexico+City+International+Airport+to:Narita+International+Airport',
    activities: [
      { id: 'a_v1', time: '01:00', name: 'Salida MDE → MEX', notes: '✈️ Llegada 04:35 AM. ⏱️ ESCALA: 17h 40m. 🇲🇽 LOGÍSTICA: Es obligatorio hacer pre-registro y migración en México si se desea salir a conocer. Recomendación: Salir a desayunar tacos al Centro Histórico.', link: 'https://www.inm.gob.mx/spublic/portal/inmex.html', linkLabel: '📝 Pre-registro MX' },
      { id: 'a_v2', time: '22:15', name: 'MEX → NRT', notes: '✈️ Tramo largo hacia Tokio. Estar de vuelta en el aeropuerto 3 horas antes.' }
    ] 
  },
  { 
    id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Ueno + Asakusa + Skytree', 
    routeQuery: 'saddr=Narita+International+Airport&daddr=Asakusa+Culture+Tourist+Information+Center+to:Kaminarimon+to:Senso-ji+to:Asakusa+Hanayashiki+to:Tokyo+Skytree+to:Don+Quijote+Asakusa',
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje Narita (NRT)', notes: 'Pasar migración. Recoger Suica/Pasmo y activar eSIM. 🚆 TRASLADO: Tomar Tren Keisei Skyliner (Aeropuerto ↔ Tokio) hasta Ueno.', link: 'https://www.vjw.digital.go.jp/', linkLabel: '🛂 Visit Japan Web' },
      { id: 'a2', time: '13:00', name: 'Templo Senso-ji', notes: '⛩️ Recorrer calle Nakamise. 🛍️ Comprar el "Goshuincho" (Libro de sellos). Ver el Centro Turístico Asakusa (Mirador piso 8).' },
      { id: 'a3', time: '15:00', name: 'Asakusa Hanayashiki', notes: '🎢 El parque de atracciones más antiguo de Japón. Vistas vintage increíbles.' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree', hours: '10:00 - 21:00', notes: '🎟️ Reserva obligatoria. Cruzar el río viendo el edificio Asahi y subir para el atardecer.' },
      { id: 'a5', time: '19:30', name: 'Don Quijote + Hobby Off', notes: '🛍️ Compras de snacks 24h y figuras de anime de segunda mano baratas en Asakusa.' }
    ] 
  },
  { 
    id: 'd2', date: '16-may', region: 'Tokio → Osaka', theme: 'blue', mainActivity: 'Shibuya + Odaiba', 
    routeQuery: 'saddr=Shibuya+Crossing&daddr=Shibuya+Sky+to:Odaiba+Gundam+Base+to:Tokyo+Station+to:Shin-Osaka+Station',
    activities: [
      { id: 'a5', time: '09:00', name: 'Shibuya y Hachiko', notes: 'Cruce peatonal más famoso del mundo y foto con el perrito.' },
      { id: 'a5b', time: '10:30', name: 'Shibuya Sky', hours: '10:00 - 22:30', notes: '🎟️ RESERVA OBLIGATORIA (Hacerla 4 semanas antes). Vista panorámica increíble.' },
      { id: 'a6', time: '14:00', name: 'Odaiba (Gundam Base)', notes: '🚆 Tomar el tren Yurikamome. Ver el Gundam Unicorn gigante a escala real y el centro comercial DiverCity.' },
      { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Salida Estación Tokio. Comprar Eki-ben (lunch box japonesas) para cenar en el tren bala.' }
    ] 
  },
  { 
    id: 'd3', date: '17-may', region: 'Nagoya / Osaka', theme: 'rose', mainActivity: 'Parque Ghibli + Noche Osaka', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Ghibli+Park,+Aichi+to:Dotonbori,+Osaka',
    activities: [
      { id: 'a11', time: '10:00', name: 'Parque Ghibli (Nagoya)', hours: '10:00 - 17:00', notes: '🎟️ CONFIRMADO. 🛍️ La tienda "Adventurous Spirit" tiene mercancía exclusiva.', link: 'https://quickticket.moala.fun/books?id=14afc57f-d0b6-4a66-a902-7bb79d1e4e7f', linkLabel: '🎟️ Abrir Entrada QR' },
      { id: 'a11b', time: '17:30', name: 'Retorno a Osaka', notes: '🚆 LOGÍSTICA REGRESO: Tomar Tren Linimo hasta Fujigaoka -> Metro Línea Higashiyama hasta Nagoya -> Shinkansen a Shin-Osaka.' },
      { id: 'a12', time: '19:30', name: 'Dotonbori (Osaka)', notes: '🐙 Noche fuerte en Osaka. Comer Takoyaki, Okonomiyaki y foto con el Glico Man bajo los neones.' }
    ] 
  },
  { 
    id: 'd4', date: '18-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Universal Studios Japan', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Universal+Studios+Japan',
    activities: [
      { id: 'a13', time: '08:00', name: 'Día en USJ', notes: '🚆 IDA: Línea JR Yumesaki desde Nishikujo. 🎟️ CONFIRMADO. Usar app para "Timed Entry" de Nintendo. 🚆 REGRESO: Misma ruta inversa a Osaka.' }
    ] 
  },
  { 
    id: 'd5', date: '19-may', region: 'Nara', theme: 'emerald', mainActivity: 'Ciervos y Tradición', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Todai-ji,+Nara+to:Kasuga+Taisha+to:Naramachi',
    activities: [
      { id: 'a14', time: '09:30', name: 'Templo Todai-ji + Kasuga Taisha', notes: '🚆 IDA: Tren Kintetsu-Nara desde Namba. 🦌 Comprar galletas para ciervos. Ver el Buda gigante.' },
      { id: 'a14b', time: '15:00', name: 'Naramachi', notes: '🚶 Distrito antiguo comercial. 🚆 REGRESO: Tren Kintetsu de vuelta a Osaka (40 min).' }
    ] 
  },
  { 
    id: 'd6', date: '20-may', region: 'Kioto Sur', theme: 'emerald', mainActivity: 'Fushimi Inari + Uji + Gion', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Fushimi+Inari+Taisha+to:Byodo-in,+Uji+to:Gion,+Kyoto',
    activities: [
      { id: 'a15', time: '07:00', name: 'Fushimi Inari', hours: 'Abierto 24h', notes: '⛩️ Subir temprano al primer mirador para fotos sin masas. 🚆 IDA: Línea Keihan desde Osaka.' },
      { id: 'a16', time: '11:00', name: 'Uji y Templo Byodo-in', notes: '🍵 Capital del Matcha. El templo Byodo-in sale en la moneda de ¥10.' },
      { id: 'a17', time: '17:00', name: 'Barrio de Gion', notes: '🚶 Caminar por Hanamikoji al atardecer. 🚆 REGRESO: Línea Keihan desde Gion-Shijo hacia Osaka.' }
    ] 
  },
  { 
    id: 'd7', date: '21-may', region: 'Kioto Norte', theme: 'emerald', mainActivity: 'Arashiyama + Kinkaku-ji', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Arashiyama+Bamboo+Forest+to:Kinkaku-ji,+Kyoto+to:Nishiki+Market+to:Ninenzaka',
    activities: [
      { id: 'a19', time: '08:00', name: 'Bosque de Bambú', notes: '🎋 Llegar temprano. 🚆 IDA: JR Kyoto Line -> JR Sagano Line.' },
      { id: 'a20', time: '11:30', name: 'Kinkaku-ji (Pabellón de Oro)', notes: '📸 Espectacular para fotos con el reflejo del agua.' },
      { id: 'a21', time: '14:30', name: 'Nishiki Market', notes: '🍢 Probar comida callejera local. (Ojo: ¡Cierra a las 5 PM!).' },
      { id: 'a21b', time: '17:00', name: 'Ninenzaka / Sannenzaka', notes: '☕ Calles de madera históricas en la colina. Aquí queda el Starbucks tradicional.' }
    ] 
  },
  { 
    id: 'd8', date: '22-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Castillo + Kuromon + Pokémon', 
    routeQuery: 'saddr=Osaka+Castle&daddr=Kuromon+Ichiba+Market+to:Pokemon+Cafe,+Osaka+to:Shinsekai,+Osaka',
    activities: [
      { id: 'a22', time: '09:00', name: 'Castillo de Osaka', notes: 'Recorrido por los inmensos jardines exteriores.' },
      { id: 'a22b', time: '11:00', name: 'Kuromon Ichiba Market', notes: '🍣 "La cocina de Osaka". Excelente para almorzar mariscos y Wagyu.' },
      { id: 'a23', time: '14:00', name: 'Pokémon Café', notes: '🎟️ RESERVA CRÍTICA. 🛍️ Venden al Pikachu Chef exclusivo. ⚠️ Enviar maletas a Tokio.' },
      { id: 'a24', time: '18:00', name: 'Shinsekai', notes: '🍻 Zona retro, vibras cyberpunk. Comer Kushikatsu (brochetas fritas).' }
    ] 
  },
  { 
    id: 'd9', date: '23-may', region: 'Traslado Fuji → Tokio', theme: 'rose', mainActivity: 'Shibazakura + Omoide Yokocho', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Mishima+Station+to:Fuji+Shibazakura+Festival+to:Omoide+Yokocho,+Shinjuku',
    activities: [
      { id: 'a25', time: '06:30', name: 'Salida Osaka → Mishima', notes: '🚆 Shinkansen Kodama muy temprano.' },
      { id: 'a27', time: '11:00', name: 'Shibazakura Festival', notes: '🌸 Ver el Fuji con flores rosas. 🚌 TRASLADO: Bus local desde Mishima.' },
      { id: 'a28', time: '16:30', name: 'Bus de Larga Distancia (Highway Bus)', notes: '🚌 Regreso directo del Fuji a Shinjuku (Tokio). 🎟️ RESERVA PREVIA.' },
      { id: 'a28b', time: '19:30', name: 'Omoide Yokocho (Shinjuku)', notes: '🍢 Cena en el callejón de los yakitoris. ¡Plan perfecto los 5!' }
    ] 
  },
  { 
    id: 'd10', date: '24-may', region: 'Kamakura', theme: 'rose', mainActivity: 'Gran Buda + Atardecer Costero', 
    routeQuery: 'saddr=Shinjuku+Station&daddr=Kotoku-in,+Kamakura+to:Hasedera+to:Kamakurakokomae+Station+to:Enoshima+to:Shinjuku+Station',
    activities: [
      { id: 'a29', time: '09:30', name: 'Buda Gigante (Daibutsu)', notes: 'Templo Kotoku-in. 🚆 IDA: Línea JR Shonan-Shinjuku.' },
      { id: 'a29c', time: '12:30', name: 'Cruce Kamakurakokomae', notes: '📸 FOTO: El famoso cruce de tren frente al mar (Slam Dunk).' },
      { id: 'a30', time: '15:30', name: 'Isla de Enoshima', notes: 'Caminar por la isla y ver el atardecer. 🚆 REGRESO: Tren directo Odakyu Romancecar a Shinjuku (1h 15m).' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'Tokio', theme: 'blue', mainActivity: 'Shimokitazawa + Nintendo + Despedida', 
    routeQuery: 'saddr=Shimokitazawa+Station&daddr=Nintendo+Tokyo+to:Ueno+Station',
    activities: [
      { id: 'a31', time: '10:00', name: 'Barrio Shimokitazawa', notes: '🛍️ Barrio bohemio: ropa vintage, cafés y tiendas de discos.' },
      { id: 'a31b', time: '13:00', name: 'Nintendo Tokyo (Shibuya PARCO)', notes: '🕹️ Tienda oficial de Nintendo (Piso 6 de PARCO). 🚆 TRASLADO: A 5 min de Shimokitazawa en línea Keio Inokashira.' },
      { id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: '✈️ Salida al aeropuerto. El grupo (3 personas) se muda al Hotel Tokio 3 (Ueno).' }
    ] 
  },
  { 
    id: 'd12', date: '26-may', region: 'Tokio', theme: 'blue', mainActivity: 'teamLab + Harajuku', 
    routeQuery: 'saddr=Ueno+Station&daddr=teamLab+Planets+Tokyo+to:Takeshita+Street,+Harajuku',
    activities: [
      { id: 'a33', time: '09:00', name: 'teamLab Planets', notes: '🎟️ Reserva previa. OJO: No confundir con Borderless. Llevar pantalón para arremangar.' },
      { id: 'a34', time: '13:00', name: 'Harajuku / Takeshita Dori', notes: 'Moda extravagante y crepes.' }
    ] 
  },
  { 
    id: 'd13', date: '27-may', region: 'Tokio', theme: 'blue', mainActivity: 'Akihabara Final Run', 
    routeQuery: 'saddr=Ueno+Station&daddr=Akihabara+Radio+Kaikan',
    activities: [
      { id: 'a35', time: '11:00', name: 'Akihabara', notes: '🕹️ Buscar edificio "Radio Kaikan" para figuras, Gachapones y arcades.' }
    ] 
  },
  { 
    id: 'd14', date: '28-may', region: 'Tokio → Seúl', theme: 'blue', mainActivity: 'Compras Finales + Vuelo', 
    routeQuery: 'saddr=Yamashiroya,+Ueno&daddr=Narita+International+Airport+to:Incheon+International+Airport',
    activities: [
      { id: 'a35b', time: '09:00', name: 'Compras última hora (Ueno)', notes: '🛍️ Visitar Yamashiroya (6 pisos de juguetes y casitas en miniatura) o Ameyoko.' },
      { id: 'a36', time: '16:00', name: 'Salida a Narita (NRT)', notes: '🚆 Keisei Skyliner. Vuelo a Seúl a las 20:55.' },
      { id: 'a37', time: '23:25', name: 'Llegada a Seúl (ICN)', notes: '🇰🇷 ⏱️ ESCALA NOCTURNA. ⚠️ CRÍTICO: Tramitar K-ETA si desean salir a la ciudad.', link: 'https://www.k-eta.go.kr/', linkLabel: '🇰🇷 Tramitar K-ETA' }
    ] 
  },
  { 
    id: 'd15', date: '29-may', region: 'Seúl → COL', theme: 'blue', mainActivity: 'Regreso a Casa', 
    routeQuery: 'saddr=Incheon+International+Airport&daddr=Mexico+City+International+Airport+to:Jose+Maria+Cordova+International+Airport',
    activities: [
      { id: 'a38', time: '11:40', name: 'Vuelo ICN → MEX', notes: '✈️ ⏱️ Escala en CDMX. Mejor esperar en sala VIP, no da tiempo de salir.' },
      { id: 'a39', time: '22:00', name: 'Aterrizaje en Medellín (MDE)', notes: '✈️ ¡Misión cumplida! 🎌' }
    ] 
  }
];

// --- LISTA DE CHEQUEO A PRUEBA DE BOBOS ---
const initialChecklist = [
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (Ueno) - 15 Mayo (1 Noche, 5 Personas)', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (Namba) - 16 al 23 Mayo (7 Noches, 5 Personas)', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (Ueno) - 23 al 25 Mayo (2 Noches, 5 Personas)', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (Ueno) - 25 al 28 Mayo (3 Noches, 3 Personas)', completed: true },
  
  { id: 'c_v1', category: 'transporte', text: 'Vuelos Ida (MDE-MEX-NRT)', completed: true },
  { id: 'c_v2', category: 'transporte', text: 'Vuelos Regreso (NRT-ICN-MEX-MDE)', completed: true },
  { id: 'c_t1', category: 'transporte', text: 'Shinkansen: Tokio → Osaka (Reservar 30 días antes)', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Bus de Larga Distancia (Highway Bus): Kawaguchiko → Shinjuku', completed: false },
  { id: 'c_t4', category: 'transporte', text: 'Tren Keisei Skyliner (Aeropuerto Narita ↔ Tokio)', completed: false },
  { id: 'c_t3', category: 'transporte', text: 'Permiso K-ETA (Corea del Sur)', completed: false },
  
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Shibuya Sky (Reservar 4 semanas antes)', completed: false },
  { id: 'c_a4', category: 'atraccion', text: 'Pokémon Café Osaka (Reservar 31 días antes)', completed: false },
  { id: 'c_a5', category: 'atraccion', text: 'teamLab Planets', completed: false },
];

// ESTILOS ORIGINALES INTACTOS (Puros, sin modo oscuro)
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
  const [selectedMapDay, setSelectedMapDay] = useState('d1');
  const [searchTerm, setSearchTerm] = useState('');

  // Bloqueo de zoom para mejorar experiencia en móvil
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.body.style.backgroundColor = '#f8fafc';
  }, []);

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

  const forceUpdateCloud = async () => {
    if(window.confirm("¿Forzar actualización en la nube para guardar los nuevos cambios maestros?")) {
      const mergedChecklist = initialChecklist.map(initItem => {
        const existingItem = checklist.find(c => c.id === initItem.id);
        return existingItem ? { ...initItem, completed: existingItem.completed } : initItem;
      });
      await setDoc(doc(db, "viaje", "datos"), { itinerary: initialItinerary, checklist: mergedChecklist });
      alert("¡Nube actualizada!");
    }
  };

  // Lógica de búsqueda
  const filteredItinerary = itinerary.filter(day => 
    day.mainActivity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.activities.some(act => act.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen touch-pan-y bg-slate-50/50 text-slate-800 font-sans pb-10">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm pt-safe">
        <div className="max-w-md mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic underline decoration-amber-400">🎌 JAPAN 2026</h1>
            <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full uppercase tracking-tighter animate-pulse">En Línea ☁️</span>
          </div>
          <div className="flex px-2 pb-2 overflow-x-auto hide-scrollbar">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'mapa', icon: MapPin, label: 'Mapa' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 min-w-[75px] flex flex-col items-center justify-center gap-1 py-2.5 px-1 mx-1 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl scale-100' : 'text-slate-400 hover:bg-slate-100 scale-95'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        {/* PESTAÑA INFO */}
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

            <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 shadow-sm">
               <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-3"><ShoppingBag className="w-5 h-5" /> Guía de Compras Expertas</h3>
               <ul className="text-xs text-emerald-800 space-y-3 font-medium">
                 <li>• <strong>Loft:</strong> El paraíso del diseño japonés, papelería y belleza.</li>
                 <li>• <strong>Matsumoto Kiyoshi:</strong> Farmacia gigante, ideal para skincare y cosméticos a precios insuperables.</li>
                 <li>• <strong>Okashi No Machioka:</strong> Especialistas en dulces y snacks de remate.</li>
                 <li>• <strong>Tiendas de 100 Yenes:</strong> <em>Daiso</em>, <em>Seria</em>, <em>Can*Do</em> y <em>Lawson Store 100</em>. Todo a ~$2,600 COP.</li>
               </ul>
            </div>

            <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Train className="w-24 h-24" /></div>
               <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-indigo-100"><Train className="w-5 h-5" /> Logística Shinkansen</h3>
               <ul className="text-xs space-y-3 opacity-90 font-medium">
                 <li className="flex gap-2"><span>•</span> <strong>Smart EX:</strong> App obligatoria para comprar billetes.</li>
                 <li className="flex gap-2"><span>•</span> <strong>Yamato Takkyubin:</strong> Envía maletas el día anterior (¥2500 aprox) para viajar ligeros entre Tokio y Osaka.</li>
               </ul>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={forceUpdateCloud} className="p-2 text-slate-300 hover:text-slate-400 transition-colors" title="Forzar nube">
                <CloudCog className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA RUTA */}
        {activeTab === 'itinerario' && (
          <div className="space-y-4 pb-10">
            <div className="relative flex items-center mb-6 p-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Search className="w-4 h-4 ml-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar lugar (Skytree, Nintendo, USJ)..." 
                className="w-full bg-transparent p-3 text-xs font-bold text-slate-700 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredItinerary.map((day) => {
              const theme = themeStyles[day.theme];
              const isExpanded = expandedDays.includes(day.id) || searchTerm !== '';
              return (
                <div key={day.id}>
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[28px] border transition-all duration-300 ${isExpanded ? 'bg-white shadow-xl ring-2 ring-slate-100' : theme.bg + ' ' + theme.border}`}>
                    <div className="flex items-center gap-3 text-left">
                      <div className={`px-4 py-1.5 rounded-full ${theme.iconBg} ${theme.iconText} text-[10px] font-black shadow-sm`}>{day.date}</div>
                      <div className="flex flex-col">
                        <span className="font-black text-[11px] text-slate-800 tracking-tight uppercase">{day.region}</span>
                        {(day.id === 'd3') && <span className={`text-[9px] font-black opacity-60 uppercase mt-0.5 ${theme.iconText}`}>🎡 PARQUE GHIBLI</span>}
                        {(day.id === 'd4') && <span className={`text-[9px] font-black opacity-60 uppercase mt-0.5 ${theme.iconText}`}>🎡 UNIVERSAL STUDIOS</span>}
                      </div>
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
                            
                            {act.link && (
                              <a 
                                href={act.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`inline-flex items-center gap-1 mt-3 ml-2 text-[10px] font-black ${theme.iconText} ${theme.iconBg} px-4 py-2 rounded-xl shadow-sm hover:opacity-80 transition-all`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {act.linkLabel}
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

        {/* PESTAÑA MAPA */}
        {activeTab === 'mapa' && (
          <div className="space-y-4 animate-in fade-in duration-300 flex flex-col h-[70vh] min-h-[500px] justify-start">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {itinerary.filter(day => !day.id.includes('v') && day.id !== 'd15').map((day) => {
                const theme = themeStyles[day.theme];
                return (
                  <button 
                    key={day.id} 
                    onClick={() => setSelectedMapDay(day.id)}
                    className={`flex-shrink-0 px-5 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-tight transition-all active:scale-95 ${selectedMapDay === day.id ? 'bg-slate-900 text-white shadow-md' : `${theme.iconBg} ${theme.iconText} hover:opacity-80`}`}
                  >
                    📍 {day.date}
                  </button>
                )
              })}
            </div>
            
            <div className="flex-1 rounded-[32px] overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative">
              <iframe 
                title="Mapa de Rutas Diarias"
                src={`https://maps.google.com/maps?${itinerary.find(d => d.id === selectedMapDay)?.routeQuery}&output=embed`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                scrolling="no"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="bg-white p-4 rounded-[20px] text-center border border-slate-200 shadow-sm">
              <p className="text-[12px] text-slate-800 font-black uppercase italic mb-1">
                {itinerary.find(d => d.id === selectedMapDay)?.mainActivity}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                Desliza los botones arriba para cambiar de día
              </p>
            </div>
          </div>
        )}

        {/* PESTAÑA CHECK */}
        {activeTab === 'reservas' && (
          <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            {[
              { cat: 'hospedaje', label: 'Hospedajes', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { cat: 'transporte', label: 'Vuelos y Transportes', icon: Train, color: 'text-rose-600', bg: 'bg-rose-50' },
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
      
      <style dangerouslySetContent={{__html: `.touch-pan-y { touch-action: pan-y pinch-zoom; }`}} />
    </div>
  );
}
