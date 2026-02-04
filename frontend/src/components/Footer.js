import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative bg-black/60 border-t border-white/10" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-playfair text-xl font-semibold text-white">Songon Extension</span>
                <span className="font-montserrat text-xs text-green-400 block">by One Green Dev</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              Développeur & Aménageur Territorial en Côte d'Ivoire. 
              Projets immobiliers d'exception à Songon M'Braté.
            </p>
            <a 
              href="https://songonextension.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              songonextension.com
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                  {t('nav_home')}
                </Link>
              </li>
              <li>
                <Link to="/masterplan" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                  {t('nav_masterplan')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                  {t('nav_contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-4">{t('detail_contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-green-400" />
                contact@songonextension.com
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-green-400" />
                +225 07 00 00 00 00
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Songon M'Braté<br />Abidjan, Côte d'Ivoire</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} One Green Dev. {t('footer_rights')}.
          </p>
          <p className="text-gray-500 text-xs">
            {t('footer_powered')} <span className="text-green-400">Emergent</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
