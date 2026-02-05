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

// Enhanced color palette with better contrast
const STATUS_COLORS = {
  disponible: {
    fill: 'rgba(16, 185, 129, 0.35)',
    fillHover: 'rgba(16, 185, 129, 0.55)',
    stroke: '#059669',
    strokeHover: '#047857',
    label: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
  },
  option: {
    fill: 'rgba(245, 158, 11, 0.35)',
    fillHover: 'rgba(245, 158, 11, 0.55)',
    stroke: '#d97706',
    strokeHover: '#b45309',
    label: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
  },
  vendu: {
    fill: 'rgba(244, 63, 94, 0.35)',
    fillHover: 'rgba(244, 63, 94, 0.55)',
    stroke: '#e11d48',
    strokeHover: '#be123c',
    label: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' }
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
        fillColor: isSelected ? colors.fillHover : colors.fill,
        fillOpacity: isSelected ? 0.7 : 0.5,
        color: isSelected ? colors.strokeHover : colors.stroke,
        weight: isSelected ? 4 : 2.5,
        opacity: 1,
      }}
      eventHandlers={{
        click: () => onClick(parcelle),
        mouseover: (e) => {
          e.target.setStyle({
            fillColor: colors.fillHover,
            fillOpacity: 0.65,
            weight: 3.5,
            color: colors.strokeHover,
          });
        },
        mouseout: (e) => {
          if (!isSelected) {
            e.target.setStyle({
              fillColor: colors.fill,
              fillOpacity: 0.5,
              weight: 2.5,
              color: colors.stroke,
            });
          }
        },
      }}
    >
      <Tooltip sticky className="custom-tooltip">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[240px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-playfair text-white font-semibold text-base">{parcelle.nom}</div>
                <div className="font-montserrat text-gray-300 text-xs mt-0.5">{parcelle.type_projet}</div>
              </div>
              <span className={`
                px-3 py-1.5 rounded-full text-xs font-bold font-montserrat
                ${colors.label.bg} ${colors.label.text} ${colors.label.border} border
              `}>
                {statusLabels[parcelle.statut]}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-montserrat text-gray-500 text-xs block">Superficie</span>
                <span className="font-montserrat text-gray-800 font-semibold text-sm">
                  {parcelle.superficie} {parcelle.unite_superficie}
                </span>
              </div>
              <div>
                <span className="font-montserrat text-gray-500 text-xs block">Configuration</span>
                <span className="font-montserrat text-gray-800 font-semibold text-sm">
                  {parcelle.configuration}
                </span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
            <span className="font-montserrat text-emerald-600 text-xs font-medium">
              Cliquez pour voir les détails →
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

  // Light/minimalist tile layer
  const tileLayerUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  
  return (
    <div className="map-container relative h-full w-full" data-testid="masterplan-map">
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
