import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  X, MapPin, Ruler, TreePine, FileText, DollarSign, 
  TrendingUp, Image, Phone, Mail, Download, CheckCircle,
  Building, Mountain, Leaf
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

const StatusBadge = ({ status, t }) => {
  const statusConfig = {
    disponible: { 
      label: t('status_disponible'), 
      className: 'bg-green-500/20 text-green-400 border-green-500/40' 
    },
    option: { 
      label: t('status_option'), 
      className: 'bg-orange-500/20 text-orange-400 border-orange-500/40' 
    },
    vendu: { 
      label: t('status_vendu'), 
      className: 'bg-red-500/20 text-red-400 border-red-500/40' 
    },
  };
  
  const config = statusConfig[status] || statusConfig.disponible;
  
  return (
    <Badge className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
};

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-2">
    {Icon && <Icon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />}
    <div className="flex-1">
      <span className="text-gray-400 text-xs block mb-0.5">{label}</span>
      <span className="text-white text-sm">{value || '-'}</span>
    </div>
  </div>
);

const TagList = ({ items }) => (
  <div className="flex flex-wrap gap-2">
    {items?.map((item, index) => (
      <span 
        key={index} 
        className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-300"
      >
        {item}
      </span>
    ))}
  </div>
);

export const ParcelleDetail = ({ parcelle, onClose, isOpen }) => {
  const { t } = useLanguage();

  if (!parcelle) return null;

  return (
    <div 
      className={`sidebar-detail ${isOpen ? 'open' : ''}`}
      data-testid="parcelle-detail"
    >
      <div className="sticky top-0 z-10 glass p-4 flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-xl font-semibold text-white">{parcelle.nom}</h2>
          <p className="text-green-400 text-sm">{parcelle.type_projet}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={parcelle.statut} t={t} />
          <button
            onClick={onClose}
            data-testid="close-detail-btn"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="identification" className="w-full">
            <TabsList className="w-full bg-white/5 p-1 rounded-lg grid grid-cols-4 gap-1">
              <TabsTrigger value="identification" className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                Info
              </TabsTrigger>
              <TabsTrigger value="caracteristiques" className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                Terrain
              </TabsTrigger>
              <TabsTrigger value="prix" className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                Prix
              </TabsTrigger>
              <TabsTrigger value="galerie" className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                Photos
              </TabsTrigger>
            </TabsList>

            {/* Identification Tab */}
            <TabsContent value="identification" className="mt-4 space-y-4">
              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t('detail_identification')}
                </h3>
                <InfoRow label={t('field_reference_acd')} value={parcelle.reference_acd || '-'} icon={FileText} />
                <InfoRow label={t('field_statut_acd')} value={parcelle.statut_acd} icon={CheckCircle} />
                <InfoRow label={t('field_proprietaire')} value={parcelle.proprietaire} />
              </div>

              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('detail_localisation')}
                </h3>
                <InfoRow label={t('field_commune')} value={`${parcelle.commune}, ${parcelle.region}`} />
                <InfoRow label={t('field_situation_geo')} value={parcelle.situation_geo} />
                <InfoRow label={t('field_acces')} value={parcelle.acces} />
                <InfoRow label={t('field_axe')} value={parcelle.axe_principal} />
                <InfoRow label={t('field_distance')} value={parcelle.distance_ville} />
              </div>

              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('detail_situation_fonciere')}
                </h3>
                <div className="mb-3">
                  <span className="text-gray-400 text-xs block mb-2">{t('field_statut_foncier')}</span>
                  <TagList items={parcelle.statut_foncier} />
                </div>
                <div>
                  <span className="text-gray-400 text-xs block mb-2">{t('field_documents')}</span>
                  <TagList items={parcelle.documents} />
                </div>
              </div>
            </TabsContent>

            {/* Caractéristiques Tab */}
            <TabsContent value="caracteristiques" className="mt-4 space-y-4">
              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  {t('detail_caracteristiques')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <span className="font-playfair text-2xl font-bold text-white">
                      {parcelle.superficie}
                    </span>
                    <span className="text-green-400 text-sm ml-1">{parcelle.unite_superficie}</span>
                    <p className="text-gray-400 text-xs mt-1">{t('field_superficie')}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Mountain className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <span className="text-white text-sm block">{parcelle.configuration}</span>
                    <p className="text-gray-400 text-xs mt-1">{t('field_configuration')}</p>
                  </div>
                </div>
                <Separator className="my-4 bg-white/10" />
                <div>
                  <span className="text-gray-400 text-xs block mb-2">{t('field_environnement')}</span>
                  <TagList items={parcelle.environnement} />
                </div>
                <InfoRow label={t('field_occupation')} value={parcelle.occupation} icon={TreePine} />
              </div>

              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  {t('detail_potentiel')}
                </h3>
                <div className="mb-3">
                  <span className="text-gray-400 text-xs block mb-2">{t('field_usages')}</span>
                  <TagList items={parcelle.usages_possibles} />
                </div>
                <InfoRow label={t('field_atouts')} value={parcelle.atouts} />
                <InfoRow label={t('field_positionnement')} value={parcelle.positionnement} />
              </div>

              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('detail_etat')}
                </h3>
                <div className="mb-3">
                  <span className="text-gray-400 text-xs block mb-2">{t('field_situation_actuelle')}</span>
                  <TagList items={parcelle.situation_actuelle} />
                </div>
                <InfoRow label={t('field_prochaines_etapes')} value={parcelle.prochaines_etapes} />
              </div>
            </TabsContent>

            {/* Prix Tab */}
            <TabsContent value="prix" className="mt-4 space-y-4">
              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('detail_prix')}
                </h3>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-5 mb-4">
                  <div className="text-center">
                    <span className="text-gray-400 text-xs block mb-1">{t('field_prix_m2')}</span>
                    <span className="font-playfair text-3xl font-bold text-green-400">
                      {formatPrice(parcelle.prix_m2)}
                    </span>
                    <span className="text-white ml-2">FCFA</span>
                  </div>
                  <Separator className="my-4 bg-white/10" />
                  <div className="text-center">
                    <span className="text-gray-400 text-xs block mb-1">{t('field_valeur_globale')}</span>
                    <span className="font-playfair text-xl font-semibold text-white">
                      {formatPrice(parcelle.valeur_globale)} FCFA
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block mb-2">{t('field_modalites')}</span>
                  <TagList items={parcelle.modalites} />
                </div>
                <p className="text-gray-500 text-xs mt-4 italic">
                  NB: Frais de mutation et d'agence non inclus.
                </p>
              </div>

              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t('detail_contact')}
                </h3>
                <div className="space-y-3">
                  <a 
                    href="mailto:contact@onegreendev.com"
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">contact@onegreendev.com</span>
                  </a>
                  <a 
                    href="tel:+22507000000"
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">+225 07 00 00 00 00</span>
                  </a>
                </div>
                <Button 
                  className="w-full mt-4 btn-primary"
                  data-testid="contact-btn"
                >
                  {t('action_contact')}
                </Button>
              </div>
            </TabsContent>

            {/* Galerie Tab */}
            <TabsContent value="galerie" className="mt-4 space-y-4">
              <div className="card-glass p-4">
                <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  {t('detail_galerie')}
                </h3>
                
                {parcelle.photos?.length > 0 || parcelle.vues_drone?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...parcelle.photos, ...parcelle.vues_drone].map((url, index) => (
                      <div 
                        key={index}
                        className="aspect-video bg-white/5 rounded-lg overflow-hidden"
                      >
                        <img 
                          src={url} 
                          alt={`${parcelle.nom} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{t('msg_no_data')}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ParcelleDetail;
