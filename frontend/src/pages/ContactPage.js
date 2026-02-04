import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  MapPin, Mail, Phone, Send, ExternalLink, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message envoyé avec succès !');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050a07]" data-testid="contact-page">
      <Navbar />
      
      <main className="pt-24 lg:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              {t('detail_contact')}
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div 
              className="card-glass p-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-playfair text-2xl font-semibold text-white mb-6">
                Envoyez-nous un message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Nom complet *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-dark"
                      placeholder="Votre nom"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-dark"
                      placeholder="votre@email.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Téléphone</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-dark"
                      placeholder="+225 XX XX XX XX"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Sujet *</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-dark"
                      placeholder="Objet de votre demande"
                      data-testid="input-subject"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Message *</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="input-dark resize-none"
                    placeholder="Décrivez votre projet ou posez vos questions..."
                    data-testid="input-message"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  disabled={loading}
                  data-testid="submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
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
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="card-glass p-6">
                <h3 className="font-playfair text-xl font-semibold text-white mb-4">
                  Coordonnées
                </h3>
                <div className="space-y-4">
                  <a 
                    href="mailto:contact@songonextension.com" 
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Email</span>
                      <span className="text-white group-hover:text-green-400 transition-colors">
                        contact@songonextension.com
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
                      <span className="text-gray-400 text-xs block">Téléphone</span>
                      <span className="text-white group-hover:text-green-400 transition-colors">
                        +225 07 00 00 00 00
                      </span>
                    </div>
                  </a>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Adresse</span>
                      <span className="text-white">
                        Songon M'Braté, Abidjan<br />Côte d'Ivoire
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Horaires</span>
                      <span className="text-white">
                        Lun - Ven: 8h00 - 18h00<br />Sam: 9h00 - 13h00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-glass p-6">
                <h3 className="font-playfair text-xl font-semibold text-white mb-4">
                  One Green Dev
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Développeur & Aménageur Territorial en Côte d'Ivoire. 
                  Nous développons des projets durables à forte valeur ajoutée.
                </p>
                <a 
                  href="https://songonextension.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visiter songonextension.com
                </a>
              </div>

              {/* Map Preview */}
              <div className="card-glass overflow-hidden">
                <iframe
                  title="Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31773.77724731989!2d-4.3!3d5.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjEnMDAuMCJOIDTCsDE4JzAwLjAiVw!5e0!3m2!1sfr!2sci!4v1234567890"
                  width="100%"
                  height="200"
                  style={{ border: 0, filter: 'grayscale(1) invert(1) contrast(0.9)' }}
                  allowFullScreen=""
                  loading="lazy"
                  className="opacity-70"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
