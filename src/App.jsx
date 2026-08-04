import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Users, Map as MapIcon, Image as ImageIcon, CheckCircle, AlertTriangle, 
  Shield, MapPin, X, Navigation, UserPlus, Phone, Heart, Search, ShieldAlert, 
  CheckCircle2, AlertOctagon, HelpCircle, Eye, Compass, Layers, Edit3, Trash2, 
  Camera, Lock, LogIn, LogOut, Check, AlertCircle, Mail, AtSign, Globe, RefreshCw
} from 'lucide-react';

const PRESET_LA_GUAIRA_SECTORS = [
  { id: 'catia_la_mar', name: 'Cuadrícula A1 - Catia La Mar', swLat: 10.575, swLng: -67.050, neLat: 10.610, neLng: -67.000 },
  { id: 'maiquetia', name: 'Cuadrícula A2 - Maiquetía', swLat: 10.585, swLng: -67.000, neLat: 10.615, neLng: -66.950 },
  { id: 'la_guaira_puerto', name: 'Cuadrícula B1 - La Guaira Centro / Puerto', swLat: 10.590, swLng: -66.950, neLat: 10.620, neLng: -66.910 },
  { id: 'macuto', name: 'Cuadrícula B2 - Macuto', swLat: 10.595, swLng: -66.910, neLat: 10.625, neLng: -66.860 },
  { id: 'caraballeda', name: 'Cuadrícula C1 - Caraballeda', swLat: 10.600, swLng: -66.860, neLat: 10.630, neLng: -66.810 },
  { id: 'naiguata', name: 'Cuadrícula C2 - Naiguatá', swLat: 10.605, swLng: -66.810, neLat: 10.635, neLng: -66.730 },
  { id: 'carayaca', name: 'Cuadrícula D1 - Carayaca', swLat: 10.520, swLng: -67.180, neLat: 10.580, neLng: -67.080 }
];

const getSectorStatusInfo = (status) => {
  switch (status) {
    case 'limpia': 
      return { bg: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', hex: '#10b981', label: 'Limpia / Libre' };
    case 'en_progreso': 
      return { bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 border-amber-300', hex: '#f59e0b', label: 'En Progreso' };
    case 'pendiente': 
      return { bg: 'bg-rose-500', badge: 'bg-rose-100 text-rose-800 border-rose-300', hex: '#ef4444', label: 'Pendiente por Revisar' };
    case 'alerta_fuga': 
      return { bg: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 border-orange-300', hex: '#f97316', label: 'Alerta - Posible Fuga' };
    case 'sin_asignar': default: 
      return { bg: 'bg-slate-300', badge: 'bg-slate-100 text-slate-700 border-slate-300', hex: '#94a3b8', label: 'Sin Asignar' };
  }
};

const getAnimalStatusBadge = (status) => {
  switch (status) {
    case 'Capturado': 
      return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
    case 'Buscando': 
      return { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Search };
    case 'Avistado': 
      return { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: Eye };
    case 'Libre en la zona': 
      return { bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: Compass };
    case 'Fallecido en la zona': 
      return { bg: 'bg-stone-200 text-stone-800 border-stone-400', icon: AlertOctagon };
    default: 
      return { bg: 'bg-gray-100 text-gray-800 border-gray-300', icon: HelpCircle };
  }
};

const INITIAL_VOLUNTEERS = [
  { id: 'vol-1', name: 'Dr. Carlos Mendoza', role: 'Veterinario Principal', phone: '+58 412-5551234', email: 'carlos.mendoza@gmail.com', photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150', social: '@drcarlosmendoza', groupId: 'grp-1', sectorId: 'macuto' },
  { id: 'vol-2', name: 'Sofía Guerrero', role: 'Rescatista de Campo', phone: '+58 412-1112233', email: 'sofia.rescatista@gmail.com', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', social: '@sofi_rescatista', groupId: 'grp-1', sectorId: 'macuto' },
  { id: 'vol-3', name: 'Elena Ramos', role: 'Coordinadora Felinos', phone: '+58 414-9988776', email: 'elena.ramos@hotmail.com', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', social: '@elenaramos_felinos', groupId: 'grp-2', sectorId: 'maiquetia' },
  { id: 'vol-4', name: 'Marcos Silva', role: 'Logística y Transporte', phone: '+58 416-3332211', email: 'marcos.silva@gmail.com', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', social: '@marcos_logistica', groupId: 'grp-3', sectorId: 'catia_la_mar' }
];

const INITIAL_GROUPS = [
  { id: 'grp-1', name: 'Equipo Canino Macuto', leader: 'Dr. Carlos Mendoza', phone: '+58 412-5551234', color: '#3b82f6' },
  { id: 'grp-2', name: 'Brigada Felina Maiquetía', leader: 'Elena Ramos', phone: '+58 414-9988776', color: '#8b5cf6' },
  { id: 'grp-3', name: 'Rescate de Emergencia Catia La Mar', leader: 'Marcos Silva', phone: '+58 416-3332211', color: '#ec4899' }
];

const INITIAL_SECTORS = PRESET_LA_GUAIRA_SECTORS.map((s, idx) => ({
  ...s,
  status: idx === 0 ? 'en_progreso' : idx === 3 ? 'limpia' : idx === 2 ? 'alerta_fuga' : 'pendiente',
  assignedGroupId: idx === 0 ? 'grp-3' : idx === 3 ? 'grp-1' : idx === 1 ? 'grp-2' : '',
  notes: idx === 2 ? 'Atención: Se reportó que un mestizo marrón cruzó desde Macuto a esta cuadrícula.' : 'Zona delimitada tras el evento sísmico.'
}));

const INITIAL_ANIMALS = [
  {
    id: 'anim-1',
    name: 'Mestizo Marrón (Manchas)',
    species: 'Perro',
    status: 'Capturado',
    sectorId: 'macuto',
    groupId: 'grp-1',
    reporterName: 'Sofía Guerrero',
    date: '2026-07-28 10:30',
    lat: 10.602,
    lng: -66.885,
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
    details: 'Mestizo de tamaño mediano, deshidratado pero fuera de peligro. En custodia del refugio temporal.'
  },
  {
    id: 'anim-2',
    name: 'Gata Calicó con collar',
    species: 'Gato',
    status: 'Buscando',
    sectorId: 'maiquetia',
    groupId: 'grp-2',
    reporterName: 'Elena Ramos',
    date: '2026-07-28 11:15',
    lat: 10.600,
    lng: -66.975,
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    details: 'Vista en ruinas cerca de la plaza. Asustada, se esconde bajo los escombros.'
  },
  {
    id: 'anim-3',
    name: 'Perro Poodle Blanco',
    species: 'Perro',
    status: 'Avistado',
    sectorId: 'la_guaira_puerto',
    groupId: 'grp-1',
    reporterName: 'Vecino del sector',
    date: '2026-07-28 12:40',
    lat: 10.605,
    lng: -66.932,
    photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
    details: 'Visto cruzando la avenida principal hacia la zona B1.'
  }
];

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('rag_isAdmin') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('mapa');

  // Persistence via LocalStorage
  const [volunteers, setVolunteers] = useState(() => {
    const saved = localStorage.getItem('rag_volunteers');
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEERS;
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('rag_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [sectors, setSectors] = useState(() => {
    const saved = localStorage.getItem('rag_sectors');
    return saved ? JSON.parse(saved) : INITIAL_SECTORS;
  });

  const [animals, setAnimals] = useState(() => {
    const saved = localStorage.getItem('rag_animals');
    return saved ? JSON.parse(saved) : INITIAL_ANIMALS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rag_volunteers', JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem('rag_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('rag_sectors', JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    localStorage.setItem('rag_animals', JSON.stringify(animals));
  }, [animals]);

  useEffect(() => {
    localStorage.setItem('rag_isAdmin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Modals & Edit States
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [editingSector, setEditingSector] = useState(null);

  const [selectedSectorForReport, setSelectedSectorForReport] = useState(null);

  // Leaflet map state
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Inject Leaflet CSS & JS dynamically with polling fallback
  useEffect(() => {
    const checkL = () => {
      if (window.L) {
        setLeafletLoaded(true);
      } else {
        setTimeout(checkL, 200);
      }
    };

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const existingCss = document.getElementById('leaflet-css');
    if (!existingCss) {
      const leafletCss = document.createElement('link');
      leafletCss.id = 'leaflet-css';
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCss);
    }

    const existingJs = document.getElementById('leaflet-js');
    if (!existingJs) {
      const leafletJs = document.createElement('script');
      leafletJs.id = 'leaflet-js';
      leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletJs.onload = () => setLeafletLoaded(true);
      document.head.appendChild(leafletJs);
    } else {
      existingJs.addEventListener('load', () => setLeafletLoaded(true));
    }

    checkL();
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || activeTab !== 'mapa') return;

    let map = null;

    const timer = setTimeout(() => {
      const container = document.getElementById('leaflet-map-canvas');
      if (!container || !window.L) return;

      // Reset leaflet internal container ID if re-mounting
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Leaflet cleanup warning:", e);
        }
        mapInstanceRef.current = null;
      }

      try {
        const L = window.L;
        map = L.map('leaflet-map-canvas', {
          center: [10.595, -66.930],
          zoom: 12,
          zoomControl: true
        });
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap | Rescate La Guaira'
        }).addTo(map);

        // Force resize calculation after DOM layout
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 200);

        // Render sectors
        sectors.forEach((sec) => {
          const info = getSectorStatusInfo(sec.status);
          const swLat = parseFloat(sec.swLat) || 10.600;
          const swLng = parseFloat(sec.swLng) || -66.900;
          const neLat = parseFloat(sec.neLat) || 10.620;
          const neLng = parseFloat(sec.neLng) || -66.850;

          const bounds = [[swLat, swLng], [neLat, neLng]];

          const rect = L.rectangle(bounds, {
            color: info.hex,
            weight: 3,
            fillColor: info.hex,
            fillOpacity: 0.25
          }).addTo(map);

          const assignedGrp = groups.find(g => g.id === sec.assignedGroupId);

          rect.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="font-size: 14px; color: #1e293b;">${sec.name}</strong><br/>
              <span style="display: inline-block; margin-top: 4px; padding: 2px 6px; border-radius: 4px; background: ${info.hex}; color: white; font-size: 11px; font-weight: bold;">
                ${info.label}
              </span>
              <p style="margin: 6px 0; font-size: 12px; color: #475569;">
                <strong>Equipo:</strong> ${assignedGrp ? assignedGrp.name : 'Sin asignar'}
              </p>
              <p style="margin: 4px 0; font-size: 11px; color: #64748b;">${sec.notes || ''}</p>
            </div>
          `);
        });

        // Render animal pins
        animals.forEach((anim) => {
          const lat = parseFloat(anim.lat) || 10.600;
          const lng = parseFloat(anim.lng) || -66.900;

          const marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: anim.status === 'Capturado' ? '#10b981' : anim.status === 'Buscando' ? '#f59e0b' : '#3b82f6',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 0.9
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: sans-serif; max-width: 200px;">
              ${anim.photoUrl ? `<img src="${anim.photoUrl}" style="width:100%; height:100px; object-fit:cover; border-radius:6px; margin-bottom:6px;" />` : ''}
              <strong style="font-size: 13px; color: #0f172a;">${anim.name} (${anim.species})</strong><br/>
              <span style="font-size: 11px; color: #0284c7; font-weight: 600;">Estatus: ${anim.status}</span>
              <p style="font-size: 11px; color: #334155; margin: 4px 0;">${anim.details}</p>
              <small style="color: #94a3b8; font-size: 10px;">Reportado por: ${anim.reporterName}</small>
            </div>
          `);
        });

        // Add GPS user location if available
        if (userLocation) {
          L.marker([userLocation.lat, userLocation.lng])
            .addTo(map)
            .bindPopup('<b>📍 Tu Ubicación Actual (GPS)</b>')
            .openPopup();
          map.setView([userLocation.lat, userLocation.lng], 14);
        }

      } catch (err) {
        console.error("Error al renderizar el mapa:", err);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, activeTab, sectors, animals, groups, userLocation]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginUsername === 'derjaguer' && loginPassword === '.2411Patty..') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginUsername('');
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  const handleResetData = () => {
    if (confirm("¿Estás seguro de reiniciar todos los datos a la configuración inicial por defecto?")) {
      localStorage.removeItem('rag_volunteers');
      localStorage.removeItem('rag_groups');
      localStorage.removeItem('rag_sectors');
      localStorage.removeItem('rag_animals');
      setVolunteers(INITIAL_VOLUNTEERS);
      setGroups(INITIAL_GROUPS);
      setSectors(INITIAL_SECTORS);
      setAnimals(INITIAL_ANIMALS);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización GPS.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        console.error("Error obteniendo GPS:", err);
        alert("No se pudo obtener la ubicación GPS.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Delete Handlers
  const handleDeleteSector = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cuadrícula?")) {
      setSectors(sectors.filter(s => s.id !== id));
    }
  };

  const handleDeleteGroup = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este grupo de trabajo?")) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const handleDeleteVolunteer = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este voluntario?")) {
      setVolunteers(volunteers.filter(v => v.id !== id));
    }
  };

  const handleDeleteAnimal = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de animal?")) {
      setAnimals(animals.filter(a => a.id !== id));
    }
  };

  const counts = {
    totalGroups: groups.length,
    totalSectors: sectors.length,
    limpias: sectors.filter(s => s.status === 'limpia').length,
    enProgreso: sectors.filter(s => s.status === 'en_progreso').length,
    pendientes: sectors.filter(s => s.status === 'pendiente').length,
    alertaFuga: sectors.filter(s => s.status === 'alerta_fuga').length,
    
    // Animales
    capturados: animals.filter(a => a.status === 'Capturado').length,
    buscando: animals.filter(a => a.status === 'Buscando' || a.status === 'Avistado').length,
    libres: animals.filter(a => a.status === 'Libre en la zona').length,
    fallecidos: animals.filter(a => a.status === 'Fallecido en la zona').length
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-800/90 border-b border-slate-700/80 sticky top-0 z-30 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-amber-500 rounded-xl shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Rescate Animal La Guaira</h1>
              <p className="text-xs text-slate-400">Coordinación en Terreno Post-Sismo</p>
            </div>
          </div>

          {/* Admin status & Actions */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={handleResetData}
                title="Restablecer datos de fábrica"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-lg text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Reiniciar Datos
              </button>
            )}

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" /> Admin Activo
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/30 border border-rose-500/50 text-rose-300 hover:bg-rose-600/50 rounded-lg text-xs font-semibold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Salir Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-all"
              >
                <LogIn className="w-4 h-4 text-amber-400" /> Acceso Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Top Summary Stats Bar */}
      <section className="bg-slate-800/50 border-b border-slate-700/60 py-2.5 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[700px] gap-2 text-xs">
          <div className="flex items-center gap-4 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 flex items-center gap-1 font-medium"><Users className="w-3.5 h-3.5 text-blue-400"/> Grupos: <strong className="text-white">{counts.totalGroups}</strong></span>
            <span className="text-slate-400 flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-purple-400"/> Cuadrículas: <strong className="text-white">{counts.totalSectors}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Limpias: <strong>{counts.limpias}</strong>
            </div>
            <div className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> En Progreso: <strong>{counts.enProgreso}</strong>
            </div>
            <div className="px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Pendientes: <strong>{counts.pendientes}</strong>
            </div>
            <div className="px-2.5 py-1 rounded bg-orange-500/15 border border-orange-500/30 text-orange-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Alerta Fuga: <strong>{counts.alertaFuga}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-emerald-400 font-medium">🐾 Capturados: <strong>{counts.capturados}</strong></span>
            <span className="text-amber-400 font-medium">🔍 Buscando: <strong>{counts.buscando}</strong></span>
            <span className="text-stone-400 font-medium">🖤 Fallecidos: <strong>{counts.fallecidos}</strong></span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="bg-slate-800 border-b border-slate-700 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'mapa', label: 'Mapa Interactivo GPS', icon: MapIcon },
            { id: 'zonas', label: 'Sectores / Cuadrículas', icon: Layers },
            { id: 'grupos', label: 'Grupos de Trabajo', icon: Users },
            { id: 'voluntarios', label: 'Directorio Voluntarios', icon: UserPlus },
            { id: 'galeria', label: 'Registro Fotográfico', icon: ImageIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'border-amber-400 text-amber-400 bg-slate-700/40' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* TAB 1: INTERACTIVE MAP */}
        {activeTab === 'mapa' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" /> Mapa del Estado La Guaira por Cuadrículas
                </h2>
                <p className="text-xs text-slate-400">
                  Visualiza las cuadrículas delimitadas y las ubicaciones GPS reportadas.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Localizando GPS...' : '📍 Mi Ubicación GPS'}
                </button>

                <button
                  onClick={() => {
                    setEditingAnimal(null);
                    setSelectedSectorForReport(sectors[0] || null);
                    setShowReportModal(true);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" /> + Reportar Animal
                </button>
              </div>
            </div>

            {/* Leaflet Canvas Container */}
            <div className="bg-slate-800 rounded-xl p-2 border border-slate-700 shadow-xl relative min-h-[520px]">
              {!leafletLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-800/90 rounded-lg z-20">
                  <Navigation className="w-8 h-8 animate-spin text-amber-400" />
                  <span className="text-xs">Cargando mapa interactivo GPS...</span>
                </div>
              )}
              <div id="leaflet-map-canvas" className="w-full h-[520px] min-h-[520px] rounded-lg z-0 relative block bg-slate-900"></div>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 backdrop-blur-md p-3 rounded-lg text-xs space-y-1.5 z-10 shadow-lg">
                <p className="font-bold text-slate-300 text-[11px] border-b border-slate-800 pb-1 mb-1">Leyenda de Zonas</p>
                <div className="flex items-center gap-2 text-slate-300"><span className="w-3 h-3 rounded bg-emerald-500"></span> Verde: Zona Limpia</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="w-3 h-3 rounded bg-amber-500"></span> Amarillo: En Progreso</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="w-3 h-3 rounded bg-rose-500"></span> Rojo: Pendiente</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="w-3 h-3 rounded bg-orange-500"></span> Naranja: Alerta / Fuga</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECTORS & GRIDS MANAGEMENT */}
        {activeTab === 'zonas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" /> Estado de las Cuadrículas
                </h2>
                <p className="text-xs text-slate-400">
                  Gestión y control de sectores asignados en La Guaira.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingSector(null);
                    setShowSectorModal(true);
                  }}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" /> Crear Nueva Cuadrícula
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectors.map((sec) => {
                const info = getSectorStatusInfo(sec.status);
                const assignedGrp = groups.find(g => g.id === sec.assignedGroupId);
                const secAnimals = animals.filter(a => a.sectorId === sec.id);

                return (
                  <div key={sec.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-md flex flex-col justify-between">
                    <div>
                      {/* Card Header Status Indicator */}
                      <div className={`p-3 ${info.bg} flex items-center justify-between text-white`}>
                        <span className="font-bold text-sm drop-shadow">{sec.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-extrabold uppercase bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                            {info.label}
                          </span>
                          {isAdmin && (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                title="Editar Sector"
                                onClick={() => {
                                  setEditingSector(sec);
                                  setShowSectorModal(true);
                                }}
                                className="p-1 bg-black/30 hover:bg-black/50 rounded text-white"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Eliminar Sector"
                                onClick={() => handleDeleteSector(sec.id)}
                                className="p-1 bg-rose-900/60 hover:bg-rose-900 rounded text-rose-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Equipo Asignado:</span>
                          <span className="font-semibold text-amber-300">{assignedGrp ? assignedGrp.name : 'Sin Asignar'}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Animales Registrados:</span>
                          <span className="font-semibold text-slate-200">{secAnimals.length} registros</span>
                        </div>

                        {sec.notes && (
                          <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                            {sec.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Update Controls */}
                    <div className="p-3 bg-slate-800/80 border-t border-slate-700/80 space-y-2">
                      <p className="text-[11px] text-slate-400 font-semibold">Actualizar Estado:</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <button
                          onClick={() => {
                            setSectors(sectors.map(s => s.id === sec.id ? { ...s, status: 'limpia' } : s));
                          }}
                          className={`p-1.5 rounded font-semibold transition-all border ${
                            sec.status === 'limpia' 
                              ? 'bg-emerald-500 text-white border-emerald-400' 
                              : 'bg-slate-700/50 text-emerald-400 border-slate-600 hover:bg-emerald-500/20'
                          }`}
                        >
                          ✓ Limpia
                        </button>

                        <button
                          onClick={() => {
                            setSectors(sectors.map(s => s.id === sec.id ? { ...s, status: 'en_progreso' } : s));
                          }}
                          className={`p-1.5 rounded font-semibold transition-all border ${
                            sec.status === 'en_progreso' 
                              ? 'bg-amber-500 text-slate-900 border-amber-400' 
                              : 'bg-slate-700/50 text-amber-400 border-slate-600 hover:bg-amber-500/20'
                          }`}
                        >
                          ⏱ En Progreso
                        </button>

                        <button
                          onClick={() => {
                            setSectors(sectors.map(s => s.id === sec.id ? { ...s, status: 'alerta_fuga' } : s));
                          }}
                          className={`p-1.5 rounded font-semibold transition-all border ${
                            sec.status === 'alerta_fuga' 
                              ? 'bg-orange-500 text-white border-orange-400' 
                              : 'bg-slate-700/50 text-orange-400 border-slate-600 hover:bg-orange-500/20'
                          }`}
                        >
                          ⚠️ Alerta Fuga
                        </button>

                        <button
                          onClick={() => {
                            setEditingAnimal(null);
                            setSelectedSectorForReport(sec);
                            setShowReportModal(true);
                          }}
                          className="p-1.5 rounded font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all border border-blue-500"
                        >
                          + Reporte
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GROUPS & TEAMS */}
        {activeTab === 'grupos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" /> Grupos de Trabajo
                </h2>
                <p className="text-xs text-slate-400">
                  Organización de brigadas y equipos de respuesta.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingGroup(null);
                    setShowGroupModal(true);
                  }}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" /> Crear Nuevo Grupo
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((grp) => {
                const groupVolunteers = volunteers.filter(v => v.groupId === grp.id);
                const assignedSectors = sectors.filter(s => s.assignedGroupId === grp.id);

                return (
                  <div key={grp.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <div>
                        <h3 className="font-bold text-white text-base">{grp.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-400"/> Líder: {grp.leader} ({grp.phone})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: grp.color }}></span>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              title="Editar Grupo"
                              onClick={() => {
                                setEditingGroup(grp);
                                setShowGroupModal(true);
                              }}
                              className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-amber-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Eliminar Grupo"
                              onClick={() => handleDeleteGroup(grp.id)}
                              className="p-1 bg-rose-900/40 hover:bg-rose-900/80 rounded text-rose-300"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-300">Zonas Asignadas ({assignedSectors.length}):</p>
                      {assignedSectors.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedSectors.map(s => (
                            <span key={s.id} className="text-[11px] bg-slate-700 text-amber-300 px-2 py-0.5 rounded border border-slate-600">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Ninguna zona asignada actualmente.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-300">Voluntarios Integrantes ({groupVolunteers.length}):</p>
                      <div className="space-y-1.5">
                        {groupVolunteers.map(v => (
                          <div key={v.id} className="text-xs bg-slate-900/60 p-2 rounded border border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {v.photoUrl ? (
                                <img src={v.photoUrl} alt={v.name} className="w-7 h-7 rounded-full object-cover border border-slate-600" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                                  {v.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <strong className="text-slate-200">{v.name}</strong>
                                <span className="text-slate-400 text-[11px] block">{v.role}</span>
                              </div>
                            </div>
                            <a href={`tel:${v.phone}`} className="text-emerald-400 hover:underline text-[11px]">
                              {v.phone}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: VOLUNTEERS DIRECTORY */}
        {activeTab === 'voluntarios' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" /> Directorio de Voluntarios
                </h2>
                <p className="text-xs text-slate-400">
                  Registro detallado de rescatistas, veterinarios y apoyo logístico.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingVolunteer(null);
                    setShowVolunteerModal(true);
                  }}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" /> Registrar Voluntario
                </button>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Voluntario</th>
                      <th className="p-3.5">Rol / Especialidad</th>
                      <th className="p-3.5">Contacto</th>
                      <th className="p-3.5">Redes Sociales</th>
                      <th className="p-3.5">Grupo Asignado</th>
                      {isAdmin && <th className="p-3.5 text-right">Acciones Admin</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {volunteers.map(vol => {
                      const grp = groups.find(g => g.id === vol.groupId);
                      return (
                        <tr key={vol.id} className="hover:bg-slate-700/30 transition-all">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                            {vol.photoUrl ? (
                              <img src={vol.photoUrl} alt={vol.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                                {vol.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span>{vol.name}</span>
                              {vol.email && <span className="block text-[10px] text-slate-400 font-normal">{vol.email}</span>}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300">{vol.role}</td>
                          <td className="p-3.5 font-mono text-emerald-400">
                            <a href={`tel:${vol.phone}`} className="hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {vol.phone}
                            </a>
                          </td>
                          <td className="p-3.5 text-slate-400">
                            {vol.social ? (
                              <span className="flex items-center gap-1 text-blue-400 font-medium">
                                <AtSign className="w-3 h-3" /> {vol.social}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">No registrada</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="bg-slate-700 text-amber-300 px-2 py-1 rounded text-[11px] font-semibold border border-slate-600">
                              {grp ? grp.name : 'Sin Grupo'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  title="Editar Voluntario"
                                  onClick={() => {
                                    setEditingVolunteer(vol);
                                    setShowVolunteerModal(true);
                                  }}
                                  className="p-1 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title="Eliminar Voluntario"
                                  onClick={() => handleDeleteVolunteer(vol.id)}
                                  className="p-1 bg-rose-900/40 hover:bg-rose-900 text-rose-300 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PHOTO GALLERY & ANIMAL LOG */}
        {activeTab === 'galeria' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" /> Registro Fotográfico
                </h2>
                <p className="text-xs text-slate-400">
                  Bitácora visual de animales avistados, buscados, rescatados o fallecidos.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAnimal(null);
                  setSelectedSectorForReport(sectors[0] || null);
                  setShowReportModal(true);
                }}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Nuevo Reporte
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animals.map((anim) => {
                const badge = getAnimalStatusBadge(anim.status);
                const BadgeIcon = badge.icon;
                const sec = sectors.find(s => s.id === anim.sectorId);

                return (
                  <div key={anim.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-md flex flex-col justify-between">
                    <div>
                      {/* Photo Header */}
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        {anim.photoUrl ? (
                          <img src={anim.photoUrl} alt={anim.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-xs">Sin foto adjunta</span>
                          </div>
                        )}

                        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 shadow-lg ${badge.bg}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {anim.status}
                        </span>

                        {isAdmin && (
                          <div className="absolute top-3 left-3 flex items-center gap-1">
                            <button
                              title="Editar Registro"
                              onClick={() => {
                                setEditingAnimal(anim);
                                setShowReportModal(true);
                              }}
                              className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-amber-300 rounded-lg backdrop-blur-sm border border-slate-700"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              title="Eliminar Registro"
                              onClick={() => handleDeleteAnimal(anim.id)}
                              className="p-1.5 bg-rose-900/80 hover:bg-rose-900 text-rose-200 rounded-lg backdrop-blur-sm border border-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-sm">{anim.name}</h3>
                          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">{anim.species}</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-700/50">
                          {anim.details}
                        </p>

                        <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                          <p><strong>Sector:</strong> {sec ? sec.name : 'Desconocido'}</p>
                          <p><strong>Reportado por:</strong> {anim.reporterName} ({anim.date})</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Status Change */}
                    <div className="p-3 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between gap-1 text-[11px]">
                      <span className="text-slate-400 font-semibold">Cambiar:</span>
                      {['Capturado', 'Buscando', 'Libre en la zona', 'Fallecido en la zona'].map(st => (
                        <button
                          key={st}
                          onClick={() => {
                            setAnimals(animals.map(a => a.id === anim.id ? { ...a, status: st } : a));
                          }}
                          className={`px-1.5 py-1 rounded transition-all text-[10px] font-bold ${
                            anim.status === st 
                              ? 'bg-amber-500 text-slate-900' 
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {st.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: ADMIN LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" /> Autenticación Administrador
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3 text-xs">
              {loginError && (
                <div className="p-2 bg-rose-500/20 border border-rose-500/50 rounded text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Usuario de Administrador</label>
                <input
                  required
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Escribe tu usuario"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Contraseña</label>
                <input
                  required
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Escribe tu contraseña"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded font-bold text-slate-900">
                  Ingresar como Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT / EDIT ANIMAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> {editingAnimal ? 'Editar Registro de Animal' : 'Registrar Avistamiento / Captura'}
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const animalData = {
                id: editingAnimal ? editingAnimal.id : ('anim-' + Date.now()),
                name: fd.get('name') || 'Sin Nombre',
                species: fd.get('species'),
                status: fd.get('status'),
                sectorId: fd.get('sectorId'),
                reporterName: fd.get('reporterName') || 'Voluntario',
                date: editingAnimal ? editingAnimal.date : new Date().toISOString().replace('T', ' ').substring(0, 16),
                lat: parseFloat(fd.get('lat')) || (selectedSectorForReport ? selectedSectorForReport.swLat + 0.01 : 10.600),
                lng: parseFloat(fd.get('lng')) || (selectedSectorForReport ? selectedSectorForReport.swLng + 0.01 : -66.900),
                photoUrl: fd.get('photoUrl') || '',
                details: fd.get('details') || ''
              };

              if (editingAnimal) {
                setAnimals(animals.map(a => a.id === editingAnimal.id ? animalData : a));
              } else {
                setAnimals([animalData, ...animals]);
              }
              setShowReportModal(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Identificación / Descripción breve</label>
                <input required name="name" defaultValue={editingAnimal?.name || ''} placeholder="Ej. Mestizo Marrón sin collar" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Especie</label>
                  <select name="species" defaultValue={editingAnimal?.species || 'Perro'} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Estatus Inicial</label>
                  <select name="status" defaultValue={editingAnimal?.status || 'Avistado'} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                    <option value="Avistado">Avistado</option>
                    <option value="Buscando">Buscando</option>
                    <option value="Capturado">Capturado / Rescatado</option>
                    <option value="Libre en la zona">Libre en la zona</option>
                    <option value="Fallecido en la zona">Fallecido en la zona</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Cuadrícula / Sector</label>
                <select name="sectorId" defaultValue={editingAnimal?.sectorId || selectedSectorForReport?.id || sectors[0]?.id} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">URL de Foto (Opcional)</label>
                <input name="photoUrl" defaultValue={editingAnimal?.photoUrl || ''} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Latitud GPS</label>
                  <input name="lat" step="any" defaultValue={editingAnimal?.lat || userLocation?.lat || 10.600} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Longitud GPS</label>
                  <input name="lng" step="any" defaultValue={editingAnimal?.lng || userLocation?.lng || -66.900} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nombre del Rescatista / Reportero</label>
                <input name="reporterName" defaultValue={editingAnimal?.reporterName || ''} placeholder="Tu nombre" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Detalles y Estado de Salud</label>
                <textarea name="details" rows="2" defaultValue={editingAnimal?.details || ''} placeholder="Desnutrición, deshidratado, comportamiento asustado..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded font-bold text-slate-900">
                  {editingAnimal ? 'Actualizar Registro' : 'Guardar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT VOLUNTEER */}
      {showVolunteerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" /> {editingVolunteer ? 'Editar Voluntario' : 'Registrar Nuevo Voluntario'}
              </h3>
              <button onClick={() => setShowVolunteerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const volData = {
                id: editingVolunteer ? editingVolunteer.id : ('vol-' + Date.now()),
                name: fd.get('name'),
                role: fd.get('role'),
                phone: fd.get('phone'),
                email: fd.get('email'),
                photoUrl: fd.get('photoUrl'),
                social: fd.get('social'),
                groupId: fd.get('groupId')
              };

              if (editingVolunteer) {
                setVolunteers(volunteers.map(v => v.id === editingVolunteer.id ? volData : v));
              } else {
                setVolunteers([...volunteers, volData]);
              }
              setShowVolunteerModal(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nombre Completo</label>
                <input required name="name" defaultValue={editingVolunteer?.name || ''} placeholder="Ej. Ana Lucía Pérez" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Rol / Especialidad</label>
                <input required name="role" defaultValue={editingVolunteer?.role || ''} placeholder="Ej. Veterinario, Capturista, Conductor" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Teléfono</label>
                  <input required name="phone" defaultValue={editingVolunteer?.phone || ''} placeholder="+58 412 0000000" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Correo Electrónico</label>
                  <input type="email" name="email" defaultValue={editingVolunteer?.email || ''} placeholder="ejemplo@correo.com" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">URL Foto de Perfil (Opcional)</label>
                <input name="photoUrl" defaultValue={editingVolunteer?.photoUrl || ''} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Red Social / Usuario (Instagram, X, Facebook)</label>
                <input name="social" defaultValue={editingVolunteer?.social || ''} placeholder="@usuario_rescatista" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Grupo Asignado</label>
                <select name="groupId" defaultValue={editingVolunteer?.groupId || ''} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                  <option value="">Sin Grupo Asignado</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowVolunteerModal(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded font-bold text-slate-900">
                  {editingVolunteer ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT GROUP */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" /> {editingGroup ? 'Editar Grupo de Trabajo' : 'Crear Nuevo Grupo de Trabajo'}
              </h3>
              <button onClick={() => setShowGroupModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const leaderVolId = fd.get('leaderVolId');
              const volObj = volunteers.find(v => v.id === leaderVolId);
              
              const grpData = {
                id: editingGroup ? editingGroup.id : ('grp-' + Date.now()),
                name: fd.get('name'),
                leader: volObj ? volObj.name : (fd.get('customLeader') || 'Sin Líder'),
                phone: volObj ? volObj.phone : (fd.get('customPhone') || 'Sin Teléfono'),
                color: fd.get('color') || '#3b82f6'
              };

              if (editingGroup) {
                setGroups(groups.map(g => g.id === editingGroup.id ? grpData : g));
              } else {
                setGroups([...groups, grpData]);
              }
              setShowGroupModal(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nombre del Equipo / Brigada</label>
                <input required name="name" defaultValue={editingGroup?.name || ''} placeholder="Ej. Brigada de Rescate Caraballeda" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Seleccionar Líder de los Voluntarios Registrados</label>
                <select 
                  name="leaderVolId" 
                  defaultValue={volunteers.find(v => v.name === editingGroup?.leader)?.id || ''}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="">-- Seleccionar Voluntario Existente --</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.role}) - {v.phone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">O Escribir Líder / Coordinador Manualmente</label>
                <input name="customLeader" defaultValue={editingGroup?.leader || ''} placeholder="Nombre del líder si no está en la lista" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Teléfono del Líder (Manual)</label>
                <input name="customPhone" defaultValue={editingGroup?.phone || ''} placeholder="+58 414 0000000" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Color Identificador</label>
                <input type="color" name="color" defaultValue={editingGroup?.color || '#3b82f6'} className="w-full bg-slate-900 border border-slate-700 rounded h-10 p-1 cursor-pointer" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded font-bold text-slate-900">
                  {editingGroup ? 'Guardar Cambios' : 'Crear Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT SECTOR */}
      {showSectorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" /> {editingSector ? 'Editar Cuadrícula / Sector' : 'Crear Nueva Cuadrícula'}
              </h3>
              <button onClick={() => setShowSectorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const secData = {
                id: editingSector ? editingSector.id : ('sec-' + Date.now()),
                name: fd.get('name'),
                status: editingSector ? editingSector.status : 'pendiente',
                assignedGroupId: fd.get('assignedGroupId'),
                swLat: parseFloat(fd.get('swLat')),
                swLng: parseFloat(fd.get('swLng')),
                neLat: parseFloat(fd.get('neLat')),
                neLng: parseFloat(fd.get('neLng')),
                notes: fd.get('notes')
              };

              if (editingSector) {
                setSectors(sectors.map(s => s.id === editingSector.id ? secData : s));
              } else {
                setSectors([...sectors, secData]);
              }
              setShowSectorModal(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nombre del Sector / Cuadrícula</label>
                <input required name="name" defaultValue={editingSector?.name || ''} placeholder="Ej. Cuadrícula E1 - Naiguatá Este" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Latitud Sudoeste (SW)</label>
                  <input name="swLat" step="any" defaultValue={editingSector?.swLat ?? "10.600"} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Longitud Sudoeste (SW)</label>
                  <input name="swLng" step="any" defaultValue={editingSector?.swLng ?? "-66.800"} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Latitud Noreste (NE)</label>
                  <input name="neLat" step="any" defaultValue={editingSector?.neLat ?? "10.630"} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Longitud Noreste (NE)</label>
                  <input name="neLng" step="any" defaultValue={editingSector?.neLng ?? "-66.750"} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Asignar Grupo Inicial</label>
                <select name="assignedGroupId" defaultValue={editingSector?.assignedGroupId || ''} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                  <option value="">Sin Grupo Asignado</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Instrucciones o Notas</label>
                <textarea name="notes" rows="2" defaultValue={editingSector?.notes || ''} placeholder="Puntos de referencia, escombros principales..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSectorModal(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded font-bold text-slate-900">
                  {editingSector ? 'Guardar Cambios' : 'Crear Sector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-xs text-slate-500">
        Rescate Animal La Guaira &copy; 2026. Plataforma de coordinación para rescatistas y brigadas comunitarias.
      </footer>
    </div>
  );
}
