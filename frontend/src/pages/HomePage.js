import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  MapPin, ArrowRight, TreePine, Building, TrendingUp, 
  Shield, ChevronRight, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const StatCard = ({ value, label, delay }) => (
  <motion.div 
    className="stat-card text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    className="card-glass p-6 hover:-translate-y-1"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-green-400" />
    </div>
    <h3 className="font-playfair text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ total: 0, disponible: 0, total_superficie: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#050a07]" data-testid="home-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section relative pt-20" data-testid="hero-section">
        <img 
          src="https://images.unsplash.com/photo-1769258958976-8852440011b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjB2aWV3JTIwZ3JlZW4lMjBsYW5kJTIwcGxvdHxlbnwwfHx8fDE3Njk5ODYxMDl8MA&ixlib=rb-4.1.0&q=85"
          alt="Aerial view of Songon"
          className="hero-bg"
        />
        <div className="hero-overlay" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                One Green Dev
              </span>
            </motion.div>
            
            <motion.h1 
              className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('hero_title')}
            </motion.h1>
            
            <motion.p 
              className="text-xl sm:text-2xl text-green-400 font-light mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
            
            <motion.p 
              className="text-gray-300 text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
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
              <Link to="/masterplan">
                <Button 
                  className="btn-primary w-full sm:w-auto flex items-center gap-2 group"
                  data-testid="cta-masterplan"
                >
                  {t('hero_cta')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  className="btn-secondary w-full sm:w-auto"
                  data-testid="cta-contact"
                >
                  {t('hero_cta_secondary')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <motion.div 
          className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard value={stats.total} label={t('stats_parcelles')} delay={0} />
              <StatCard value={`${Math.round(stats.total_superficie)}+`} label={t('stats_hectares')} delay={0.1} />
              <StatCard value={stats.disponible} label={t('stats_disponible')} delay={0.2} />
              <StatCard value="100%" label={t('stats_valorises')} delay={0.3} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Pourquoi Songon ?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Un territoire d'exception pour vos projets d'investissement immobilier
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={MapPin}
              title="Localisation Stratégique"
              description="À seulement 25 km d'Abidjan, proximité de l'autoroute du Nord et de la future zone économique."
              delay={0}
            />
            <FeatureCard 
              icon={TreePine}
              title="Cadre Naturel"
              description="Environnement préservé avec forêts, lagunes et espaces verts pour des projets durables."
              delay={0.1}
            />
            <FeatureCard 
              icon={Shield}
              title="Sécurité Foncière"
              description="Terrains titrés avec ACD, sans litige, accompagnement juridique complet."
              delay={0.2}
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Fort Potentiel"
              description="Zone en plein développement avec perspective de valorisation à long terme."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="card-glass p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-4">
                Découvrez le Masterplan Interactif
              </h2>
              <p className="text-gray-400">
                Explorez toutes nos parcelles disponibles, consultez les caractéristiques et les prix en temps réel.
              </p>
            </div>
            <Link to="/masterplan">
              <Button className="btn-primary flex items-center gap-2 group whitespace-nowrap">
                Explorer maintenant
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Preview */}
      <section className="py-20 lg:py-32" data-testid="projects-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Projets Structurants
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Des projets emblématiques qui façonnent le territoire de Songon
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Le Golf de Songon',
                type: 'Équipement sportif & Loisirs',
                image: 'https://images.pexels.com/photos/914682/pexels-photo-914682.jpeg',
                link: 'https://legolfdesongon.com/'
              },
              {
                title: 'Les Terres de Songon',
                type: 'Immobilier de destination',
                image: 'https://images.unsplash.com/photo-1739617184286-aafd62c0c166?w=800',
                link: 'https://lesterresdesongon.com/'
              },
              {
                title: 'Songon East-Side',
                type: 'Valorisation foncière',
                image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
                link: '#'
              }
            ].map((project, index) => (
              <motion.a
                key={index}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card-glass overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-green-400 text-xs font-medium">{project.type}</span>
                  <h3 className="font-playfair text-lg font-semibold text-white mt-1 group-hover:text-green-400 transition-colors">
                    {project.title}
                  </h3>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
