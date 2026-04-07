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

// --- ITINERARIO MAESTRO (VERSION COMPLETA 400+ LÍNEAS) ---
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
    id: 'd3', date: '17-may', region: 'NAGOYA / OSAKA (PARQUE GHIBLI)', theme: 'rose', mainActivity: 'Ghibli Park + Noche Osaka', 
    routeQuery: 'saddr=Shin-Osaka+Station&daddr=Ghibli+Park,+Aichi+to:Namba+Yasaka+Shrine+to:Dotonbori,+Osaka',
    activities: [
      { id: 'a11', time: '10:00', name: 'Ghibli Park (Nagoya)', hours: '10:00 - 17:00', notes: '🎟️ CONFIRMADO. 🛍️ La tienda "Adventurous Spirit" tiene mercancía exclusiva.', link: 'https://quickticket.moala.fun/books?id=14afc57f-d0b6-4a66-a902-7bb79d1e4e7f', linkLabel: '🎟️ Entrada QR Ghibli' },
      { id: 'a11b', time: '17:30', name: 'Retorno a Osaka', notes: '🚆 REGRESO: Tren Linimo -> Metro Higashiyama -> Shinkansen desde Nagoya a Shin-Osaka (aprox 1h).' },
      { id: 'a11c', time: '18:30', name: 'Namba Yasaka Shrine', hours: 'Cierra 17:00 (Ver de afuera)', notes: '👹 El increíble santuario con forma de cabeza de león gigante.' },
      { id: 'a12', time: '19:00', name: 'Dotonbori', notes: '🐙 Noche fuerte en Osaka. Comer Takoyaki, Okonomiyaki y tomar fotos con el cartel de Glico Man bajo los neones.' }
    ] 
  },
  { 
    id: 'd4', date: '18-may', region: 'OSAKA (UNIVERSAL STUDIOS)', theme: 'emerald', mainActivity: 'Universal Studios Japan (USJ)', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Universal+Studios+Japan',
    activities: [
      { id: 'a13', time: '08:00', name: 'Día en USJ', hours: 'Varia (~8:00 - 21:00)', notes: '🚆 TRASLADO IDA: JR Yumesaki Line desde Nishikujo. 🎟️ CONFIRMADO. 🚆 REGRESO: Misma ruta inversa hacia Namba/Osaka.' }
    ] 
  },
  { 
    id: 'd5', date: '19-may', region: 'NARA', theme: 'emerald', mainActivity: 'Templos y Tradición', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Todai-ji,+Nara+to:Kasuga+Taisha+to:Naramachi',
    activities: [
      { id: 'a14', time: '09:30', name: 'Templo Todai-ji', hours: '7:30 - 17:30', notes: '🦌 Comprar galletas oficiales para ciervos. Ver el Buda de bronce gigante. 🚆 TRASLADO: Línea Kintetsu desde Namba.' },
      { id: 'a14b', time: '12:30', name: 'Kasuga Taisha', hours: '6:30 - 17:00', notes: '⛩️ Famoso santuario sintoísta rodeado de miles de linternas de piedra y bronce en el bosque.' },
      { id: 'a14c', time: '15:00', name: 'Naramachi', notes: '🚶 El antiguo distrito comercial de Nara. Calles tradicionales. 🚆 REGRESO: Tren Kintetsu de vuelta a Osaka.' }
    ] 
  },
  { 
    id: 'd6', date: '20-may', region: 'KIOTO SUR', theme: 'emerald', mainActivity: 'Fushimi Inari + Uji + Gion', 
    routeQuery: 'saddr=Namba+Station,+Osaka&daddr=Fushimi+Inari+Taisha+to:Byodo-in,+Uji+to:Gion,+Kyoto',
    activities: [
      { id: 'a15', time: '07:00', name: 'Fushimi Inari', hours: 'Abierto 24h', notes: '⛩️ Subir temprano hasta el primer mirador para tomar fotos sin tanta gente.' },
      { id: 'a16', time: '11:00', name: 'Uji y Templo Byodo-in', hours: '8:30 - 17:30', notes: '🍵 Capital del Matcha. Probar helados y fideos de té verde. El templo Byodo-in es el que sale en la moneda de ¥10.' },
      { id: 'a17', time: '17:00', name: 'Barrio de Gion', notes: '🚶 Caminar por Hanamikoji al atardecer. 🚆 REGRESO: Tren desde Gion-Shijo (Línea Keihan) hacia Osaka.' }
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
      { id: 'a28', time: '16:00', name: 'Bus de Larga Distancia (Highway Bus)', notes: '🚌 Regreso directo del Fuji a Shinjuku (Tokio). 🎟️ RESERVA PREVIA OBLIGATORIA.' },
      { id: 'a28b', time: '19:30', name: 'Omoide Yokocho (Shinjuku)', hours: 'Bares cierran medianoche', notes: '🍢 El "Callejón de los recuerdos". Humo, yakitoris y cervezas. ¡Cena espectacular para los 5!' }
    ] 
  },
  { 
    id: 'd10', date: '24-may', region: 'KAMAKURA', theme: 'rose', mainActivity: 'Gran Buda + Atardecer Costero', 
    routeQuery: 'saddr=Shinjuku+Station&daddr=Kotoku-in,+Kamakura+to:Hasedera+to:Kamakurakokomae+Station+to:Enoshima+to:Shinjuku+Station',
    activities: [
      { id: 'a29', time: '09:30', name: 'Buda Gigante (Daibutsu)', hours: '8:00 - 17:30', notes: 'Templo Kotoku-in. 🚆 TRASLADO: Línea Enoden desde Kamakura.' },
      { id: 'a29b', time: '10:30', name: 'Templo Hasedera', hours: '8:00 - 17:00', notes: '🌿 Templo con jardines hermosos y un mirador con vista al océano.' },
      { id: 'a29c', time: '12:30', name: 'Cruce Kamakurakokomae', notes: '📸 PARADA FOTOGRÁFICA: El famoso cruce de tren verde frente al mar (Slam Dunk).' },
      { id: 'a30', time: '15:00', name: 'Isla de Enoshima', notes: 'Caminar cruzando el puente, subir a los santuarios y ver el atardecer. 🚆 REGRESO: Tren directo Odakyu Romancecar a Shinjuku (1h 15m).' }
    ] 
  },
  { 
    id: 'd11', date: '25-may', region: 'TOKIO (SHIMOKITAZAWA)', theme: 'blue', mainActivity: 'Barrio Vintage + Nintendo Tokyo + Despedida', 
    routeQuery: 'saddr=Nakano+Broadway&daddr=Shimokitazawa,+Tokyo+to:Shibuya+PARCO+to:Ueno+Station',
    activities: [
      { id: 'a31', time: '10:00', name: 'Barrio Shimokitazawa', notes: '🛍️ Barrio bohemio: ropa vintage, cafés y tiendas de discos. 🚆 TRASLADO: A solo 5 min de Shibuya en la línea Keio Inokashira.' },
      { id: 'a31b', time: '13:00', name: 'Nintendo Tokyo (Shibuya PARCO)', notes: '🕹️ Tienda oficial de Nintendo (Piso 6). También está el Pokémon Center y Loft en el mismo sector.' },
      { id: 'a31c', time: '16:00', name: 'Nakano Broadway', notes: '🛍️ Paraíso del anime retro y coleccionismo a precios más bajos.' },
      { id: 'a32', time: '20:00', name: 'Despedida Mauro y Julián', notes: '✈️ Salida de ellos hacia el aeropuerto. El resto del grupo (3 personas) se muda al Hotel Tokio 3 (Ueno).' }
    ] 
  },
  { 
    id: 'd12', date: '26-may', region: 'TOKIO', theme: 'blue', mainActivity: 'teamLab + Harajuku', 
    routeQuery: 'saddr=Ueno+Station&daddr=teamLab+Planets+Tokyo+to:Takeshita+Street,+Harajuku+to:Meiji+Jingu',
    activities: [
      { id: 'a33', time: '09:00', name: 'teamLab Planets', hours: '9:00 - 22:00', notes: '🎟️ Reserva previa. OJO: No confundir con teamLab Borderless. Llevar pantalón para arremangar porque se entra al agua.' },
      { id: 'a34', time: '13:00', name: 'Harajuku (Takeshita Dori)', notes: 'La calle de la moda extravagante. Comer crepes y algodón de azúcar gigante.' },
      { id: 'a34b', time: '16:00', name: 'Santuario Meiji Jingu', hours: 'Abre al amanecer - Cierra atardecer', notes: '⛩️ Santuario inmerso en un bosque gigante justo al lado de Harajuku.' }
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
      { id: 'a35b', time: '09:00', name: 'Compras última hora (Ueno)', hours: 'Abre 11:00 AM', notes: '🛍️ Aprovechar la mañana para visitar Yamashiroya (6 pisos de juguetes y kits de casas en miniatura) o la calle Ameyoko. 🚆 TRASLADO: Tren Keisei Skyliner (40 min).' },
      { id: 'a36', time: '16:00', name: 'Salida a Narita (NRT)', notes: '🚆 Keisei Skyliner. Vuelo a Seúl a las 20:55.' },
      { id: 'a37', time: '23:25', name: 'Llegada a Seúl (ICN)', notes: '🇰🇷 ⏱️ ESCALA NOCTURNA. ⚠️ CRÍTICO: Si se desea salir del aeropuerto a la ciudad, es obligatorio tramitar el permiso K-ETA. Si no, dormir en el hotel cápsula Darakhyu dentro de la terminal.', link: 'https://www.k-eta.go.kr/', linkLabel: '🇰🇷 Tramitar K-ETA' }
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
  { id: 'c_a5', category: 'atraccion', text: 'teamLab Planets (Reservar 2 meses antes)', completed: false },
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
  const [searchTerm, setSearchTerm] = useState('');

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
    if(window.confirm("¿Forzar actualización de datos maestros? (Tus check-ins se mantendrán)")) {
      const mergedChecklist = initialChecklist.map(initItem => {
        const existingItem = checklist.find(c => c.id === initItem.id);
        return existingItem ? { ...initItem, completed: existingItem.completed } : initItem;
      });
      await setDoc(doc(db, "viaje", "datos"), { itinerary: initialItinerary, checklist: mergedChecklist });
      alert("¡Nube actualizada!");
    }
  };

  const getTheme = (themeName) => {
    if (themeName === 'blue') return themeStyles.blue;
    if (themeName === 'emerald') return themeStyles.emerald;
    return themeStyles.rose;
  };

  const filteredItinerary = itinerary.filter(day => 
    day.mainActivity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.activities.some(act => act.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className="text-xl font-black tracking-tighter italic flex items-center gap-2">🎌 JAPAN 2026</h1>
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

            <div className={`rounded-[28px] p-6 border ${isDarkMode ? 'bg-emerald-900/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
               <h3 className={`font-black text-base mb-4 flex items-center gap-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-900'}`}><ShoppingBag className="w-5 h-5" /> Tiendas Expertas</h3>
               <ul className={`text-xs space-y-3 font-medium ${isDarkMode ? 'text-emerald-200/80' : 'text-emerald-800'}`}>
                 <li>• <strong>Loft:</strong> El paraíso del diseño japonés, papelería y regalos increíbles.</li>
                 <li>• <strong>Matsumoto Kiyoshi:</strong> Farmacia con el skincare más barato y cosméticos virales.</li>
                 <li>• <strong>Okashi No Machioka:</strong> El paraíso de los dulces y snacks a precios de remate.</li>
                 <li>• <strong>Lawson Store 100 / Daiso:</strong> Todo a 100 yenes (~$2,600 COP). Souvenirs perfectos.</li>
                 <li>• <strong>GU / Uniqlo:</strong> Ropa de calidad. GU es la hermana menor y económica de Uniqlo.</li>
               </ul>
            </div>

            <div className={`rounded-[28px] p-6 border ${isDarkMode ? 'bg-rose-900/20 border-rose-900/30' : 'bg-rose-50 border-rose-100'}`}>
               <h3 className={`font-black text-base mb-4 flex items-center gap-2 ${isDarkMode ? 'text-rose-300' : 'text-rose-900'}`}><Lightbulb className="w-5 h-5" /> Tips de Supervivencia</h3>
               <ul className={`text-xs space-y-3 font-medium ${isDarkMode ? 'text-rose-200/80' : 'text-rose-800'}`}>
                 <li>• <strong>Maletas (Yamato Takkyubin):</strong> Viajar ligeros en Shinkansen. Enviar maletas grandes desde el hotel de Tokio al de Osaka un día antes (aprox ¥2,500).</li>
                 <li>• <strong>Compras Tax-Free:</strong> Aplica en compras desde ¥5,000 (~$130,000 COP) sin impuestos. Llevar pasaporte físico siempre.</li>
                 <li>• <strong>Cultura de Basura:</strong> Pocos basureros públicos, llevar siempre bolsita en la mochila.</li>
               </ul>
            </div>

            <div className={`rounded-[28px] p-6 border ${isDarkMode ? 'bg-indigo-900/20 border-indigo-900/30' : 'bg-indigo-50 border-indigo-100'}`}>
               <h3 className={`font-black text-base mb-3 flex items-center gap-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}><BookOpen className="w-5 h-5" /> Goshuincho Tip</h3>
               <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-indigo-200/80' : 'text-indigo-800'}`}>Comprar el libro de sellos (Goshuincho) el primer día en Senso-ji. En cada templo, los monjes pintarán una caligrafía única por ¥300-¥500. ⛩️</p>
            </div>

            <div className="pt-8 flex justify-end">
              <button onClick={forceUpdateCloud} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-800 hover:text-slate-600' : 'text-slate-200 hover:text-slate-300'}`} title="Forzar nube"><CloudCog className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {activeTab === 'itinerario' && (
          <div className="space-y-4 pb-10">
            <div className={`relative flex items-center mb-6 p-1 rounded-2xl border ${borderCard} ${bgCard}`}>
              <Search className="w-4 h-4 ml-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar lugar (Skytree, Nintendo, USJ...)" 
                className="w-full bg-transparent p-3 text-xs font-bold focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filteredItinerary.map((day) => {
              const theme = getTheme(day.theme);
              const isExpanded = expandedDays.includes(day.id) || searchTerm !== '';
              
              return (
                <div key={day.id} className="transition-all duration-300 mb-4">
                  <button onClick={() => setExpandedDays(prev => isExpanded ? prev.filter(i => i !== day.id) : [...prev, day.id])} className={`w-full flex items-center justify-between p-4 rounded-[24px] transition-all duration-300 ${isExpanded ? `${bgCard} mb-2` : theme.bg}`}>
                    <div className="flex items-center gap-4 text-left">
                      <div className={`px-4 py-2 rounded-[16px] ${theme.pillBg} ${theme.text} text-[11px] font-black tracking-tight`}>{day.date}</div>
                      <div className="flex flex-col">
                        <span className={`font-black text-[13px] ${theme.text} uppercase tracking-tighter`}>{day.region}</span>
                        {(day.id === 'd3' || day.id === 'd4') && <span className="text-[9px] font-black opacity-60 uppercase">🎡 {day.mainActivity.includes("Ghibli") ? "Parque Ghibli" : "Universal Studios"}</span>}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className={`w-5 h-5 ${theme.text} opacity-50`} /> : <ChevronDown className={`w-5 h-5 ${theme.text} opacity-50`} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2">
                      <div className="mb-6"><p className="text-[14px] font-black italic">"{day.mainActivity}"</p></div>
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
                            {act.link && <a href={act.link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 mt-3 text-[11px] font-black ${theme.text} ${theme.pillBg} px-4 py-2 rounded-xl hover:opacity-80 transition-all shadow-sm active:scale-95`} onClick={(e) => e.stopPropagation()}>{act.linkLabel} 🔗</a>}
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

        {/* MAPA Y RESERVAS SE MANTIENEN IGUAL... */}
        {activeTab === 'mapa' && (
          <div className="space-y-4 animate-in fade-in duration-300 flex flex-col h-[70vh] min-h-[500px] justify-start">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {itinerary.filter(day => !day.id.includes('v') && day.id !== 'd15').map((day) => {
                const theme = getTheme(day.theme);
                return (
                  <button key={day.id} onClick={() => setSelectedMapDay(day.id)} className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[12px] font-black uppercase tracking-tight transition-all active:scale-95 ${selectedMapDay === day.id ? (isDarkMode ? 'bg-white text-slate-900 shadow-md' : 'bg-slate-900 text-white shadow-md') : `${theme.bg} ${theme.text} hover:opacity-80`}`}>
                    📍 {day.date}
                  </button>
                )
              })}
            </div>
            <div className={`flex-1 rounded-[32px] overflow-hidden border shadow-sm relative ${borderCard}`}>
              <iframe title="Mapa" src={`https://maps.google.com/maps?${itinerary.find(d => d.id === selectedMapDay)?.routeQuery}&output=embed`} className="absolute inset-0 w-full h-full border-0" allowFullScreen="" loading="lazy" scrolling="no" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="space-y-8 pb-24 animate-in fade-in duration-300">
             {['hospedaje', 'transporte', 'atraccion'].map(cat => (
               <div key={cat} className={`${bgCard} rounded-[32px] p-6`}>
                 <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2">
                   {cat === 'hospedaje' ? <Building className="w-5 h-5 text-indigo-500" /> : cat === 'transporte' ? <Train className="w-5 h-5 text-rose-500" /> : <Ticket className="w-5 h-5 text-emerald-500" />}
                   {cat.charAt(0).toUpperCase() + cat.slice(1)}s
                 </h3>
                 <div className="space-y-2">
                   {checklist.filter(i => i.category === cat).map(item => (
                     <label key={item.id} className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all shadow-sm ${bgApp}`}>
                       <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item.id)} className={`w-6 h-6 rounded-lg border-2 transition-all ${isDarkMode ? 'border-slate-700 text-indigo-400 checked:bg-indigo-400' : 'border-slate-300 text-indigo-600 checked:bg-indigo-600'}`} />
                       <span className={`text-[12px] font-black italic tracking-tight ${item.completed ? 'text-slate-400 line-through' : ''}`}>{item.text}</span>
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
