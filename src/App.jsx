import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Home, CalendarDays, Map, CheckSquare, Moon, Sun, Train, Ticket, 
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
    id: 'd_v2', date: '14-may', region: 'EN TRÁNSITO', theme: 'blue', mainActivity: 'Cruce del Pacífico', 
    routeQuery: 'q=Pacific+Ocean',
    activities: [
      { id: 'a_v3', time: '12:00', name: 'Día en el aire', notes: '✈️ Cruzando la línea internacional de fecha. Tratar de ajustar el sueño al horario de Japón.' }
    ] 
  },
  { 
    id: 'd1', date: '15-may', region: 'TOKIO', theme: 'blue', mainActivity: 'Ueno + Asakusa Profundo', 
    routeQuery: 'saddr=Narita+International+Airport&daddr=Asakusa+Culture+Tourist+Information+Center+to:Kaminarimon+to:Senso-ji+to:Asakusa+Hanayashiki+to:Asahi+Beer+Hall+to:Tokyo+Skytree+to:Don+Quijote+Asakusa',
    activities: [
      { id: 'a1', time: '06:30', name: 'Aterrizaje Narita (NRT)', notes: 'Pasar migración (Mostrar QR de Visit Japan Web). Recoger Suica/Pasmo y activar eSIM. Dejar maletas en hotel Ueno.', link: 'https://www.vjw.digital.go.jp/', linkLabel: '🛂 Visit Japan Web' },
      { id: 'a2', time: '12:00', name: 'Centro Turístico Asakusa', notes: '🏢 Subir al piso 8 (gratis) para la mejor vista de la calle Nakamise y el templo.' },
      { id: 'a3', time: '13:00', name: 'Kaminarimon y Senso-ji', hours: '6:00 - 17:00', notes: '⛩️ Recorrer la calle Nakamise. 🛍️ Comprar el "Goshuincho" (Libro de sellos) por unos ¥1,500 (~$39,000 COP).' },
      { id: 'a3b', time: '15:00', name: 'Asakusa Hanayashiki', hours: '10:00 - 18:00', notes: '🎢 El parque de atracciones más antiguo de Japón. Vistas vintage increíbles.' },
      { id: 'a4', time: '17:30', name: 'Tokyo Skytree y Asahi', hours: '10:00 - 21:00', notes: '🚶 Cruzar el río Sumida viendo el edificio dorado de Asahi. 🎟️ Subir al Skytree para el atardecer (Reserva previa).' },
      { id: 'a4b', time: '19:30', name: 'Don Quijote y Hobby Off', notes: '🛍️ Donki abre 24h para comprar snacks. Hobby Off es ideal para buscar figuras de anime de segunda mano baratas.' }
    ] 
  },
  { 
    id: 'd2', date: '16-may', region: 'TOKIO → OSAKA', theme: 'blue', mainActivity: 'Shibuya + Odaiba', 
    routeQuery: 'saddr=Shibuya+Crossing&daddr=Shibuya+Sky+to:Odaiba+Gundam+Base+to:Tokyo+Station+to:Shin-Osaka+Station',
    activities: [
      { id: 'a5', time: '09:00', name: 'Shibuya y Hachiko', notes: 'Cruce peatonal más famoso del mundo y la estatua de Hachiko.' },
      { id: 'a5b', time: '10:30', name: 'Shibuya Sky', hours: '10:00 - 22:30', notes: '🎟️ RESERVA OBLIGATORIA (Hacerla 4 semanas antes). Vista panorámica increíble.' },
      { id: 'a6', time: '14:00', name: 'Odaiba (Gundam Base)', notes: '🚆 Tomar el tren Yurikamome. Ver el Gundam Unicorn gigante a escala real y el centro comercial DiverCity.' },
      { id: 'a7', time: '18:30', name: 'Shinkansen a Osaka', notes: '🚆 Tip: Comprar Eki-ben (lunch box japonesas) en la estación de Tokio para cenar adentro del tren bala.' }
    ] 
  },
  { 
    id: 'd3', date: '17-may', region: 'NAGOYA / OSAKA', theme: 'rose', mainActivity: 'Ghibli Park + Noche Osaka', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Ghibli+Park,+Aichi+to:Namba+Yasaka+Shrine+to:Dotonbori,+Osaka',
    activities: [
      { id: 'a11', time: '10:00', name: 'Ghibli Park (Nagoya)', hours: '10:00 - 17:00', notes: '🎟️ CONFIRMADO. 🛍️ La tienda "Adventurous Spirit" tiene mercancía exclusiva.' },
      { id: 'a11b', time: '17:30', name: 'Namba Yasaka Shrine', hours: 'Cierra 17:00 (Ver de afuera)', notes: '👹 Retorno a Osaka. El increíble santuario con forma de cabeza de león gigante.' },
      { id: 'a12', time: '19:00', name: 'Dotonbori', notes: '🐙 Noche fuerte en Osaka. Comer Takoyaki, Okonomiyaki y tomar fotos con el cartel de Glico Man bajo los neones.' }
    ] 
  },
  { 
    id: 'd4', date: '18-may', region: 'OSAKA', theme: 'emerald', mainActivity: 'Universal Studios Japan', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Universal+Studios+Japan',
    activities: [
      { id: 'a13', time: '08:00', name: 'USJ', hours: 'Varia (~8:00 - 21:00)', notes: '🎟️ CONFIRMADO. Apenas se pase la puerta, usar la app de USJ para sacar el "Timed Entry Ticket" de Nintendo.' }
    ] 
  },
  { 
    id: 'd5', date: '19-may', region: 'NARA', theme: 'emerald', mainActivity: 'Templos y Tradición', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Todai-ji,+Nara+to:Kasuga+Taisha+to:Naramachi',
    activities: [
      { id: 'a14', time: '09:30', name: 'Templo Todai-ji', hours: '7:30 - 17:30', notes: '🦌 Comprar galletas oficiales para ciervos. Ver el Buda de bronce gigante.' },
      { id: 'a14b', time: '12:30', name: 'Kasuga Taisha', hours: '6:30 - 17:00', notes: '⛩️ Famoso santuario sintoísta rodeado de miles de linternas de piedra y bronce en el bosque.' },
      { id: 'a14c', time: '15:00', name: 'Naramachi', notes: '🚶 El antiguo distrito comercial de Nara. Calles tradicionales, artesanías y destilerías de sake.' }
    ] 
  },
  { 
    id: 'd6', date: '20-may', region: 'KIOTO SUR', theme: 'emerald', mainActivity: 'Fushimi Inari + Uji + Gion', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Fushimi+Inari+Taisha+to:Byodo-in,+Uji+to:Gion,+Kyoto',
    activities: [
      { id: 'a15', time: '07:00', name: 'Fushimi Inari', hours: 'Abierto 24h', notes: '⛩️ Subir temprano hasta el primer mirador para tomar fotos sin tanta gente.' },
      { id: 'a16', time: '11:00', name: 'Uji y Templo Byodo-in', hours: '8:30 - 17:30', notes: '🍵 Capital del Matcha. Probar helados y fideos de té verde. El templo Byodo-in es el que sale en la moneda de ¥10.' },
      { id: 'a17', time: '17:00', name: 'Barrio de Gion', notes: '🚶 Caminar por Hanamikoji al atardecer con posibilidad de ver Geishas reales y cenar cerca del río Kamo.' }
    ] 
  },
  { 
    id: 'd7', date: '21-may', region: 'KIOTO NORTE', theme: 'emerald', mainActivity: 'Arashiyama + Kinkaku-ji', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Arashiyama+Bamboo+Forest+to:Kinkaku-ji,+Kyoto+to:Nishiki+Market+to:Ninenzaka',
    activities: [
      { id: 'a19', time: '08:00', name: 'Bosque de Bambú (Arashiyama)', hours: 'Abierto 24h', notes: '🎋 Llegar temprano para disfrutar la paz del bosque y ver el Templo Tenryu-ji.' },
      { id: 'a20', time: '11:30', name: 'Kinkaku-ji (Pabellón de Oro)', hours: '9:00 - 17:00', notes: '📸 Espectacular para fotos con el reflejo del agua.' },
      { id: 'a21', time: '14:30', name: 'Nishiki Market', hours: '10:00 - 17:00', notes: '🍢 Probar comida callejera local. (Ojo: ¡Cierra a las 5 PM!).' },
      { id: 'a21b', time: '17:00', name: 'Ninenzaka / Sannenzaka', notes: '☕ Calles de madera históricas en la colina. Aquí queda el Starbucks tradicional.' }
    ] 
  },
  { 
    id: 'd8', date: '22-may', region: 'OSAKA', theme: 'emerald', mainActivity: 'Castillo + Kuromon + Pokémon', 
    routeQuery: 'saddr=Osaka+Castle&daddr=Kuromon+Ichiba+Market+to:Pokemon+Cafe,+Osaka+to:Shinsekai,+Osaka',
    activities: [
      { id: 'a22', time: '09:00', name: 'Castillo de Osaka', hours: '9:00 - 17:00', notes: 'Recorrido por los inmensos jardines exteriores.' },
      { id: 'a22b', time: '11:00', name: 'Kuromon Ichiba Market', hours: '9:00 - 17:00', notes: '🍣 "La cocina de Osaka". Excelente para desayunar/almorzar mariscos frescos y carne Wagyu.' },
      { id: 'a23', time: '14:00', name: 'Pokémon Café', hours: '10:00 - 21:30', notes: '🎟️ RESERVA CRÍTICA. 🛍️ Venden al Pikachu Chef exclusivo. ⚠️ Enviar maletas a Tokio hoy mismo.' },
      { id: 'a24', time: '18:00', name: 'Shinsekai', notes: '🍻 Zona retro, vibras cyberpunk. Comer Kushikatsu (brochetas fritas).' }
    ] 
  },
  { 
    id: 'd9', date: '23-may', region: 'FUJI → TOKIO', theme: 'rose', mainActivity: 'Shibazakura + Omoide Yokocho', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Mishima+Station+to:Fuji+Shibazakura+Festival+to:Omoide+Yokocho,+Shinjuku',
    activities: [
      { id: 'a25', time: '06:30', name: 'Salida Osaka → Mishima', notes: '🚆 Tomar Shinkansen Kodama muy temprano para aprovechar el día.' },
      { id: 'a26', time: '09:30', name: 'Bus a Kawaguchiko', notes: '🚌 Desde Mishima Station. (Llevar efectivo para tickets locales).' },
      { id: 'a27', time: '11:00', name: 'Shibazakura Festival', hours: '8:00 - 16:00', notes: '🌸 Ver el Monte Fuji rodeado de inmensos campos de flores rosas.' },
      { id: 'a28', time: '16:00', name: 'Highway Bus a Tokio', notes: '🚌 Regreso directo a la estación de Shinjuku (🎟️ Reserva previa obligatoria).' },
      { id: 'a28b', time: '19:30', name: 'Omoide Yokocho (Shinjuku)', hours: 'Bares cierran medianoche', notes: '🍢 El "Callejón de los recuerdos". Humo, yakitoris y cervezas. ¡Cena espectacular para los 5!' }
    ] 
  },
  { 
    id: 'd10', date: '24-may', region: 'KAMAKURA', theme: 'rose', mainActivity: 'Gran Buda + Atardecer Costero', 
    routeQuery: 'saddr=Shinjuku+Station&daddr=Kotoku-in,+Kamakura+to:Hasedera+to:Kamakurakokomae+Station+to:Enoshima+to:Shinjuku+Station',
    activities: [
      { id: 'a29', time: '09:30', name: 'Buda Gigante (Daibutsu)', hours: '8:00 - 17:30', notes: 'Templo Kotoku-in.' },
      { id: 'a29b', time: '10:30', name: 'Templo Hasedera', hours: '8:00 - 17:00', notes: '🌿 Templo con jardines hermosos y un mirador con vista al océano.' },
      { id: 'a29c', time: '12:30', name: 'Cruce Kamakurakokomae', notes: '📸 PARADA FOTOGRÁFICA: El famoso cruce de tren verde frente al mar (Slam Dunk).' },
      { id: 'a30', time: '15:00', name: 'Isla de Enoshima', notes: 'Caminar cruzando el puente, subir a los santuarios y ver el atardecer.' },
      { id: 'a30b', time: '18:30', name: 'Regreso a Tokio', notes: '🚆 Tomar tren directo Odakyu Romancecar a Shinjuku (1h 15m).' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'TOKIO', theme: 'blue', mainActivity: 'DÍA LIBRE y Despedida', 
    routeQuery: 'saddr=Nakano+Broadway&daddr=Shimokitazawa,+Tokyo+to:Ueno+Station',
    activities: [
      { id: 'a31', time: '10:00', name: 'Shopping Libre', notes: '🛍️ Para perderse comprando: Nakano Broadway (Anime barato) o Shimokitazawa (Ropa vintage).' },
      { id: 'a32', time: '20:00', name: 'Despedida', notes: '✈️ Salida de parte del grupo al aeropuerto. Reubicación en el Hotel Tokio 3 (Ueno).' }
    ] 
  },
  { 
    id: 'd12', date: '26-may', region: 'TOKIO', theme: 'blue', mainActivity: 'teamLab + Harajuku', 
    routeQuery: 'saddr=Ueno+Station&daddr=teamLab+Planets+Tokyo+to:Takeshita+Street,+Harajuku+to:Meiji+Jingu',
    activities: [
      { id: 'a33', time: '09:00', name: 'teamLab Planets', hours: '9:00 - 22:00', notes: '🎟️ Reserva previa. OJO: No confundir con teamLab Borderless. Llevar pantalón que se pueda arremangar hasta la rodilla porque se entra al agua.' },
      { id: 'a34', time: '13:00', name: 'Harajuku (Takeshita Dori)', notes: 'La calle de la moda extravagante. Comer crepes y algodón de azúcar gigante.' },
      { id: 'a34b', time: '16:00', name: 'Santuario Meiji Jingu', hours: 'Abre al amanecer - Cierra atardecer', notes: '⛩️ Santuario inmerso en un bosque gigante justo al lado de la locura de Harajuku.' }
    ] 
  },
  { 
    id: 'd13', date: '27-may', region: 'TOKIO', theme: 'blue', mainActivity: 'Akihabara', 
    routeQuery: 'saddr=Ueno+Station&daddr=Akihabara+Radio+Kaikan+to:GiGO+Akihabara',
    activities: [
      { id: 'a35', time: '11:00', name: 'Akihabara Otaku', hours: 'Tiendas abren 10:00 - 11:00 AM', notes: '🕹️ Buscar el edificio "Radio Kaikan" para figuras, explorar Maid Cafes y gastar monedas en Gachapones y arcades.' }
    ] 
  },
  { 
    id: 'd14', date: '28-may', region: 'TOKIO → SEÚL', theme: 'blue', mainActivity: 'Compras Finales + Vuelo', 
    routeQuery: 'saddr=Yamashiroya,+Ueno&daddr=Narita+International+Airport+to:Incheon+International+Airport',
    activities: [
      { id: 'a35b', time: '09:00', name: 'Compras última hora (Ueno)', hours: 'Abre 11:00 AM', notes: '🛍️ Aprovechar la mañana para visitar Yamashiroya (6 pisos de juguetes y kits de casas en miniatura) o la calle Ameyoko.' },
      { id: 'a36', time: '16:00', name: 'Salida a Narita (NRT)', notes: '🚆 Tren Keisei Skyliner. Vuelo a Seúl a las 20:55.' },
      { id: 'a37', time: '23:25', name: 'Llegada a Seúl (ICN)', notes: '🇰🇷 ⏱️ ESCALA NOCTURNA. ⚠️ CRÍTICO: Si se desea salir del aeropuerto a la ciudad, es obligatorio tramitar el permiso K-ETA por internet semanas antes. Si no, dormir en el hotel cápsula Darakhyu dentro de la terminal.', link: 'https://www.k-eta.go.kr/', linkLabel: '🇰🇷 Tramitar K-ETA' }
    ] 
  },
  { 
    id: 'd15', date: '29-may', region: 'SEÚL → COL', theme: 'blue', mainActivity: 'Regreso a Casa', 
    routeQuery: 'saddr=Incheon+International+Airport&daddr=Mexico+City+International+Airport+to:Jose+Maria+Cordova+International+Airport',
    activities: [
      { id: 'a38', time: '11:40', name: 'Vuelo ICN → MEX', notes: '✈️ ⏱️ Escala en CDMX. Mejor descansar en sala VIP, no da el tiempo para salir a la ciudad.' },
      { id: 'a39', time: '22:00', name: 'Aterrizaje Medellín (MDE)', notes: '✈️ Fin de la aventura. 🎌' }
    ] 
  }
];

// --- LISTA DE CHEQUEO TOTALMENTE A PRUEBA DE BOBOS ---
const initialChecklist = [
  { id: 'c_h1', category: 'hospedaje', text: 'Hotel Tokio 1 (Ueno) - 15 Mayo (1 Noche, 5 Personas)', completed: true },
  { id: 'c_h2', category: 'hospedaje', text: 'Hotel Osaka (Namba) - 16 al 23 Mayo (7 Noches, 5 Personas)', completed: true },
  { id: 'c_h3', category: 'hospedaje', text: 'Hotel Tokio 2 (Ueno) - 23 al 25 Mayo (2 Noches, 5 Personas)', completed: true },
  { id: 'c_h4', category: 'hospedaje', text: 'Hotel Tokio 3 (Ueno) - 25 al 28 Mayo (3 Noches, 3 Personas)', completed: true },
  
  { id: 'c_v1', category: 'transporte', text: 'Vuelos Ida (MDE-MEX-NRT)', completed: true },
  { id: 'c_v2', category: 'transporte', text: 'Vuelos Regreso (NRT-ICN-MEX-MDE)', completed: true },
  { id: 'c_t1', category: 'transporte', text: 'Shinkansen: Tokio → Osaka', completed: false },
  { id: 'c_t2', category: 'transporte', text: 'Bus de Larga Distancia (Highway Bus): Kawaguchiko → Shinjuku', completed: false },
  { id: 'c_t4', category: 'transporte', text: 'Tren Keisei Skyliner (Aeropuerto Narita ↔ Tokio)', completed: false },
  { id: 'c_t3', category: 'transporte', text: 'Permiso K-ETA (Corea del Sur)', completed: false },
  
  { id: 'c_a1', category: 'atraccion', text: 'Ghibli Park - OK', completed: true },
  { id: 'c_a2', category: 'atraccion', text: 'Universal Studios - OK', completed: true },
  { id: 'c_a3', category: 'atraccion', text: 'Shibuya Sky', completed: false },
  { id: 'c_a4', category: 'atraccion', text: 'Pokémon Café Osaka', completed: false },
  { id: 'c_a5', category: 'atraccion', text: 'teamLab Planets', completed: false },
  { id: 'c_a6', category: 'atraccion', text: 'Tokyo Skytree', completed: false }
];

const themeStyles = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-900 dark:text-blue-300', pillBg: 'bg-blue-200 dark:bg-blue-800/50', dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-900 dark:text-emerald-300', pillBg: 'bg-emerald-200 dark:bg-emerald-800/50', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-900 dark:text-rose-300', pillBg: 'bg-rose-200 dark:bg-rose-800/50', dot: 'bg-rose-500' }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [expandedDays, setExpandedDays] = useState([]);
  const [selectedMapDay, setSelectedMapDay] = useState('d1');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
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
    setChecklist(updated);
    await sync(itinerary, updated);
  };

  const forceUpdateCloud = async () => {
    if(window.confirm("¿Forzar actualización de datos en la nube para ver los hospedajes con noches y personas?")) {
      const mergedChecklist = initialChecklist.map(initItem => {
        const existingItem = checklist.find(c => c.id === initItem.id);
        return existingItem ? { ...initItem, completed: existingItem.completed } : initItem;
      });
      await setDoc(doc(db, "viaje", "datos"), { itinerary: initialItinerary, checklist: mergedChecklist });
      alert("¡Nube actualizada y a prueba de bobos!");
    }
  };

  const getTheme = (themeName) => {
    if (themeName === 'blue') return { bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100', text: isDarkMode ? 'text-blue-300' : 'text-blue-900', pillBg: isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200', dot: 'bg-blue-500' };
    if (themeName === 'emerald') return { bg: isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100', text: isDarkMode ? 'text-emerald-300' : 'text-emerald-900', pillBg: isDarkMode ? 'bg-emerald-800/50' : 'bg-emerald-200', dot: 'bg-emerald-500' };
    return { bg: isDarkMode ? 'bg-rose-900/30' : 'bg-rose-100', text: isDarkMode ? 'text-rose-300' : 'text-rose-900', pillBg: isDarkMode ? 'bg-rose-800/50' : 'bg-rose-200', dot: 'bg-rose-500' };
  };

  const bgApp = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const textApp = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const bgCard = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const borderApp = isDarkMode ? 'border-slate-800' : 'border-slate-100';
  const borderCard = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`min-h-screen touch-pan-y ${bgApp} ${textApp} font-sans pb-10 transition-colors duration-300`}>
      <div className={`sticky top-0 z-20 ${bgApp} border-b ${borderApp} pt-safe`}>
        <div className="max-w-md mx-auto">
          <div className="px-5 py-4 flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tighter italic flex items-center gap-2">
              🎌 JAPAN 2026
            </h1>
            <div className="flex gap-2 items-center">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
              <span className={`text-[9px] font-bold px-3 py-1 rounded-full animate-pulse border ${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-600 border-green-100'}`}>☁️ Sincronizado</span>
            </div>
          </div>
          
          <div className="flex px-3 pb-2 justify-between">
            {[ { id: 'resumen', icon: Home, label: 'Info' }, { id: 'itinerario', icon: Map, label: 'Ruta' }, { id: 'mapa', icon: MapPin, label: 'Mapa' }, { id: 'reservas', icon: CheckSquare, label: 'Check' } ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center gap-1.5 py-3 w-20 rounded-[20px] transition-all duration-300 ${activeTab === item.id ? (isDarkMode ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-900 text-white shadow-lg') : (isDarkMode ? 'text-slate-500 hover:bg-slate-900' : 'text-slate-400 hover:bg-slate-50')}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 mt-2">
        
        {/* PESTAÑA INFO */}
        {activeTab === 'resumen' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className={`${bgCard} rounded-[28px] p-5`}>
                <Moon className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Noches</p>
                <p className="text-xl font-black">13 (JP)</p>
              </div>
              <div className={`${bgCard} rounded-[28px] p-5`}>
                <Zap className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Bases</p>
                <p className="text-xl font-black">TKY/OSK</p>
              </div>
            </div>

            <div className={`rounded-[28px] p-6 border ${isDarkMode ? 'bg-rose-900/20 border-rose-900/30' : 'bg-rose-50 border-rose-100'}`}>
               <h3 className={`font-black text-base mb-4 flex items-center gap-2 ${isDarkMode ? 'text-rose-300' : 'text-rose-900'}`}><Lightbulb className="w-5 h-5" /> Tips de Supervivencia</h3>
               <ul className={`text-xs space-y-3 font-medium ${isDarkMode ? 'text-rose-200/80' : 'text-rose-800'}`}>
                 <li>• <strong>Maletas (Yamato Takkyubin):</strong> Viajar ligeros en Shinkansen. Enviar maletas grandes desde el hotel de Tokio al de Osaka un día antes (aprox ¥2,500 / ~$65,000 COP).</li>
                 <li>• <strong>Cultura de Basura y Comida:</strong> No está prohibido comer en la calle, pero es mal visto caminar y comer a la vez; mejor hacerlo a un lado del puesto. Hay muy pocos basureros públicos, llevar bolsita en la mochila.</li>
                 <li>• <strong>Compras Tax-Free:</strong> Aplica en compras desde ¥5,000 (~$130,000 COP) sin impuestos. Llevar pasaporte físico siempre en la mochila.</li>
               </ul>
            </div>

            <div className={`rounded-[28px] p-6 border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
               <h3 className={`font-black text-base mb-4 flex items-center gap-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-900'}`}><ShoppingBag className="w-5 h-5" /> Tiendas Económicas & Skincare</h3>
               <ul className={`text-xs space-y-3 font-medium ${isDarkMode ? 'text-emerald-200/80' : 'text-emerald-800'}`}>
                 <li>• <strong>Matsumoto Kiyoshi:</strong> Farmacia gigante, ideal para skincare, cosméticos japoneses y dulces a precios insuperables.</li>
                 <li>• <strong>Las Tiendas de 100 Yenes (~$2,600 COP):</strong> <em>Daiso</em>, <em>Seria</em>, <em>Can*Do</em> y <em>Watts</em>. Excelentes para souvenirs, papelería y chucherías bellísimas.</li>
                 <li>• <strong>Lawson Store 100:</strong> Como un mini-súper, pero casi toda la comida y snacks valen 100 yenes. Salva vidas.</li>
                 <li>• <strong>GU y Uniqlo:</strong> Ropa de calidad a precios bajísimos (GU es la hermana menor y más barata de Uniqlo).</li>
                 <li>• <strong>Natural Kitchen:</strong> Cositas de hogar y cocina preciosas estilo japonés, súper económicas.</li>
               </ul>
            </div>

            <div className={`rounded-[28px] p-6 border ${isDarkMode ? 'bg-indigo-900/20 border-indigo-900/30' : 'bg-indigo-50 border-indigo-100'}`}>
               <h3 className={`font-black text-base mb-3 flex items-center gap-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}><BookOpen className="w-5 h-5" /> Goshuincho Tip</h3>
               <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-indigo-200/80' : 'text-indigo-800'}`}>Comprar el libro de sellos (Goshuincho) el primer día en Senso-ji. En cada templo, los monjes pintarán una caligrafía única por ¥300-¥500 (~$8,000 - $13,000 COP). ⛩️</p>
            </div>

            <div className="pt-8 flex justify-end">
              <button 
                onClick={forceUpdateCloud} 
                className={`p-2 transition-colors ${isDarkMode ? 'text-slate-800 hover:text-slate-600' : 'text-slate-200 hover:text-slate-300'}`}
                title="Forzar nube"
              >
                <CloudCog className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* RUTA */}
        {activeTab === 'itinerario' && (
          <div className="space-y-4 pb-10">
            {itinerary.map((day) => {
              const theme = getTheme(day.theme);
              const isExpanded = expandedDays.includes(day.id);
              
              return (
                <div key={day.id} className="transition-all duration-300">
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[24px] transition-all duration-300 ${isExpanded ? `${bgCard} mb-2` : theme.bg}`}>
                    <div className="flex items-center gap-4 text-left">
                      <div className={`px-4 py-2 rounded-[16px] ${theme.pillBg} ${theme.text} text-[11px] font-black tracking-tight`}>{day.date}</div>
                      <span className={`font-black text-[13px] ${theme.text} uppercase tracking-tighter`}>{day.region}</span>
                    </div>
                    {isExpanded ? <ChevronUp className={`w-5 h-5 ${theme.text} opacity-50`} /> : <ChevronDown className={`w-5 h-5 ${theme.text} opacity-50`} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2">
                      <div className="mb-6">
                         <p className="text-[14px] font-black italic">"{day.mainActivity}"</p>
                      </div>
                      
                      <div className="space-y-0">
                        {day.activities.map((act) => (
                          <div key={act.id} className={`relative pl-6 border-l-2 ml-2 pb-6 last:pb-0 text-left ${borderApp}`}>
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${theme.dot} border-[3px] shadow-sm ${isDarkMode ? 'border-slate-950' : 'border-white'}`} />
                            
                            <div className="mb-1">
                              <span className={`text-[11px] font-black ${theme.text} uppercase tracking-tight block mb-0.5`}>{act.time}</span>
                              <span className="font-black text-[13px] leading-tight uppercase">{act.name}</span>
                            </div>
                            
                            {act.hours && <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-tight">⏱️ {act.hours}</p>}
                            <p className={`text-[12px] font-medium leading-relaxed mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{act.notes}</p>
                            
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

        {/* MAPA INTERACTIVO */}
        {activeTab === 'mapa' && (
          <div className="space-y-4 animate-in fade-in duration-300 flex flex-col h-[70vh] min-h-[500px] justify-start">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {itinerary.filter(day => !day.id.includes('v') && day.id !== 'd15').map((day) => {
                const theme = getTheme(day.theme);
                return (
                  <button 
                    key={day.id} 
                    onClick={() => setSelectedMapDay(day.id)}
                    className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[12px] font-black uppercase tracking-tight transition-all active:scale-95 ${selectedMapDay === day.id ? (isDarkMode ? 'bg-white text-slate-900 shadow-md' : 'bg-slate-900 text-white shadow-md') : `${theme.bg} ${theme.text} hover:opacity-80`}`}
                  >
                    📍 {day.date}
                  </button>
                )
              })}
            </div>
            
            <div className={`flex-1 rounded-[32px] overflow-hidden border shadow-sm relative ${borderCard}`}>
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
            
            <div className={`${bgCard} p-4 rounded-[20px] text-center border ${borderCard}`}>
              <p className="text-[12px] font-black uppercase italic mb-1">
                {itinerary.find(d => d.id === selectedMapDay)?.mainActivity}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                Desliza los botones arriba para cambiar de día
              </p>
            </div>
          </div>
        )}

        {/* CHECK */}
        {activeTab === 'reservas' && (
          <div className="space-y-8 pb-24 animate-in fade-in duration-300">
            <div className={`${bgCard} rounded-[32px] p-6`}>
               <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-indigo-500" /> Hospedajes</h3>
               <div className="space-y-2">
                 {checklist.filter(i => i.category === 'hospedaje').map(item => (
                   <label key={item.id} className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all shadow-sm ${bgApp}`}>
                     <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className={`w-6 h-6 rounded-lg border-2 transition-all ${isDarkMode ? 'border-slate-700 text-indigo-400 checked:bg-indigo-400' : 'border-slate-300 text-indigo-600 checked:bg-indigo-600'}`} />
                     <span className={`text-[12px] font-black italic tracking-tight ${item.completed ? (isDarkMode ? 'text-slate-600 line-through' : 'text-slate-400 line-through') : ''}`}>{item.text}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div className={`${bgCard} rounded-[32px] p-6`}>
               <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2"><Train className="w-5 h-5 text-rose-500" /> Transportes y Trámites</h3>
               <div className="space-y-2">
                 {checklist.filter(i => i.category === 'transporte').map(item => (
                   <label key={item.id} className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all shadow-sm ${bgApp}`}>
                     <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className={`w-6 h-6 rounded-lg border-2 transition-all ${isDarkMode ? 'border-slate-700 text-rose-400 checked:bg-rose-400' : 'border-slate-300 text-rose-600 checked:bg-rose-600'}`} />
                     <span className={`text-[12px] font-black italic tracking-tight ${item.completed ? (isDarkMode ? 'text-slate-600 line-through' : 'text-slate-400 line-through') : ''}`}>{item.text}</span>
                   </label>
                 ))}
               </div>
               <div className={`mt-4 p-4 rounded-[20px] flex gap-3 text-left border ${isDarkMode ? 'bg-rose-900/20 border-rose-900/30' : 'bg-rose-100/50 border-rose-200'}`}>
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p className={`text-[11px] font-medium leading-relaxed ${isDarkMode ? 'text-rose-200/80' : 'text-rose-800'}`}><strong>¡Atención!</strong> Tickets de Shinkansen y buses de larga distancia (Highway Bus al Fuji) se habilitan para comprar exactamente <strong>30 días antes</strong>.</p>
               </div>
            </div>

            <div className={`${bgCard} rounded-[32px] p-6`}>
               <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2"><Ticket className="w-5 h-5 text-emerald-500" /> Atracciones</h3>
               <div className="space-y-2">
                 {checklist.filter(i => i.category === 'atraccion').map(item => (
                   <label key={item.id} className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all shadow-sm ${bgApp}`}>
                     <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className={`w-6 h-6 rounded-lg border-2 transition-all ${isDarkMode ? 'border-slate-700 text-emerald-400 checked:bg-emerald-400' : 'border-slate-300 text-emerald-600 checked:bg-emerald-600'}`} />
                     <span className={`text-[12px] font-black italic tracking-tight ${item.completed ? (isDarkMode ? 'text-slate-600 line-through' : 'text-slate-400 line-through') : ''}`}>{item.text}</span>
                   </label>
                 ))}
               </div>
               <div className={`mt-4 p-4 rounded-[20px] flex gap-3 text-left border ${isDarkMode ? 'bg-amber-900/20 border-amber-900/30' : 'bg-amber-50 border-amber-200'}`}>
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className={`text-[11px] font-medium leading-relaxed ${isDarkMode ? 'text-amber-200/80' : 'text-amber-800'}`}><strong>Advertencia Extrema:</strong> Las reservas para Shibuya Sky y Pokémon Café vuelan. Poner alarma <strong>4 semanas antes a las 6:00 PM (hora JP)</strong>.</p>
               </div>
            </div>
          </div>
        )}
      </main>
      
      <style dangerouslySetContent={{__html: `
        .touch-pan-y { touch-action: pan-y pinch-zoom; }
      `}} />
    </div>
  );
}
