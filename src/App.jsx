import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Users, Map as MapIcon, Image as ImageIcon, CheckCircle, AlertTriangle, 
  RefreshCw, Shield, MapPin, X, Navigation, UserPlus, Phone, Activity, Heart,
  Search, ShieldAlert, CheckCircle2, AlertOctagon, HelpCircle, Eye, Compass
} from 'lucide-react';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rescate-animal-guaira';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

let app, auth, db;
if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const ZONE_COLORS = {
  'Pendiente': { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500', hex: '#ef4444', badge: 'bg-red-100 text-red-800 border-red-300' }, 
  'En progreso': { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-500', hex: '#eab308', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' }, 
  'Limpia': { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-500', hex: '#22c55e', badge: 'bg-green-100 text-green-800 border-green-300' }, 
  'Alerta - Fuga': { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', hex: '#f97316', badge: 'bg-orange-100 text-orange-800 border-orange-300' },
  'Sin asignar': { bg: 'bg-gray-200', text: 'text-gray-600', border: 'border-gray-400', hex: '#9ca3af', badge: 'bg-gray-100 text-gray-700 border-gray-300' }
};

const ANIMAL_STATUSES = [
  "Avistado",
  "Buscando",
  "Capturado",
  "Libre en la zona",
  "Fallecido en la zona"
];

const PRESET_LA_GUAIRA_SECTORS = [
  { name: 'Catia La Mar - Cuadrícula A1', bounds: { swLat: 10.595, swLng: -67.045, neLat: 10.615, neLng: -67.015 }, center: [10.605, -67.030] },
  { name: 'Urb. Playa Grande - Cuadrícula A2', bounds: { swLat: 10.600, swLng: -67.015, neLat: 10.620, neLng: -66.985 }, center: [10.610, -67.000] },
  { name: 'Maiquetía Centro - Cuadrícula B1', bounds: { swLat: 10.585, swLng: -66.970, neLat: 10.605, neLng: -66.940 }, center: [10.595, -66.955] },
  { name: 'La Guaira Puerto - Cuadrícula B2', bounds: { swLat: 10.590, swLng: -66.940, neLat: 10.610, neLng: -66.910 }, center: [10.600, -66.925] },
  { name: 'Macuto Sector Este - Cuadrícula C1', bounds: { swLat: 10.600, swLng: -66.910, neLat: 10.620, neLng: -66.870 }, center: [10.610, -66.890] },
  { name: 'Caraballeda - Cuadrícula C2', bounds: { swLat: 10.605, swLng: -66.870, neLat: 10.625, neLng: -66.830 }, center: [10.615, -66.850] },
  { name: 'Naiguatá Centro - Cuadrícula D1', bounds: { swLat: 10.605, swLng: -66.760, neLat: 10.625, neLng: -66.720 }, center: [10.615, -66.740] },
  { name: 'Carayaca - Cuadrícula O1', bounds: { swLat: 10.530, swLng: -67.140, neLat: 10.560, neLng: -67.090 }, center: [10.545, -67.115] }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

function AdminPanel({ 
  isCreatingZone, 
  setIsCreatingZone, 
  selectedPreset, 
  handleSelectPreset, 
  newZoneName, 
  setNewZoneName, 
  customLat, 
  setCustomLat, 
  customLng, 
  setCustomLng, 
  newZoneDesc, 
  setNewZoneDesc, 
  saveZone 
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 border-l-4 border-blue-600">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h3 className="font-extrabold text-lg flex items-center text-blue-900 gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Panel de Control de Coordinación
          </h3>
          <p className="text-xs text-gray-500">Crea zonas geográficas y coordina cuadrículas del mapa.</p>
        </div>
        <button 
          onClick={() => setIsCreatingZone(!isCreatingZone)}
          className="px-4 py-2.5 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm text-sm"
        >
          {isCreatingZone ? <><X className="w-4 h-4"/> Cancelar</> : <><Plus className="w-4 h-4"/> Delimitar Nueva Zona / Sector</>}
        </button>
      </div>

      {isCreatingZone && (
        <form onSubmit={saveZone} className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Seleccionar Sector Predeterminado de La Guaira</label>
              <select 
                value={selectedPreset} 
                onChange={handleSelectPreset}
                className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Escoger del mapa de La Guaira --</option>
                {PRESET_LA_GUAIRA_SECTORS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Nombre Personalizado del Sector / Cuadrícula</label>
              <input 
                type="text" 
                placeholder="Ej. Sector Macuto - Zona Norte A2" 
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Coordenada Latitud Centro</label>
              <input type="number" step="any" value={customLat} onChange={(e) => setCustomLat(e.target.value)} className="w-full border p-2 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Coordenada Longitud Centro</label>
              <input type="number" step="any" value={customLng} onChange={(e) => setCustomLng(e.target.value)} className="w-full border p-2 rounded-lg text-sm" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Notas de Referencia Geográfica / Límites</label>
            <input 
              type="text" 
              placeholder="Ej. Limita con la avenida Soublette y el río Piedras" 
              value={newZoneDesc}
              onChange={(e) => setNewZoneDesc(e.target.value)}
              className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow">
            Guardar y Trazar en Mapa
          </button>
        </form>
      )}
    </div>
  );
}

function ReportModal({ selectedZone, userLocation, setShowReportForm, submitReport }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-300"/> Registrar Animal / Avistamiento
          </h2>
          <button onClick={() => setShowReportForm(false)} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs font-semibold text-blue-900 flex items-start gap-2">
            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p>Sector Asignado: <strong className="text-sm block">{selectedZone?.name || 'Sector La Guaira'}</strong></p>
              {userLocation && <p className="text-green-700 font-bold mt-1">✓ Ubicación GPS Adjuntada</p>}
            </div>
          </div>
          
          <form onSubmit={submitReport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Especie / Descripción del Animal</label>
              <input name="animalType" type="text" required className="w-full border-2 border-gray-200 rounded-lg p-2.5 focus:border-blue-500 outline-none text-sm" placeholder="Ej. Perro Mestizo Marrón, Gato Herido, etc." />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Estado del Rescate / Avistamiento</label>
              <select name="status" className="w-full border-2 border-gray-200 rounded-lg p-2.5 focus:border-blue-500 outline-none text-sm bg-white" required>
                <option value="">-- Seleccionar estado --</option>
                {ANIMAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Detalles de Salud / Comportamiento / Fuga</label>
              <textarea name="description" className="w-full border-2 border-gray-200 rounded-lg p-2.5 focus:border-blue-500 outline-none text-sm resize-none" rows="3" placeholder="Anota si el animal huyó hacia otra cuadrícula, está herido o requiere atención médica urgente..."></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">URL de Fotografía de Evidencia</label>
              <input name="imageUrl" type="url" className="w-full border-2 border-gray-200 rounded-lg p-2.5 focus:border-blue-500 outline-none text-sm" placeholder="https://ejemplo.com/foto.jpg" />
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-md">
              Guardar Reporte en Bitácora
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function VolunteerModal({ setShowVolunteerModal, addVolunteer, groups }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-800 p-4 text-white flex justify-between items-center">
          <h2 className="text-base font-black flex items-center gap-2">
            <UserPlus className="w-5 h-5"/> Registrar Nuevo Voluntario
          </h2>
          <button onClick={() => setShowVolunteerModal(false)}><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={addVolunteer} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Nombre Completo</label>
            <input name="volName" type="text" required className="w-full border p-2.5 rounded-lg text-sm" placeholder="Ej. Ana María Pérez" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Teléfono / WhatsApp</label>
            <input name="volPhone" type="text" className="w-full border p-2.5 rounded-lg text-sm" placeholder="Ej. 0414-1234567" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Rol / Especialidad</label>
            <select name="volRole" className="w-full border p-2.5 rounded-lg text-sm bg-white" required>
              <option value="Rescatista de Campo">Rescatista de Campo</option>
              <option value="Médico Veterinario">Médico Veterinario</option>
              <option value="Logística y Transporte">Logística y Transporte</option>
              <option value="Coordinación">Coordinación</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-gray-700">Asignar a Grupo</label>
            <select name="volGroup" className="w-full border p-2.5 rounded-lg text-sm bg-white">
              <option value="">-- Sin Grupo Por Ahora --</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold">
            Registrar Voluntario
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('map'); // 'map', 'zones', 'groups', 'volunteers', 'reports'
  
  // Dynamic Data States
  const [zones, setZones] = useState([]);
  const [groups, setGroups] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [reports, setReports] = useState([]);
  
  // UI & Selection States
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDesc, setNewZoneDesc] = useState('');
  const [customLat, setCustomLat] = useState('10.600');
  const [customLng, setCustomLng] = useState('-66.930');
  
  const [selectedZone, setSelectedZone] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  
  // GPS State
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Volunteer Modal State
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  // Leaflet Load State
  const [leafletReady, setLeafletReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletReady(true);
      document.body.appendChild(script);
    } else {
      setLeafletReady(true);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const zonesRef = collection(db, 'artifacts', appId, 'public', 'data', 'zones');
    const groupsRef = collection(db, 'artifacts', appId, 'public', 'data', 'groups');
    const volunteersRef = collection(db, 'artifacts', appId, 'public', 'data', 'volunteers');
    const reportsRef = collection(db, 'artifacts', appId, 'public', 'data', 'reports');

    const unsubZones = onSnapshot(zonesRef, (snapshot) => {
      const z = [];
      snapshot.forEach((doc) => z.push({ id: doc.id, ...doc.data() }));
      setZones(z);
    }, (err) => console.error(err));

    const unsubGroups = onSnapshot(groupsRef, (snapshot) => {
      const g = [];
      snapshot.forEach((doc) => g.push({ id: doc.id, ...doc.data() }));
      setGroups(g);
    }, (err) => console.error(err));

    const unsubVolunteers = onSnapshot(volunteersRef, (snapshot) => {
      const v = [];
      snapshot.forEach((doc) => v.push({ id: doc.id, ...doc.data() }));
      setVolunteers(v);
    }, (err) => console.error(err));

    const unsubReports = onSnapshot(reportsRef, (snapshot) => {
      const r = [];
      snapshot.forEach((doc) => r.push({ id: doc.id, ...doc.data() }));
      r.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setReports(r);
    }, (err) => console.error(err));

    return () => {
      unsubZones();
      unsubGroups();
      unsubVolunteers();
      unsubReports();
    };
  }, [user]);

  useEffect(() => {
    if (view !== 'map' || !leafletReady || !mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    // Reset or initialize Leaflet map if DOM container changed
    let map = mapInstanceRef.current;
    if (!map || map._container !== mapContainerRef.current) {
      if (map) {
        map.remove();
      }
      map = L.map(mapContainerRef.current).setView([10.600, -66.932], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Rescate La Guaira'
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const layersGroup = layersGroupRef.current;
    layersGroup.clearLayers();

    // Render Preset and Custom Grids
    zones.forEach(zone => {
      const colorHex = ZONE_COLORS[zone.status]?.hex || '#9ca3af';
      
      let layer = null;
      let leafletBounds = null;

      if (zone.bounds) {
        if (zone.bounds.swLat !== undefined && zone.bounds.swLng !== undefined && zone.bounds.neLat !== undefined && zone.bounds.neLng !== undefined) {
          leafletBounds = [[zone.bounds.swLat, zone.bounds.swLng], [zone.bounds.neLat, zone.bounds.neLng]];
        } else if (Array.isArray(zone.bounds) && zone.bounds.length === 4) {
          leafletBounds = [[zone.bounds[0], zone.bounds[1]], [zone.bounds[2], zone.bounds[3]]];
        } else if (Array.isArray(zone.bounds) && Array.isArray(zone.bounds[0])) {
          leafletBounds = zone.bounds;
        }
      }

      if (leafletBounds) {
        layer = L.rectangle(leafletBounds, {
          color: colorHex,
          weight: 3,
          fillColor: colorHex,
          fillOpacity: 0.35
        });
      } else if (zone.center && Array.isArray(zone.center) && zone.center.length === 2) {
        layer = L.circle(zone.center, {
          radius: 800,
          color: colorHex,
          weight: 3,
          fillColor: colorHex,
          fillOpacity: 0.35
        });
      }

      if (layer) {
        const assignedGroup = groups.find(g => g.id === zone.assignedGroup);
        const groupName = assignedGroup ? assignedGroup.name : 'Sin Asignar';
        const zoneReportsCount = reports.filter(r => r.zoneId === zone.id).length;

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px;">
            <h3 style="font-weight: bold; font-size: 16px; margin: 0 0 6px 0; color: #1e293b;">${zone.name}</h3>
            <div style="margin-bottom: 6px;">
              <span style="background: ${colorHex}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                ${zone.status}
              </span>
            </div>
            <p style="font-size: 12px; color: #475569; margin: 4px 0;"><strong>Equipo:</strong> ${groupName}</p>
            <p style="font-size: 12px; color: #475569; margin: 4px 0;"><strong>Animales Reportados:</strong> ${zoneReportsCount}</p>
            ${zone.description ? `<p style="font-size: 11px; color: #64748b; margin: 4px 0;"><em>${zone.description}</em></p>` : ''}
          </div>
        `;

        layer.bindPopup(popupContent);
        layer.on('click', () => {
          setSelectedZone(zone);
        });
        layersGroup.addLayer(layer);
      }
    });

    // Render Animal Report Markers
    reports.forEach(report => {
      if (report.lat && report.lng) {
        const animalMarker = L.marker([report.lat, report.lng], {
          title: `${report.animalType} - ${report.status}`
        });

        const reportPopup = `
          <div style="font-family: sans-serif; max-width: 200px;">
            <strong style="font-size: 14px; color: #0f172a;">${report.animalType}</strong><br/>
            <span style="font-size: 11px; color: #2563eb; font-weight: bold;">[${report.status}]</span><br/>
            <p style="font-size: 12px; margin: 4px 0;">${report.description || 'Sin notas'}</p>
            ${report.imageUrl ? `<img src="${report.imageUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-top: 4px;" />` : ''}
          </div>
        `;
        animalMarker.bindPopup(reportPopup);
        layersGroup.addLayer(animalMarker);
      }
    });

    // Render User Location GPS Marker
    if (userLocation) {
      const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 9,
        color: '#2563eb',
        fillColor: '#60a5fa',
        fillOpacity: 0.9
      }).bindPopup('<b>Tu ubicación GPS actual</b>').openPopup();
      layersGroup.addLayer(userMarker);
      map.setView([userLocation.lat, userLocation.lng], 14);
    }

  }, [view, leafletReady, zones, groups, reports, userLocation]);

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert("No se pudo obtener la ubicación GPS. Verifica los permisos.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const totalZones = zones.length;
  const pendingZones = zones.filter(z => z.status === 'Pendiente').length;
  const inProgressZones = zones.filter(z => z.status === 'En progreso').length;
  const cleanZones = zones.filter(z => z.status === 'Limpia').length;
  const alertZones = zones.filter(z => z.status === 'Alerta - Fuga').length;

  const totalCaptured = reports.filter(r => r.status === 'Capturado').length;
  const totalSearching = reports.filter(r => r.status === 'Buscando' || r.status === 'Avistado').length;
  const totalFree = reports.filter(r => r.status === 'Libre en la zona').length;

  const handleSelectPreset = (e) => {
    const presetName = e.target.value;
    setSelectedPreset(presetName);
    const preset = PRESET_LA_GUAIRA_SECTORS.find(s => s.name === presetName);
    if (preset) {
      setNewZoneName(preset.name);
      setCustomLat(preset.center[0].toString());
      setCustomLng(preset.center[1].toString());
    }
  };

  const saveZone = async (e) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const zoneId = generateId();
    const preset = PRESET_LA_GUAIRA_SECTORS.find(s => s.name === selectedPreset);

    const newZone = {
      name: newZoneName,
      description: newZoneDesc,
      status: 'Pendiente',
      assignedGroup: null,
      center: [parseFloat(customLat), parseFloat(customLng)],
      bounds: preset ? preset.bounds : null,
      createdAt: new Date().toISOString()
    };

    if (db && user) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zoneId), newZone);
    }
    
    setIsCreatingZone(false);
    setNewZoneName('');
    setNewZoneDesc('');
    setSelectedPreset('');
  };

  const updateZoneStatus = async (zoneId, newStatus) => {
    if (db && user) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zoneId), { status: newStatus });
    }
  };

  const updateZoneAssignment = async (zoneId, groupId) => {
    if (db && user) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zoneId), { assignedGroup: groupId || null });
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    const name = e.target.groupName.value;
    const leader = e.target.leaderName.value;
    if (!name) return;

    const groupId = generateId();
    const newGroup = { name, leader: leader || 'Sin Líder Asignado', createdAt: new Date().toISOString() };

    if (db && user) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', groupId), newGroup);
    }
    e.target.reset();
  };

  const addVolunteer = async (e) => {
    e.preventDefault();
    const form = e.target;
    const volId = generateId();
    const newVol = {
      name: form.volName.value,
      phone: form.volPhone.value || 'N/A',
      role: form.volRole.value,
      groupId: form.volGroup.value || null,
      createdAt: new Date().toISOString()
    };

    if (db && user) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'volunteers', volId), newVol);
    }
    setShowVolunteerModal(false);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    const form = e.target;
    const reportId = generateId();
    
    let lat = userLocation ? userLocation.lat : (selectedZone?.center ? selectedZone.center[0] : 10.600);
    let lng = userLocation ? userLocation.lng : (selectedZone?.center ? selectedZone.center[1] : -66.932);

    const newReport = {
      zoneId: selectedZone ? selectedZone.id : 'desconocida',
      zoneName: selectedZone ? selectedZone.name : 'Sector General',
      animalType: form.animalType.value,
      status: form.status.value,
      description: form.description.value,
      imageUrl: form.imageUrl.value || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
      lat: lat,
      lng: lng,
      timestamp: new Date().toISOString(),
      reporterId: user.uid
    };

    if (db && user) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reports', reportId), newReport);
    }
    
    setShowReportForm(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center p-6">
          <Activity className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-black">Conectando al Sistema Operativo</h2>
          <p className="text-slate-400 mt-2 text-sm">Cargando base de datos de rescate animal La Guaira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Header Bar */}
      <header className="bg-slate-900 text-white p-4 shadow-xl sticky top-0 z-40">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2.5 rounded-xl text-slate-900 shadow-md">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Rescate Animal <span className="text-yellow-400">La Guaira</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium">Coordinación Operativa Post-Terremoto 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={locateUser}
              disabled={isLocating}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow transition-colors"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Obteniendo GPS...' : '📍 Mi Ubicación GPS'}
            </button>

            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-200 transition-colors">
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={(e) => setIsAdmin(e.target.checked)} 
                className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-400" 
              />
              Modo Coordinador (Admin)
            </label>
          </div>
        </div>
      </header>

      {/* Top Counters Statistics Bar */}
      <section className="bg-slate-800 border-t border-slate-700 text-white py-3 px-4 shadow-inner">
        <div className="container mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipos</span>
            <span className="text-lg font-black text-blue-400">{groups.length}</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Zonas</span>
            <span className="text-lg font-black text-white">{totalZones}</span>
          </div>

          <div className="bg-red-950/40 p-2 rounded-lg border border-red-800/50">
            <span className="text-[10px] uppercase font-bold text-red-300 block">Por Revisar</span>
            <span className="text-lg font-black text-red-400">{pendingZones}</span>
          </div>

          <div className="bg-yellow-950/40 p-2 rounded-lg border border-yellow-800/50">
            <span className="text-[10px] uppercase font-bold text-yellow-300 block">En Progreso</span>
            <span className="text-lg font-black text-yellow-400">{inProgressZones}</span>
          </div>

          <div className="bg-green-950/40 p-2 rounded-lg border border-green-800/50">
            <span className="text-[10px] uppercase font-bold text-green-300 block">Zonas Limpias</span>
            <span className="text-lg font-black text-green-400">{cleanZones}</span>
          </div>

          <div className="bg-orange-950/40 p-2 rounded-lg border border-orange-800/50">
            <span className="text-[10px] uppercase font-bold text-orange-300 block">Alerta / Fuga</span>
            <span className="text-lg font-black text-orange-400">{alertZones}</span>
          </div>

          <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Capturados</span>
            <span className="text-lg font-black text-emerald-400">{totalCaptured}</span>
          </div>

          <div className="bg-purple-950/40 p-2 rounded-lg border border-purple-800/50">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Buscando/Libres</span>
            <span className="text-lg font-black text-purple-300">{totalSearching + totalFree}</span>
          </div>

        </div>
      </section>

      {/* Navigation Tab Menu */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-[72px] z-30">
        <div className="container mx-auto max-w-7xl flex overflow-x-auto">
          {[
            { id: 'map', icon: MapIcon, label: 'Mapa Interactivo' },
            { id: 'zones', icon: MapPin, label: 'Lista de Cuadrículas' },
            { id: 'groups', icon: Users, label: 'Grupos y Asignaciones' },
            { id: 'volunteers', icon: UserPlus, label: 'Voluntarios' },
            { id: 'reports', icon: ImageIcon, label: 'Bitácora y Galería' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id)} 
              className={`flex-1 min-w-[120px] py-3.5 px-3 text-center font-bold text-xs sm:text-sm border-b-4 transition-all flex flex-col sm:flex-row items-center justify-center gap-2
                ${view === tab.id ? 'border-blue-600 text-blue-700 bg-blue-50/60' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <tab.icon className={`w-4 h-4 ${view === tab.id ? 'text-blue-600' : 'text-slate-400'}`} /> 
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main View Container */}
      <main className="flex-1 container mx-auto max-w-7xl p-4 sm:p-6">
        
        {/* VIEW 1: MAP INTERACTIVE */}
        {view === 'map' && (
          <div className="space-y-4">
            
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between text-xs font-bold">
              <span className="text-slate-500 uppercase tracking-wider">Leyenda de Zonas:</span>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block"></span> Rojo: Por revisar</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-yellow-500 inline-block"></span> Amarillo: Trabajando</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-green-500 inline-block"></span> Verde: Limpia</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-orange-500 inline-block"></span> Naranja: Alerta/Fuga</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-slate-300 h-[65vh]">
              <div ref={mapContainerRef} className="w-full h-full bg-slate-200 z-10" />
            </div>

            {selectedZone && (
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-slate-900">{selectedZone.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${ZONE_COLORS[selectedZone.status]?.badge}`}>
                      {selectedZone.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{selectedZone.description || 'Sin notas de sector.'}</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setShowReportForm(true)}
                    className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4"/> Añadir Reporte Aquí
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ZONES GRID LIST */}
        {view === 'zones' && (
          <div className="space-y-6">
            {isAdmin && (
              <AdminPanel 
                isCreatingZone={isCreatingZone}
                setIsCreatingZone={setIsCreatingZone}
                selectedPreset={selectedPreset}
                handleSelectPreset={handleSelectPreset}
                newZoneName={newZoneName}
                setNewZoneName={setNewZoneName}
                customLat={customLat}
                setCustomLat={setCustomLat}
                customLng={customLng}
                setCustomLng={setCustomLng}
                newZoneDesc={newZoneDesc}
                setNewZoneDesc={setNewZoneDesc}
                saveZone={saveZone}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zones.map(zone => {
                const assignedGroup = groups.find(g => g.id === zone.assignedGroup);
                const zoneVolunteers = volunteers.filter(v => v.groupId === zone.assignedGroup);

                return (
                  <div key={zone.id} className={`border-2 rounded-2xl p-5 shadow-sm transition-all bg-white ${ZONE_COLORS[zone.status]?.border}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-lg text-slate-900">{zone.name}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${ZONE_COLORS[zone.status]?.badge}`}>
                        {zone.status}
                      </span>
                    </div>

                    {zone.description && <p className="text-xs text-slate-600 mb-4">{zone.description}</p>}

                    <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600" /> Grupo Asignado:
                        </span>
                        {isAdmin ? (
                          <select 
                            className="border rounded text-xs p-1 bg-white"
                            value={zone.assignedGroup || ''}
                            onChange={(e) => updateZoneAssignment(zone.id, e.target.value)}
                          >
                            <option value="">-- Sin Grupo --</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        ) : (
                          <span className="font-extrabold text-blue-800">{assignedGroup ? assignedGroup.name : 'Ninguno'}</span>
                        )}
                      </div>

                      {assignedGroup && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Voluntarios Activos en Zona ({zoneVolunteers.length}):</p>
                          <p className="text-slate-700 font-medium">
                            {zoneVolunteers.length > 0 ? zoneVolunteers.map(v => v.name).join(', ') : 'Sin miembros aún.'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => { setSelectedZone(zone); setShowReportForm(true); }}
                        className="bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4"/> Añadir Reporte de Animal
                      </button>

                      {isAdmin && (
                        <div className="pt-3 border-t border-slate-200 mt-2">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Cambiar Estado de Cuadrícula:</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.keys(ZONE_COLORS).filter(k => k !== 'Sin asignar').map(status => (
                              <button 
                                key={status} 
                                onClick={() => updateZoneStatus(zone.id, status)}
                                className={`text-[11px] py-1 px-2 rounded font-bold border transition-colors ${zone.status === status ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: GROUPS */}
        {view === 'groups' && (
          <div className="space-y-6">
            {isAdmin && (
              <form onSubmit={createGroup} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Nombre del Nuevo Grupo</label>
                  <input name="groupName" required type="text" placeholder="Ej. Equipo Canino Alfa" className="w-full border p-2.5 rounded-lg text-sm" />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700">Líder / Responsable</label>
                  <input name="leaderName" type="text" placeholder="Ej. Dr. Carlos Mendoza" className="w-full border p-2.5 rounded-lg text-sm" />
                </div>
                <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm">
                  Crear Grupo
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => {
                const groupVols = volunteers.filter(v => v.groupId === group.id);
                const assignedZones = zones.filter(z => z.assignedGroup === group.id);

                return (
                  <div key={group.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b pb-3">
                      <div className="bg-blue-100 p-2.5 rounded-full text-blue-600">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">{group.name}</h3>
                        <p className="text-xs text-slate-500">Líder: <strong>{group.leader}</strong></p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Cuadrículas Asignadas ({assignedZones.length}):</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedZones.length > 0 ? assignedZones.map(z => (
                          <span key={z.id} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full border">
                            {z.name}
                          </span>
                        )) : <span className="text-xs text-slate-400 italic">Sin cuadrícula actual</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Voluntarios Integrantes ({groupVols.length}):</h4>
                      <div className="space-y-1">
                        {groupVols.map(v => (
                          <div key={v.id} className="text-xs flex justify-between bg-slate-50 p-2 rounded">
                            <span className="font-bold text-slate-800">{v.name}</span>
                            <span className="text-slate-500 text-[11px]">{v.role}</span>
                          </div>
                        ))}
                        {groupVols.length === 0 && <p className="text-xs text-slate-400 italic">No hay miembros agregados.</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: VOLUNTEERS DIRECTORY */}
        {view === 'volunteers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Directorio de Voluntarios</h2>
                <p className="text-xs text-slate-500">Registro de personal en terreno y asignación de equipos.</p>
              </div>
              <button 
                onClick={() => setShowVolunteerModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4"/> Registrar Voluntario
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Rol / Especialidad</th>
                    <th className="p-3">Grupo Asignado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteers.map(vol => {
                    const group = groups.find(g => g.id === vol.groupId);
                    return (
                      <tr key={vol.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{vol.name}</td>
                        <td className="p-3 text-slate-600">{vol.phone}</td>
                        <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border">{vol.role}</span></td>
                        <td className="p-3 font-semibold text-slate-700">{group ? group.name : 'Sin Grupo'}</td>
                      </tr>
                    );
                  })}
                  {volunteers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-400">No se han registrado voluntarios aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 5: REPORTS LOG & GALLERY */}
        {view === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Bitácora y Galería Fotográfica</h2>
              <p className="text-xs text-slate-500">Historial completo de animales avistados, buscando, capturados o fallecidos.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {reports.map(report => (
                <div key={report.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="h-44 bg-slate-100 relative">
                    <img 
                      src={report.imageUrl} 
                      alt={report.animalType} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'; }}
                    />
                    <span className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {report.status}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-sm text-slate-900">{report.animalType}</h3>
                    <p className="text-[11px] font-bold text-blue-600 mt-1 mb-2">📍 {report.zoneName}</p>
                    <p className="text-xs text-slate-600 flex-1">{report.description || 'Sin notas adicionados.'}</p>
                    <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="col-span-full bg-white p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center text-slate-400 font-medium">
                  No hay reportes registrados aún en la bitácora.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Render Modals when active */}
      {showReportForm && (
        <ReportModal 
          selectedZone={selectedZone}
          userLocation={userLocation}
          setShowReportForm={setShowReportForm}
          submitReport={submitReport}
        />
      )}
      
      {showVolunteerModal && (
        <VolunteerModal 
          setShowVolunteerModal={setShowVolunteerModal}
          addVolunteer={addVolunteer}
          groups={groups}
        />
      )}

    </div>
  );
}
