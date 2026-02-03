import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ParcelleDetail } from '../components/ParcelleDetail';
import { 
  MapPin, ArrowRight, TreePine, TrendingUp, 
  Shield, ChevronDown, Mail, Phone, Send, ExternalLink,
  Menu, X, Globe, LogOut, Filter, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, useScroll, useTransform } from 'framer-motion';

// Lazy load the map component for better performance
const MasterplanMap = lazy(() => import('../components/MasterplanMap'));

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Smooth scroll function
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// One-Page Navbar with anchor navigation
const OnePageNavbar = ({ activeSection }) => {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'accueil', label: t('nav_home') },
    { id: 'masterplan', label: t('nav_masterplan') },
    { id: 'contact', label: t('nav_contact') },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`} 
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('accueil')} 
            className="flex items-center gap-3 group"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="font-playfair text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                Songon
              </span>
              <span className="font-montserrat text-xs text-green-400 block -mt-1">Extension</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                data-testid={`nav-${link.id}`}
                className={`font-montserrat text-sm font-medium transition-colors relative py-2 ${
                  activeSection === link.id
                    ? 'text-green-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button
                onClick={() => setLanguage('fr')}
                data-testid="lang-fr"
                className={`px-3 py-1.5 text-xs font-montserrat font-medium rounded-full transition-all ${
                  language === 'fr'
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                data-testid="lang-en"
                className={`px-3 py-1.5 text-xs font-montserrat font-medium rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Admin Link */}
            {isAuthenticated && (
              <a
                href="/admin"
                data-testid="nav-admin"
                className="hidden md:block text-sm font-montserrat font-medium text-green-400 hover:text-green-300 transition-colors"
              >
                Admin
              </a>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              data-testid="mobile-menu-toggle"
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => { scrollToSection(link.id); setIsOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-montserrat font-medium transition-colors ${
                  activeSection === link.id
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-3 py-1.5 text-xs font-montserrat font-medium rounded-full ${
                    language === 'fr' ? 'bg-green-500/20 text-green-400' : 'text-gray-400'
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-montserrat font-medium rounded-full ${
                    language === 'en' ? 'bg-green-500/20 text-green-400' : 'text-gray-400'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Stat Card Component
const StatCard = ({ value, label, delay }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="font-playfair text-3xl lg:text-4xl font-bold text-green-400">{value}</div>
    <div className="font-montserrat text-sm text-gray-400 mt-1">{label}</div>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    className="card-glass p-6 hover:-translate-y-1 transition-transform"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-green-400" />
    </div>
    <h3 className="font-playfair text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="font-montserrat text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// Map Legend Component
const MapLegend = ({ t, filterStatus, setFilterStatus }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ background: 'rgba(34, 139, 34, 0.3)', border: '2px solid #228b22' }} />
        <span className="font-montserrat text-gray-600 text-sm">{t('status_disponible')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ background: 'rgba(210, 105, 30, 0.3)', border: '2px solid #d2691e' }} />
        <span className="font-montserrat text-gray-600 text-sm">{t('status_option')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ background: 'rgba(178, 34, 34, 0.3)', border: '2px solid #b22222' }} />
        <span className="font-montserrat text-gray-600 text-sm">{t('status_vendu')}</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-500" />
      <select 
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="font-montserrat text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500"
        data-testid="filter-select"
      >
        <option value="all">{t('masterplan_all')}</option>
        <option value="disponible">{t('status_disponible')}</option>
        <option value="option">{t('status_option')}</option>
        <option value="vendu">{t('status_vendu')}</option>
      </select>
    </div>
  </div>
);

// Map Loading Placeholder
const MapLoadingPlaceholder = () => (
  <div className="h-[500px] lg:h-[600px] rounded-2xl bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="font-montserrat text-gray-500">Chargement de la carte...</p>
    </div>
  </div>
);

// Footer Component (without Emergent badge)
const Footer = ({ t }) => (
  <footer className="bg-black/80 border-t border-white/10 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-playfair text-white font-semibold">Songon Extension</span>
        </div>
        <div className="flex items-center gap-6">
          <a 
            href="https://onegreendev.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-montserrat text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            onegreendev.com
          </a>
        </div>
        <p className="font-montserrat text-gray-500 text-sm">
          © {new Date().getFullYear()} One Green Dev. {t('footer_rights')}.
        </p>
      </div>
    </div>
  </footer>
);

// Main One-Page Component
export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ total: 0, disponible: 0, total_superficie: 0, option: 0, vendu: 0 });
  const [parcelles, setParcelles] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeSection, setActiveSection] = useState('accueil');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Intersection Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, parcellesRes] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/parcelles`)
        ]);
        setStats(statsRes.data);
        setParcelles(parcellesRes.data.parcelles || []);
        setConfig(parcellesRes.data.config || {});
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // Lazy load map when scrolled into view
  useEffect(() => {
    const mapSection = document.getElementById('masterplan');
    if (!mapSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !mapLoaded) {
          setMapLoaded(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(mapSection);
    return () => observer.disconnect();
  }, [mapLoaded]);

  const handleParcelleClick = (parcelle) => {
    setSelectedParcelle(parcelle);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedParcelle(null), 300);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(t('msg_success'));
    setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050a07]" data-testid="home-page">
      <OnePageNavbar activeSection={activeSection} />
      
      {/* ==================== HERO SECTION ==================== */}
      <section id="accueil" className="relative min-h-screen flex items-center pt-20" data-testid="hero-section">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920"
          alt="Songon landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#050a07]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.span 
              className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-montserrat text-sm font-medium mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Opportunité Foncière
            </motion.span>
            
            <motion.h1 
              className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('hero_title')}
            </motion.h1>
            
            <motion.p 
              className="font-montserrat text-xl sm:text-2xl text-green-400 font-light mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
            
            <motion.p 
              className="font-montserrat text-gray-300 text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t('hero_description')}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                onClick={() => scrollToSection('masterplan')}
                className="btn-primary flex items-center gap-2 group"
                data-testid="cta-masterplan"
              >
                {t('hero_cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => scrollToSection('contact')}
                variant="outline" 
                className="btn-secondary"
                data-testid="cta-contact"
              >
                {t('hero_cta_secondary')}
              </Button>
            </motion.div>
          </div>
          
          {/* Scroll indicator */}
          <motion.button
            onClick={() => scrollToSection('masterplan')}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          >
            <ChevronDown className="w-8 h-8" />
          </motion.button>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="relative z-10 bg-black/60 backdrop-blur-lg border-y border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={stats.total} label={t('stats_parcelles')} delay={0} />
            <StatCard value={`${Math.round(stats.total_superficie)}+`} label={t('stats_hectares')} delay={0.1} />
            <StatCard value={stats.disponible} label={t('stats_disponible')} delay={0.2} />
            <StatCard value="100%" label="Titre foncier" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ==================== WHY INVEST SECTION ==================== */}
      <section className="py-20 lg:py-28 bg-[#050a07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white mb-4">
              Pourquoi investir ?
            </h2>
            <p className="font-montserrat text-gray-400 max-w-2xl mx-auto">
              Un territoire d'exception pour vos projets d'investissement immobilier
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Shield}
              title="Titre Foncier Sécurisé"
              description="Documentation juridique complète et sécurisée, sans litige."
              delay={0}
            />
            <FeatureCard 
              icon={MapPin}
              title="Zone Stratégique"
              description="Située dans le corridor de développement Abidjan-Songon."
              delay={0.1}
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Fort Potentiel"
              description="Valorisation significative estimée sur 5-10 ans."
              delay={0.2}
            />
            <FeatureCard 
              icon={TreePine}
              title="Cadre Naturel"
              description="Environnement préservé idéal pour projets durables."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ==================== MASTERPLAN SECTION ==================== */}
      <section 
        id="masterplan" 
        className="py-20 lg:py-28"
        style={{ background: 'linear-gradient(135deg, #faf9f6 0%, #f5f3ef 100%)' }}
        data-testid="masterplan-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-montserrat text-green-700 text-sm font-semibold uppercase tracking-wider">
              Master Plan
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 mb-4">
              {t('masterplan_title')}
            </h2>
            <p className="font-montserrat text-gray-600 max-w-2xl mx-auto">
              {t('masterplan_subtitle')}
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { label: t('stats_disponible'), value: stats.disponible, color: 'green' },
              { label: t('status_option'), value: stats.option, color: 'orange' },
              { label: t('status_vendu'), value: stats.vendu, color: 'red' },
              { label: t('stats_hectares'), value: `${Math.round(stats.total_superficie)}+`, color: 'blue' }
            ].map((stat, i) => (
              <div 
                key={i}
                className={`bg-white rounded-xl p-4 text-center shadow-sm border border-${stat.color}-100`}
              >
                <div className={`font-playfair text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                <div className="font-montserrat text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Legend and Filter */}
          <MapLegend t={t} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

          {/* Interactive Map */}
          <motion.div 
            className="rounded-2xl overflow-hidden shadow-2xl border border-green-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={<MapLoadingPlaceholder />}>
              {mapLoaded && config && (
                <div className="h-[500px] lg:h-[600px]">
                  <MasterplanMap
                    parcelles={parcelles}
                    config={config}
                    onParcelleClick={handleParcelleClick}
                    selectedParcelle={selectedParcelle}
                    filterStatus={filterStatus}
                  />
                </div>
              )}
              {!mapLoaded && <MapLoadingPlaceholder />}
            </Suspense>
          </motion.div>

          {/* Map Instructions */}
          <p className="font-montserrat text-gray-500 text-sm text-center mt-4">
            Cliquez sur une parcelle pour afficher sa fiche détaillée. Survolez pour voir le prix au m².
          </p>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section id="contact" className="py-20 lg:py-28 bg-[#050a07]" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white mb-4">
              Intéressé par ce projet ?
            </h2>
            <p className="font-montserrat text-gray-400 max-w-xl mx-auto">
              Notre équipe est disponible pour répondre à toutes vos questions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div 
              className="card-glass p-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleContactSubmit} className="space-y-5" data-testid="contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-montserrat text-gray-400 text-sm mb-2 block">Nom complet *</label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      className="input-dark"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="font-montserrat text-gray-400 text-sm mb-2 block">Email *</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      className="input-dark"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="font-montserrat text-gray-400 text-sm mb-2 block">Téléphone</label>
                  <Input
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="input-dark"
                    placeholder="+225 XX XX XX XX"
                  />
                </div>
                
                <div>
                  <label className="font-montserrat text-gray-400 text-sm mb-2 block">Message *</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={4}
                    className="input-dark resize-none"
                    placeholder="Décrivez votre projet ou posez vos questions..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  disabled={submitting}
                  data-testid="submit-btn"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="card-glass p-6">
                <h3 className="font-playfair text-xl font-semibold text-white mb-4">
                  Coordonnées
                </h3>
                <div className="space-y-4">
                  <a 
                    href="mailto:contact@onegreendev.com" 
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="font-montserrat text-gray-400 text-xs block">Email</span>
                      <span className="font-montserrat text-white group-hover:text-green-400 transition-colors">
                        contact@onegreendev.com
                      </span>
                    </div>
                  </a>
                  
                  <a 
                    href="tel:+22507000000" 
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="font-montserrat text-gray-400 text-xs block">Téléphone</span>
                      <span className="font-montserrat text-white group-hover:text-green-400 transition-colors">
                        +225 07 00 00 00 00
                      </span>
                    </div>
                  </a>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="font-montserrat text-gray-400 text-xs block">Adresse</span>
                      <span className="font-montserrat text-white">
                        Songon M'Braté, Abidjan<br />Côte d'Ivoire
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="font-montserrat text-gray-400 text-xs block">Horaires</span>
                      <span className="font-montserrat text-white">
                        Lun - Ven: 8h00 - 18h00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-glass p-6">
                <h3 className="font-playfair text-xl font-semibold text-white mb-3">
                  One Green Dev
                </h3>
                <p className="font-montserrat text-gray-400 text-sm leading-relaxed mb-4">
                  Développeur & Aménageur Territorial en Côte d'Ivoire. 
                  Nous développons des projets durables à forte valeur ajoutée.
                </p>
                <a 
                  href="https://onegreendev.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors font-montserrat text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visiter onegreendev.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <Footer t={t} />

      {/* ==================== PARCELLE DETAIL SIDEBAR ==================== */}
      <ParcelleDetail
        parcelle={selectedParcelle}
        onClose={handleCloseDetail}
        isOpen={isDetailOpen}
      />

      {/* Backdrop for detail sidebar */}
      {isDetailOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
          onClick={handleCloseDetail}
        />
      )}
    </div>
  );
}
