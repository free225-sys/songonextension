import React, { useEffect, useMemo } from 'react';
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

// Light theme colors - pastel/soft tones for prestigious look
const STATUS_COLORS_LIGHT = {
  disponible: {
    fill: 'rgba(34, 139, 34, 0.25)',
    stroke: '#228b22',
    strokeHover: '#166616',
  },
  option: {
    fill: 'rgba(210, 105, 30, 0.25)',
    stroke: '#d2691e',
    strokeHover: '#a0522d',
  },
  vendu: {
    fill: 'rgba(178, 34, 34, 0.25)',
    stroke: '#b22222',
    strokeHover: '#8b0000',
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
  const colors = STATUS_COLORS_LIGHT[parcelle.statut] || STATUS_COLORS_LIGHT.disponible;
  
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
        fillOpacity: isSelected ? 0.5 : 0.35,
        color: isSelected ? colors.strokeHover : colors.stroke,
        weight: isSelected ? 3 : 2,
        opacity: 1,
      }}
      eventHandlers={{
        click: () => onClick(parcelle),
        mouseover: (e) => {
          e.target.setStyle({
            fillOpacity: 0.5,
            weight: 3,
            color: colors.strokeHover,
          });
        },
        mouseout: (e) => {
          if (!isSelected) {
            e.target.setStyle({
              fillOpacity: 0.35,
              weight: 2,
              color: colors.stroke,
            });
          }
        },
      }}
    >
      <Tooltip sticky className="leaflet-tooltip-light">
        <div className="bg-white text-gray-800 p-3 rounded-lg min-w-[220px] shadow-lg border border-gray-100">
          <div className="font-semibold text-green-700 text-base mb-1">{parcelle.nom}</div>
          <div className="text-xs text-gray-500 mb-2">{parcelle.type_projet} • {parcelle.superficie} {parcelle.unite_superficie}</div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">{formatPrice(parcelle.prix_m2)} FCFA/m²</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              parcelle.statut === 'disponible' ? 'bg-green-100 text-green-700' :
              parcelle.statut === 'option' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
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
  const filteredParcelles = useMemo(() => {
    if (filterStatus === 'all') return parcelles;
    return parcelles.filter(p => p.statut === filterStatus);
  }, [parcelles, filterStatus]);

  const center = config?.map_center || [-4.287, 5.345];
  const zoom = config?.map_zoom || 15;

  // Light/minimalist tile layer options
  const tileLayerUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  
  return (
    <div className="map-container relative rounded-2xl overflow-hidden shadow-xl border border-green-100" data-testid="masterplan-map">
      <MapContainer
        center={[center[1], center[0]]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />
        
        <TileLayer
          url={tileLayerUrl}
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
