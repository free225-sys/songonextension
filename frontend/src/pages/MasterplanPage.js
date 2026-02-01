import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MasterplanMap } from '../components/MasterplanMap';
import { ParcelleDetail } from '../components/ParcelleDetail';
import { Button } from '../components/ui/button';
import { 
  Filter, MapPin, ChevronDown, Info, Layers
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

const Legend = ({ t }) => (
  <div className="flex flex-wrap items-center gap-4 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-green-500/40 border-2 border-green-500" />
      <span className="text-gray-300">{t('status_disponible')}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-orange-500/40 border-2 border-orange-500" />
      <span className="text-gray-300">{t('status_option')}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-red-500/40 border-2 border-red-500" />
      <span className="text-gray-300">{t('status_vendu')}</span>
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

  const filterOptions = [
    { value: 'all', label: t('masterplan_all') },
    { value: 'disponible', label: t('status_disponible') },
    { value: 'option', label: t('status_option') },
    { value: 'vendu', label: t('status_vendu') },
  ];

  return (
    <div className="min-h-screen bg-[#050a07]" data-testid="masterplan-page">
      <Navbar />
      
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
                <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {t('masterplan_title')}
                </h1>
                <p className="text-gray-400">
                  {t('masterplan_subtitle')}
                </p>
              </div>
              
              {/* Stats Mini */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-400 text-sm font-medium">{stats.disponible}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-orange-400 text-sm font-medium">{stats.option}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-400 text-sm font-medium">{stats.vendu}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls Bar */}
          <motion.div 
            className="card-glass p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Legend t={t} />
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    data-testid="filter-dropdown"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {t('masterplan_filter')}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0d1410] border-white/10">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setFilterStatus(option.value)}
                      className={`text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer ${
                        filterStatus === option.value ? 'bg-green-500/10 text-green-400' : ''
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
              <div className="map-container flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">{t('msg_loading')}</p>
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

          {/* Instructions */}
          <motion.div 
            className="mt-6 flex items-start gap-3 text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
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
      />

      {/* Backdrop */}
      {isDetailOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
          onClick={handleCloseDetail}
        />
      )}

      <Footer />
    </div>
  );
}
