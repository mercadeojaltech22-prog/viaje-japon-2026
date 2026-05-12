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
    id: 'd_v1', date: '13-may', region: 'Vuelo Ida', theme: 'blue', mainActivity: 'Salida MDE → MEX', 
    routeQuery: 'saddr=Jose+Maria+Cordova+International+Airport&daddr=Mexico+City+International+Airport+to:Narita+International+Airport',
    activities: [
      { id: 'a_v1', time: '01:00', name: 'Salida MDE → MEX', notes: '✈️ Llegada 04:35 AM. 🇲🇽 LOGÍSTICA: Migración obligatoria en México si se desea salir. Recomendación: Tacos en el Centro Histórico.', link: 'https://www.inm.gob.mx/spublic/portal/inmex.html', linkLabel: '📝 Pre-registro MX' },
      { id: 'a_v2', time: '22:15', name: 'MEX → NRT', notes: '✈️ Tramo largo hacia Tokio. Estar de vuelta en el aeropuerto 3 horas antes.' }
    ] 
  },
  { 
    id: 'd1', date: '15-may', region: 'Tokio', theme: 'blue', mainActivity: 'Asakusa + Asahi Beer + Akihabara', 
    routeQuery: 'saddr=Narita+International+Airport&daddr=Senso-ji+to:Asahi+Beer+Headquarters+to:Tokyo+Skytree+to:Akihabara+Station',
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje Narita (NRT)', notes: 'Pasar migración. Recoger Suica/Pasmo. 🚆 TRASLADO: Tren Keisei Skyliner hasta Ueno.' },
      { id: 'a3', time: '13:00', name: 'Senso-ji & Asahi HQ', notes: '⛩️ Recorrer Nakamise. 🍺 Parada en Asahi Group Headquarters para entrar y tomarse la cerveza en el mirador.' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree', notes: '🎟️ Reserva previa. Subir para el atardecer sobre la ciudad.' },
      { id: 'a5', time: '19:30', name: 'Preview Akihabara', notes: '🕹️ Recorrido rápido de 1 hora por la zona eléctrica. Preview corto sin compras largas.' }
    ] 
  },
  { 
    id: 'd2', date: '16-may', region: 'Tokio → Osaka', theme: 'blue', mainActivity: 'Shibuya + Odaiba Gundam + Traslado', 
    routeQuery: 'saddr=Shibuya+Crossing&daddr=Shibuya+Sky+to:The+Gundam+Base+Tokyo+to:Tokyo+Station+to:Shin-Osaka+Station',
    activities: [
      { id: 'a5', time: '09:00', name: 'Shibuya Crossing', notes: 'Cruce famoso y foto con Hachiko.' },
      { id: 'a5b', time: '10:30', name: 'Shibuya Sky', notes: '🎟️ RESERVA OBLIGATORIA (4 semanas antes).' },
      { id: 'a6', time: '14:00', name: 'Odaiba Gundam Experience', notes: '🚆 Tren Yurikamome. Incluye The Gundam Base (interior) y Unicorn Gundam Statue (exterior + show).' },
      { id: 'a7', time: '18:00', name: 'Bloque Logístico Maletas', notes: '💼 6:00 – 6:45 pm: Volver al hotel, recoger maletas y salir a la estación de Tokio.' },
      { id: 'a8', time: '20:00', name: 'Shinkansen a Osaka', notes: '🚆 Salida hacia Shin-Osaka. Comprar Eki-ben para cenar en el tren.' }
    ] 
  },
  { 
    id: 'd3', date: '17-may', region: 'Nagoya / Osaka', theme: 'rose', mainActivity: 'Ghibli Park + Noche Osaka', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Ghibli+Park,+Aichi+to:Dotonbori,+Osaka',
    activities: [
      { id: 'a11', time: '10:00', name: 'Parque Ghibli (Nagoya)', hours: '10:00 - 17:00', notes: '🎟️ CONFIRMADO. 🛍️ Tienda Adventurous Spirit.', link: 'https://quickticket.moala.fun/books?id=14afc57f-d0b6-4a66-a902-7bb79d1e4e7f', linkLabel: '🎟️ Entrada QR Ghibli' },
      { id: 'a11b', time: '17:30', name: 'Retorno a Osaka', notes: '🚆 REGRESO: Tren Linimo -> Metro -> Shinkansen de Nagoya a Shin-Osaka.' },
      { id: 'a12', time: '19:30', name: 'Noche Dotonbori', notes: '🐙 Comida callejera y neones. Foto con Glico Man.' }
    ] 
  },
  { 
    id: 'd8', date: '22-may', region: 'Osaka', theme: 'emerald', mainActivity: 'Ruta de Templos + Pokémon', 
    routeQuery: 'saddr=Namba+Yasaka+Shrine&daddr=Horikoshi+Shrine+to:Isshinji+to:Shitenno-ji+to:Pokemon+Cafe+Osaka',
    activities: [
      { id: 'a22', time: '09:00', name: 'Namba Yasaka & Horikoshi', notes: '👹 Santuario cabeza de león y Horikoshi Shrine (mismo sector).' },
      { id: 'a22b', time: '11:00', name: 'Isshinji & Shitenno-ji', notes: '⛩️ Isshinji (Templo de los huesos) y Shitenno-ji (Templo más antiguo de Japón).' },
      { id: 'a23', time: '14:00', name: 'Pokémon Café & Shinsekai', notes: '🎟️ RESERVA CRÍTICA. Noche en zona retro Shinsekai.' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'Tokio', theme: 'blue', mainActivity: 'Shimokitazawa + Nintendo + Despedida', 
    routeQuery: 'saddr=Shimokitazawa+Station&daddr=Nintendo+Tokyo+to:Ueno+Station',
    activities: [
      { id: 'a31', time: '10:00', name: 'Barrio Shimokitazawa', notes: '🛍️ Ropa vintage y cafés bohemios.' },
      { id: 'a31b', time: '14:00', name: 'Nintendo Tokyo (Shibuya)', notes: '🕹️ Tienda oficial en Shibuya PARCO. A 5 min de Shimokitazawa.' },
      { id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: '✈️ Salida de ellos al aeropuerto. El resto se muda al Hotel Tokio 3.' }
    ] 
  }
];

const initialChecklist = [
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (Ueno) - 15 Mayo (1 Noche, 5 Personas)', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (Namba) - 16 al 23 Mayo (7 Noches, 5 Personas)', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (Ueno) - 23 al 25 Mayo (2 Noches, 5 Personas)', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (Ueno) - 25 al 28 Mayo (3 Noches, 3 Personas)', completed: true },
  { id: 'c_t4', category: 'transporte', text: 'Tren Keisei Skyliner (Aeropuerto ↔ Tokio)', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Bus de Larga Distancia (Highway Bus): Fuji → Shinjuku', completed: false }
];

const themeStyles = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', iconBg: 'bg-rose-100', iconText: 'text-rose-600' }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerario');
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [expandedDays, setExpandedDays] = useState([]);
  const [selectedMapDay, setSelectedMapDay] = useState('d1');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let meta = document.querySelector('meta[name=\"viewport\"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
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

  const sync = async (newIt, newCk) => { await setDoc(doc(db, \"viaje\", \"datos\"), { itinerary: newIt || itinerary, checklist: newCk || checklist }); };

  const toggleCheck = async (id) => {
    const updated = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklist(updated); await sync(itinerary, updated);
  };

  const forceUpdateCloud = async () => {
    if(window.confirm(\"¿Guardar cambios logísticos de Mauricio en la nube?\")) {
      const mergedChecklist = initialChecklist.map(initItem => {
        const existingItem = checklist.find(c => c.id === initItem.id);
        return existingItem ? { ...initItem, completed: existingItem.completed } : initItem;
      });
      await setDoc(doc(db, \"viaje\", \"datos\"), { itinerary: initialItinerary, checklist: mergedChecklist });
      alert(\"¡Nube sincronizada!\");
    }
  };

  const filteredItinerary = itinerary.filter(day => 
    day.mainActivity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.activities.some(act => act.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className=\"min-h-screen touch-pan-y bg-slate-50/50 text-slate-800 font-sans pb-10\">
      <div className=\"sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm pt-safe\">
        <div className=\"max-w-md mx-auto px-4 py-4 flex items-center justify-between\">
          <h1 className=\"text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic underline decoration-amber-400\">🎌 JAPAN 2026</h1>
          <span className=\"text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full border border-green-100\">ONLINE ☁️</span>
        </div>
        <div className=\"flex px-2 pb-2 overflow-x-auto hide-scrollbar\">
          {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'mapa', icon: MapPin, label: 'Mapa' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 min-w-[75px] flex flex-col items-center justify-center gap-1 py-2.5 px-1 mx-1 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon className=\"w-5 h-5\" />
              <span className=\"text-[9px] font-black uppercase tracking-widest\">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className=\"max-w-md mx-auto p-4 mt-2\">
        {activeTab === 'resumen' && (
          <div className=\"space-y-6 animate-in fade-in\">
            <div className=\"grid grid-cols-2 gap-4\">
              <div className=\"bg-white rounded-[28px] p-5 shadow-sm border border-slate-100\">
                <Moon className=\"w-5 h-5 text-indigo-500 mb-2\" />
                <p className=\"text-[10px] text-slate-400 font-bold uppercase tracking-widest\">Noches</p>
                <p className=\"text-lg font-black text-slate-800\">13 (JP)</p>
              </div>
              <div className=\"bg-white rounded-[28px] p-5 shadow-sm border border-slate-100\">
                <Zap className=\"w-5 h-5 text-amber-500 mb-2\" />
                <p className=\"text-[10px] text-slate-400 font-bold uppercase tracking-widest\">Base</p>
                <p className=\"text-lg font-black text-slate-800\">TKY/OSK</p>
              </div>
            </div>

            <div className=\"bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 shadow-sm\">
               <h3 className=\"font-bold text-emerald-900 flex items-center gap-2 mb-3\"><ShoppingBag className=\"w-5 h-5\" /> Compras Expertas</h3>
               <ul className=\"text-xs text-emerald-800 space-y-3 font-medium\">
                 <li>• <strong>Loft:</strong> Diseño y papelería japonesa.</li>
                 <li>• <strong>Matsumoto Kiyoshi:</strong> Skincare y dulces baratos.</li>
                 <li>• <strong>Okashi No Machioka:</strong> Dulces y snacks de remate.</li>
                 <li>• <strong>Lawson Store 100:</strong> Todo a ~$2,600 COP.</li>
               </ul>
            </div>

            <div className=\"pt-4 flex justify-end\">
              <button onClick={forceUpdateCloud} className=\"p-2 text-slate-300 hover:text-slate-400 transition-colors\"><CloudCog className=\"w-5 h-5\" /></button>
            </div>
          </div>
        )}

        {activeTab === 'itinerario' && (
          <div className=\"space-y-4 pb-10\">
            <div className=\"relative flex items-center mb-6 p-1 rounded-2xl border border-slate-200 bg-white shadow-sm\">
              <Search className=\"w-4 h-4 ml-3 text-slate-400\" />
              <input type=\"text\" placeholder=\"Buscar lugar...\" className=\"w-full bg-transparent p-3 text-xs font-bold focus:outline-none\" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {filteredItinerary.map((day) => {
              const theme = themeStyles[day.theme];
              const isExpanded = expandedDays.includes(day.id) || searchTerm !== '';
              return (
                <div key={day.id} className=\"mb-3\">
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[28px] border transition-all ${isExpanded ? 'bg-white shadow-xl' : theme.bg + ' ' + theme.border}`}>
                    <div className=\"flex items-center gap-3 text-left\">
                      <div className={`px-4 py-1.5 rounded-full ${theme.iconBg} ${theme.iconText} text-[10px] font-black shadow-sm`}>{day.date}</div>
                      <div className=\"flex flex-col\">
                        <span className=\"font-black text-[11px] text-slate-800 uppercase\">{day.region}</span>
                        {(day.mainActivity.includes(\"Ghibli\") || day.mainActivity.includes(\"USJ\")) && <span className=\"text-[9px] font-black opacity-60 uppercase mt-0.5\">🎡 Parque</span>}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className=\"w-5 h-5 text-slate-400\" /> : <ChevronDown className=\"w-5 h-5 text-slate-400\" />}
                  </button>
                  {isExpanded && (
                    <div className=\"mt-3 bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm animate-in slide-in-from-top-4\">
                      <div className=\"mb-6\"><p className=\"text-sm font-black text-slate-800 italic text-left\">\"{day.mainActivity}\"</p></div>
                      <div className=\"space-y-8\">
                        {day.activities.map((act) => (
                          <div key={act.id} className=\"relative pl-8 border-l-2 border-slate-100 last:border-l-0 text-left\">
                            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full ${theme.iconBg} border-4 border-white shadow-md`} />
                            <div className=\"flex items-center gap-3 mb-2\"><span className=\"text-[10px] font-black opacity-70\">{act.time}</span><span className=\"font-black text-sm text-slate-800\">{act.name}</span></div>
                            <p className=\"text-[11px] text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-[20px] border border-slate-50\">{act.notes}</p>
                            {act.link && <a href={act.link} target=\"_blank\" rel=\"noopener noreferrer\" className={`inline-flex items-center gap-1 mt-3 text-[10px] font-black ${theme.iconText} ${theme.iconBg} px-4 py-2 rounded-xl`}>{act.linkLabel}</a>}
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

        {activeTab === 'mapa' && (
          <div className=\"space-y-4 flex flex-col h-[70vh]\">
            <div className=\"flex gap-2 overflow-x-auto hide-scrollbar pb-2\">
              {itinerary.filter(day => !day.id.includes('v')).map((day) => (
                <button key={day.id} onClick={() => setSelectedMapDay(day.id)} className={`flex-shrink-0 px-5 py-3 rounded-[20px] text-[11px] font-black uppercase transition-all ${selectedMapDay === day.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>📍 {day.date}</button>
              ))}
            </div>
            <div className=\"flex-1 rounded-[32px] overflow-hidden border border-slate-200 shadow-sm relative\">
              <iframe title=\"Mapa\" src={`https://maps.google.com/maps?${itinerary.find(d => d.id === selectedMapDay)?.routeQuery}&output=embed`} className=\"absolute inset-0 w-full h-full border-0\" allowFullScreen=\"\" loading=\"lazy\"></iframe>
            </div>
            <div className=\"bg-white p-4 rounded-[20px] text-center border border-slate-100 shadow-sm\">
              <p className=\"text-[12px] text-slate-800 font-black uppercase italic\">{itinerary.find(d => d.id === selectedMapDay)?.mainActivity}</p>
            </div>
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className=\"space-y-6 pb-24 animate-in fade-in\">
            {[ { cat: 'hospedaje', label: 'Hospedajes', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' }, { cat: 'transporte', label: 'Transportes', icon: Train, color: 'text-rose-600', bg: 'bg-rose-50' }, { cat: 'atraccion', label: 'Atracciones', icon: Ticket, color: 'text-emerald-600', bg: 'bg-emerald-50' } ].map((section) => (
              <div key={section.cat} className=\"bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm\">
                <div className=\"flex items-center gap-4 mb-8\"><div className={`p-4 ${section.bg} ${section.color} rounded-[20px]`}><section.icon className=\"w-6 h-6\" /></div><h3 className=\"font-black text-slate-900 text-xl uppercase\">{section.label}</h3></div>
                <div className=\"space-y-3 text-left\">
                  {checklist.filter(item => item.category === section.cat).map(item => (
                    <label key={item.id} className=\"flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[24px] cursor-pointer transition-all border border-transparent hover:border-slate-100\">
                      <input type=\"checkbox\" checked={item.completed} onChange={() => toggleCheck(item.id)} className=\"w-7 h-7 rounded-[10px] border-2 border-slate-200 text-slate-900 checked:bg-slate-900 transition-all\" />
                      <span className={`text-sm font-black ${item.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <style dangerouslySetContent={{__html: `.touch-pan-y { touch-action: pan-y pinch-zoom; }`}} />
    </div>
  );
}
