import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MasterplanMap } from '../components/MasterplanMap';
import { ParcelleModal } from '../components/ParcelleModal';
import { Button } from '../components/ui/button';
import { 
  Filter, MapPin, ChevronDown, Info, Layers, Sun
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import axios from 'axios';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LegendLight = ({ t }) => (
  <div className="flex flex-wrap items-center gap-4 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded legend-box-disponible" style={{ background: 'rgba(34, 139, 34, 0.25)', border: '2px solid #228b22' }} />
      <span className="text-gray-600 font-medium">{t('status_disponible')}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded" style={{ background: 'rgba(210, 105, 30, 0.25)', border: '2px solid #d2691e' }} />
      <span className="text-gray-600 font-medium">{t('status_option')}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded" style={{ background: 'rgba(178, 34, 34, 0.25)', border: '2px solid #b22222' }} />
      <span className="text-gray-600 font-medium">{t('status_vendu')}</span>
    </div>
  </div>
);

export default function MasterplanPage() {
  const { t } = useLanguage();
  const [parcelles, setParcelles] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ disponible: 0, option: 0, vendu: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parcellesRes, statsRes] = await Promise.all([
          axios.get(`${API}/parcelles`),
          axios.get(`${API}/stats`)
        ]);
        setParcelles(parcellesRes.data.parcelles || []);
        setConfig(parcellesRes.data.config || {});
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleParcelleClick = (parcelle) => {
    setSelectedParcelle(parcelle);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedParcelle(null), 300);
  };

  // Handle parcelle change for multi-parcelle owners
  const handleParcelleChange = (parcelleId) => {
    const newParcelle = parcelles.find(p => p.id === parcelleId);
    if (newParcelle) {
      setSelectedParcelle(newParcelle);
    }
  };

  const filterOptions = [
    { value: 'all', label: t('masterplan_all') },
    { value: 'disponible', label: t('status_disponible') },
    { value: 'option', label: t('status_option') },
    { value: 'vendu', label: t('status_vendu') },
  ];

  return (
    <div className="min-h-screen masterplan-light" data-testid="masterplan-page">
      {/* Light theme navbar override */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm" data-testid="navbar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <span className="font-playfair text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                  Songon
                </span>
                <span className="font-montserrat text-xs text-green-600 block -mt-1">Extension</span>
              </div>
            </a>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/" className="font-montserrat text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">
                {t('nav_home')}
              </a>
              <a href="/masterplan" className="font-montserrat text-sm font-medium text-green-700 relative py-2">
                {t('nav_masterplan')}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />
              </a>
              <a href="/contact" className="font-montserrat text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">
                {t('nav_contact')}
              </a>
            </div>

            {/* Theme indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                <Sun className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Premium View</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-20 lg:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
                  {t('masterplan_title')}
                </h1>
                <p className="text-gray-500 font-montserrat">
                  {t('masterplan_subtitle')}
                </p>
              </div>
              
              {/* Stats Mini - Light theme */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-green-700 text-sm font-semibold">{stats.disponible}</span>
                  <span className="text-green-600 text-xs hidden sm:inline">{t('status_disponible')}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-orange-700 text-sm font-semibold">{stats.option}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-red-700 text-sm font-semibold">{stats.vendu}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls Bar - Light theme */}
          <motion.div 
            className="card-light bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-green-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LegendLight t={t} />
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-white border-green-200 text-gray-700 hover:bg-green-50 hover:border-green-300 shadow-sm"
                    data-testid="filter-dropdown"
                  >
                    <Filter className="w-4 h-4 mr-2 text-green-600" />
                    {t('masterplan_filter')}
                    <ChevronDown className="w-4 h-4 ml-2 text-green-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-green-100 shadow-lg">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setFilterStatus(option.value)}
                      className={`text-gray-700 hover:bg-green-50 cursor-pointer ${
                        filterStatus === option.value ? 'bg-green-50 text-green-700 font-medium' : ''
                      }`}
                      data-testid={`filter-${option.value}`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Map Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {loading ? (
              <div className="h-[80vh] rounded-2xl flex items-center justify-center bg-white border border-green-100 shadow-lg">
                <div className="text-center">
                  <div className="w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 font-montserrat">{t('msg_loading')}</p>
                </div>
              </div>
            ) : (
              <MasterplanMap
                parcelles={parcelles}
                config={config}
                onParcelleClick={handleParcelleClick}
                selectedParcelle={selectedParcelle}
                filterStatus={filterStatus}
              />
            )}
          </motion.div>

          {/* Instructions - Light theme */}
          <motion.div 
            className="mt-6 flex items-start gap-3 text-gray-500 text-sm bg-white/80 rounded-lg p-4 border border-green-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
            <p className="font-montserrat">
              Cliquez sur une parcelle pour afficher sa fiche détaillée. Survolez pour voir le prix au m².
            </p>
          </motion.div>
        </div>
      </main>

      {/* Detail Sidebar */}
      <ParcelleDetail
        parcelle={selectedParcelle}
        onClose={handleCloseDetail}
        isOpen={isDetailOpen}
        onParcelleChange={handleParcelleChange}
      />

      {/* Backdrop */}
      {isDetailOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
          onClick={handleCloseDetail}
        />
      )}

      <Footer />
    </div>
  );
}
