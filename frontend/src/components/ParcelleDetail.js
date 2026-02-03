import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  X, MapPin, Ruler, TreePine, FileText, DollarSign, 
  TrendingUp, Image, Phone, Mail, Download, CheckCircle,
  Building, Mountain, Leaf, Lock, Unlock, Shield, AlertTriangle,
  KeyRound, Eye, Send, MessageCircle, ExternalLink
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

// Document Access Component with Code Verification
const DocumentAccessSection = ({ parcelle, t }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [sendMethod, setSendMethod] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const verifyCode = async () => {
    if (!accessCode.trim()) {
      toast.error('Veuillez entrer un code d\'accès');
      return;
    }

    setVerifying(true);
    try {
      const response = await axios.post(`${API}/documents/verify-code`, {
        code: accessCode.toUpperCase(),
        parcelle_id: parcelle.id
      });

      if (response.data.valid) {
        setIsUnlocked(true);
        setClientInfo(response.data);
        toast.success(`Bienvenue ${response.data.client_name}`, {
          description: 'Vous pouvez maintenant consulter les documents'
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide ou expiré');
    }
    setVerifying(false);
  };

  const handleDocumentAccess = (docType, docLabel) => {
    setSelectedDocument({ type: docType, label: docLabel });
    setShowOptionsDialog(true);
    setSendMethod(null);
    setRecipient('');
  };

  const handlePreview = async () => {
    if (!selectedDocument) return;
    
    try {
      const url = `${API}/documents/${parcelle.id}/${selectedDocument.type}?code=${accessCode}&action=preview`;
      setPreviewUrl(url);
      toast.success('Document en cours de chargement...');
      
      // Open in new tab for preview
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Erreur lors de la prévisualisation');
    }
  };

  const handleDownload = async () => {
    if (!selectedDocument) return;
    
    try {
      const url = `${API}/documents/${parcelle.id}/${selectedDocument.type}?code=${accessCode}&action=download`;
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedDocument.type}_${parcelle.nom}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Téléchargement démarré', {
        description: `Document avec filigrane pour ${clientInfo?.client_name}`
      });
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleSendDocument = async () => {
    if (!sendMethod || !recipient.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('parcelle_id', parcelle.id);
      formData.append('document_type', selectedDocument.type);
      formData.append('code', accessCode);
      formData.append('send_method', sendMethod);
      formData.append('recipient', recipient);

      const response = await axios.post(`${API}/documents/send`, formData);
      
      if (sendMethod === 'whatsapp' && response.data.whatsapp_url) {
        window.open(response.data.whatsapp_url, '_blank');
      }
      
      toast.success(response.data.message);
      setShowOptionsDialog(false);
      setSendMethod(null);
      setRecipient('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
    setSending(false);
  };

  const documentTypes = [
    { key: 'acd', label: 'Arrêté de Concession Définitive (ACD)', icon: FileText },
    { key: 'plan', label: 'Plan cadastral / Bornage', icon: MapPin },
  ];

  return (
    <div className="card-glass p-4">
      <h3 className="font-playfair text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        {t('detail_situation_fonciere')}
      </h3>

      {/* Status foncier */}
      <div className="mb-4">
        <span className="text-gray-400 text-xs block mb-2">{t('field_statut_foncier')}</span>
        <TagList items={parcelle.statut_foncier} />
      </div>

      <Separator className="my-4 bg-white/10" />

      {/* Documents Section */}
      <div>
        <span className="text-gray-400 text-xs block mb-3">{t('field_documents')}</span>

        {!isUnlocked ? (
          // Locked State
          <div className="bg-black/40 rounded-xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-2">
              Documents Officiels Sécurisés
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              L'accès aux documents ACD et plans cadastraux nécessite un code d'accès unique.
            </p>

            <div className="flex gap-2 max-w-xs mx-auto">
              <Input
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="CODE D'ACCÈS"
                className="input-dark text-center font-mono tracking-widest"
                maxLength={8}
                onKeyPress={(e) => e.key === 'Enter' && verifyCode()}
                data-testid="document-access-code"
              />
              <Button 
                onClick={verifyCode}
                disabled={verifying}
                className="btn-primary px-4"
                data-testid="verify-code-btn"
              >
                {verifying ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </Button>
            </div>

            <p className="text-gray-500 text-xs mt-4">
              Pas de code ? Contactez-nous pour demander l'accès.
            </p>
          </div>
        ) : (
          // Unlocked State
          <div className="space-y-3">
            {/* Access Info Banner */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-400 text-sm font-medium">Accès autorisé</p>
                <p className="text-gray-400 text-xs">
                  {clientInfo?.client_name} • Expire: {new Date(clientInfo?.expires_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Watermark Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-amber-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Tous les documents seront marqués d'un filigrane avec votre nom pour traçabilité.</span>
              </p>
            </div>

            {/* Document List */}
            <div className="space-y-2">
              {documentTypes.map((doc) => (
                <button
                  key={doc.key}
                  onClick={() => handleDocumentAccess(doc.key, doc.label)}
                  className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group border border-white/5 hover:border-green-500/30"
                  data-testid={`doc-${doc.key}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <doc.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-white text-sm font-medium block">{doc.label}</span>
                    <span className="text-gray-500 text-xs">Cliquer pour accéder</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                </button>
              ))}
            </div>

            {/* Re-lock option */}
            <button 
              onClick={() => { setIsUnlocked(false); setAccessCode(''); setClientInfo(null); }}
              className="text-gray-500 text-xs hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Verrouiller l'accès
            </button>
          </div>
        )}
      </div>

      {/* Document Options Dialog */}
      <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
        <DialogContent className="bg-[#0d1410] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-playfair flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              {selectedDocument?.label}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Document préparé pour <span className="text-green-400 font-medium">{clientInfo?.client_name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Watermark Notice */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 text-sm font-medium mb-1">Avertissement légal</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Ce document est <strong className="text-white">strictement confidentiel</strong>. 
                    Un filigrane numérique sera appliqué avec votre identifiant pour traçabilité. 
                    Toute diffusion non autorisée est interdite.
                  </p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <p className="text-gray-400 text-sm font-medium">Comment souhaitez-vous recevoir le document ?</p>
              
              {/* Preview Button */}
              <Button
                onClick={handlePreview}
                variant="outline"
                className="w-full justify-start gap-3 border-white/10 hover:bg-white/5"
                data-testid="preview-doc-btn"
              >
                <Eye className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <span className="text-white block">Visualiser avec filigrane</span>
                  <span className="text-gray-500 text-xs">Aperçu dans un nouvel onglet</span>
                </div>
              </Button>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full justify-start gap-3 border-white/10 hover:bg-white/5"
                data-testid="download-doc-btn"
              >
                <Download className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <span className="text-white block">Télécharger le PDF marqué</span>
                  <span className="text-gray-500 text-xs">Fichier PDF avec filigrane</span>
                </div>
              </Button>

              {/* Send Options */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-gray-400 text-xs mb-3">Ou recevoir par :</p>
                
                <div className="flex gap-2 mb-3">
                  <Button
                    onClick={() => setSendMethod('email')}
                    variant={sendMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    className={sendMethod === 'email' ? 'bg-green-500 text-black' : 'border-white/10'}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <Button
                    onClick={() => setSendMethod('whatsapp')}
                    variant={sendMethod === 'whatsapp' ? 'default' : 'outline'}
                    size="sm"
                    className={sendMethod === 'whatsapp' ? 'bg-green-500 text-black' : 'border-white/10'}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>

                {sendMethod && (
                  <div className="space-y-3 animate-fade-in">
                    <Input
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={sendMethod === 'email' ? 'votre@email.com' : '+225 07 XX XX XX XX'}
                      className="input-dark"
                      data-testid="recipient-input"
                    />
                    <Button
                      onClick={handleSendDocument}
                      disabled={sending || !recipient.trim()}
                      className="w-full btn-primary"
                      data-testid="send-doc-btn"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le document
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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

              {/* Document Access with Security */}
              <DocumentAccessSection parcelle={parcelle} t={t} />
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
