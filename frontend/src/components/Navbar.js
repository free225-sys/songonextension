import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Globe, LogOut, MapPin } from 'lucide-react';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav_home') },
    { path: '/masterplan', label: t('nav_masterplan') },
    { path: '/contact', label: t('nav_contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="font-playfair text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                Songon
              </span>
              <span className="font-montserrat text-xs text-green-400 block -mt-1">Extension</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.path.replace('/', '') || 'home'}`}
                className={`font-montserrat text-sm font-medium transition-colors relative py-2 ${
                  isActive(link.path)
                    ? 'text-green-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button
                onClick={() => setLanguage('fr')}
                data-testid="lang-fr"
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
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
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/admin"
                  data-testid="nav-admin"
                  className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  {t('nav_admin')}
                </Link>
                <button
                  onClick={logout}
                  data-testid="logout-btn"
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                data-testid="nav-login"
                className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {t('nav_login')}
              </Link>
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
        <div className="md:hidden glass border-t border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                    language === 'fr' ? 'bg-green-500/20 text-green-400' : 'text-gray-400'
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                    language === 'en' ? 'bg-green-500/20 text-green-400' : 'text-gray-400'
                  }`}
                >
                  EN
                </button>
              </div>
              
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t('nav_logout')}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-green-400"
                >
                  {t('nav_login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
