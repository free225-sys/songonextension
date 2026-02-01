import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_COLORS = {
  disponible: {
    fill: 'rgba(34, 197, 94, 0.4)',
    stroke: '#22c55e',
  },
  option: {
    fill: 'rgba(249, 115, 22, 0.4)',
    stroke: '#f97316',
  },
  vendu: {
    fill: 'rgba(239, 68, 68, 0.4)',
    stroke: '#ef4444',
  },
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView([center[1], center[0]], zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const ParcellePolygon = ({ parcelle, onClick, isSelected }) => {
  const { t } = useLanguage();
  const colors = STATUS_COLORS[parcelle.statut] || STATUS_COLORS.disponible;
  
  // Convert [lng, lat] to [lat, lng] for Leaflet
  const positions = useMemo(() => {
    return parcelle.coordinates.map(coord => [coord[1], coord[0]]);
  }, [parcelle.coordinates]);

  const statusLabels = {
    disponible: t('status_disponible'),
    option: t('status_option'),
    vendu: t('status_vendu'),
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        fillColor: colors.fill,
        fillOpacity: isSelected ? 0.7 : 0.4,
        color: colors.stroke,
        weight: isSelected ? 3 : 2,
        opacity: 1,
      }}
      eventHandlers={{
        click: () => onClick(parcelle),
        mouseover: (e) => {
          e.target.setStyle({
            fillOpacity: 0.6,
            weight: 3,
          });
        },
        mouseout: (e) => {
          if (!isSelected) {
            e.target.setStyle({
              fillOpacity: 0.4,
              weight: 2,
            });
          }
        },
      }}
    >
      <Tooltip sticky className="leaflet-tooltip-custom">
        <div className="bg-black/95 text-white p-3 rounded-lg min-w-[200px]">
          <div className="font-semibold text-green-400 mb-1">{parcelle.nom}</div>
          <div className="text-xs text-gray-300 mb-2">{parcelle.type_projet}</div>
          <div className="flex justify-between items-center text-sm">
            <span>{formatPrice(parcelle.prix_m2)} FCFA/m²</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              parcelle.statut === 'disponible' ? 'bg-green-500/20 text-green-400' :
              parcelle.statut === 'option' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {statusLabels[parcelle.statut]}
            </span>
          </div>
        </div>
      </Tooltip>
    </Polygon>
  );
};

export const MasterplanMap = ({ 
  parcelles, 
  config, 
  onParcelleClick, 
  selectedParcelle,
  filterStatus = 'all'
}) => {
  const mapRef = useRef(null);
  
  const filteredParcelles = useMemo(() => {
    if (filterStatus === 'all') return parcelles;
    return parcelles.filter(p => p.statut === filterStatus);
  }, [parcelles, filterStatus]);

  const center = config?.map_center || [-4.287, 5.345];
  const zoom = config?.map_zoom || 15;

  return (
    <div className="map-container relative" data-testid="masterplan-map">
      <MapContainer
        ref={mapRef}
        center={[center[1], center[0]]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {filteredParcelles.map((parcelle) => (
          <ParcellePolygon
            key={parcelle.id}
            parcelle={parcelle}
            onClick={onParcelleClick}
            isSelected={selectedParcelle?.id === parcelle.id}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MasterplanMap;
