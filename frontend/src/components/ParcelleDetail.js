import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  X, MapPin, Ruler, TreePine, FileText, DollarSign, 
  TrendingUp, Image, Phone, Mail, Download, CheckCircle,
  Building, Mountain, Leaf, Lock, Unlock, Shield, AlertTriangle,
  KeyRound, Eye, MessageCircle, ExternalLink, Video, Play, Pause, Volume2, VolumeX
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

// Video Player Component for PROPRIETAIRE surveillance
const VideoPlayer = ({ videoUrl, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auto-play when component mounts
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(e => {
        console.error('Auto-play failed:', e);
        setError('La lecture automatique a échoué. Cliquez sur Play.');
      });
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/10 max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="font-playfair text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center animate-pulse">
              <Video className="w-5 h-5 text-red-500" />
            </div>
            <span>Surveillance en Direct</span>
            <Badge className="bg-red-500 text-white border-0 ml-auto animate-pulse">
              ● LIVE
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative aspect-video bg-gray-900">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-gray-400">{error}</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={videoUrl}
              muted={isMuted}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setError('Impossible de charger le flux vidéo')}
            />
          )}
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <p className="text-gray-500 text-xs text-center font-montserrat">
            Flux sécurisé • Accès réservé aux propriétaires • Ne pas partager
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Multi-Parcelle Navigation for PROPRIETAIRE
const MultiParcelleNav = ({ parcelles, currentParcelleId, onSelectParcelle }) => {
  if (!parcelles || parcelles.length <= 1) return null;
  
  return (
    <div className="mb-4 p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-xs font-montserrat font-medium">
          👑 Vos propriétés ({parcelles.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {parcelles.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectParcelle(p.id)}
            className={`px-3 py-2 rounded-lg text-xs font-montserrat transition-all ${
              p.id === currentParcelleId
                ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
            data-testid={`parcelle-nav-${p.id}`}
          >
            <span className="block">{p.nom}</span>
            <span className={`text-[10px] ${p.id === currentParcelleId ? 'text-black/60' : 'text-gray-500'}`}>
              {p.superficie} {p.unite_superficie || 'ha'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Document Access Component with Code Verification and Profile Support
const DocumentAccessSection = ({ parcelle, t, onParcelleChange }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null); // Profile type info
  const [verifying, setVerifying] = useState(false);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  // Multi-parcelle state
  const [ownerParcelles, setOwnerParcelles] = useState([]);
  const [isMultiParcelle, setIsMultiParcelle] = useState(false);

  // Fetch available documents for this parcelle
  useEffect(() => {
    const fetchAvailableDocuments = async () => {
      try {
        const response = await axios.get(`${API}/parcelles/${parcelle.id}/documents`);
        setAvailableDocuments(response.data.available_documents || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setAvailableDocuments([]);
      }
      setLoadingDocs(false);
    };
    
    if (parcelle?.id) {
      fetchAvailableDocuments();
    }
  }, [parcelle?.id]);

  const verifyCode = async () => {
    if (!accessCode.trim()) {
      toast.error('Veuillez entrer un code d\'accès');
      return;
    }

    setVerifying(true);
    try {
      // Use the new profile verification endpoint
      const response = await axios.post(`${API}/documents/verify-profile`, 
        new URLSearchParams({
          code: accessCode.toUpperCase(),
          parcelle_id: parcelle.id
        })
      );

      if (response.data.valid) {
        setIsUnlocked(true);
        setClientInfo(response.data);
        setProfileInfo(response.data);
        
        // Check if expired (for PROSPECT)
        if (response.data.is_expired) {
          toast.error('Votre code a expiré', {
            description: 'Contactez-nous pour renouveler votre accès ou devenir propriétaire'
          });
          setIsUnlocked(false);
          return;
        }
        
        const profileLabel = response.data.profile_type === 'PROPRIETAIRE' ? '👑 Propriétaire' : '👤 Prospect';
        toast.success(`Bienvenue ${response.data.client_name}`, {
          description: `Profil: ${profileLabel}`
        });
        
        // For PROPRIETAIRE, check if they have multiple parcelles
        if (response.data.profile_type === 'PROPRIETAIRE') {
          try {
            const ownerResponse = await axios.post(`${API}/documents/get-owner-parcelles`,
              new URLSearchParams({ code: accessCode.toUpperCase() })
            );
            
            if (ownerResponse.data.is_multi_parcelle) {
              setOwnerParcelles(ownerResponse.data.parcelles);
              setIsMultiParcelle(true);
              toast.info(`Vous avez accès à ${ownerResponse.data.parcelle_count} propriétés`, {
                description: 'Utilisez la navigation pour consulter vos autres parcelles'
              });
            }
          } catch (err) {
            console.error('Error fetching owner parcelles:', err);
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide ou expiré');
    }
    setVerifying(false);
  };

  // Handle parcelle switch for multi-parcelle owners
  const handleParcelleSwitch = (newParcelleId) => {
    if (newParcelleId !== parcelle.id && onParcelleChange) {
      onParcelleChange(newParcelleId);
    }
  };

  const handleSurveillanceAccess = async () => {
    setLoadingVideo(true);
    try {
      const response = await axios.post(`${API}/surveillance/access`,
        new URLSearchParams({
          code: accessCode.toUpperCase(),
          parcelle_id: parcelle.id
        })
      );
      
      if (response.data.access_granted) {
        setVideoUrl(response.data.video_url);
        setShowVideoPlayer(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Accès surveillance refusé');
    }
    setLoadingVideo(false);
  };

  const handleDocumentAccess = (docType, docLabel) => {
    setSelectedDocument({ type: docType, label: docLabel });
    setShowOptionsDialog(true);
    setShowEmailForm(false);
    setEmailAddress('');
  };

  const handlePreview = async () => {
    if (!selectedDocument) return;
    
    try {
      const url = `${API}/documents/${parcelle.id}/${selectedDocument.type}?code=${accessCode}&action=preview`;
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
      
      const docDescription = profileInfo?.show_watermark 
        ? `Document avec filigrane pour ${clientInfo?.client_name}`
        : `Document ORIGINAL pour ${clientInfo?.client_name}`;
      
      toast.success('Téléchargement démarré', {
        description: docDescription
      });
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress.trim() || !emailAddress.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setSendingEmail(true);
    try {
      const formData = new FormData();
      formData.append('parcelle_id', parcelle.id);
      formData.append('document_type', selectedDocument.type);
      formData.append('code', accessCode);
      formData.append('send_method', 'email');
      formData.append('recipient', emailAddress);

      const response = await axios.post(`${API}/documents/send`, formData);
      
      if (response.data.success) {
        toast.success('Email envoyé !', {
          description: `Document envoyé à ${emailAddress}`
        });
        setShowEmailForm(false);
        setEmailAddress('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de l\'envoi';
      toast.error(errorMsg);
    }
    setSendingEmail(false);
  };

  // Get icon based on document type
  const getDocumentIcon = (docType) => {
    switch (docType) {
      case 'plan':
        return MapPin;
      case 'titre_foncier':
        return Shield;
      default:
        return FileText;
    }
  };

  // Determine if user is PROSPECT or PROPRIETAIRE
  const isProprietaire = profileInfo?.profile_type === 'PROPRIETAIRE';
  const canAccessSurveillance = profileInfo?.can_access_surveillance;

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

      {/* Video Player Dialog */}
      {showVideoPlayer && videoUrl && (
        <VideoPlayer videoUrl={videoUrl} onClose={() => setShowVideoPlayer(false)} />
      )}

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
          // Unlocked State - Different display based on profile
          <div className="space-y-3">
            {/* Profile Badge */}
            <div className={`rounded-lg p-3 flex items-center gap-3 ${
              isProprietaire 
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30' 
                : 'bg-green-500/10 border border-green-500/20'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isProprietaire ? 'bg-amber-500/20' : 'bg-green-500/20'
              }`}>
                <span className="text-2xl">{isProprietaire ? '👑' : '👤'}</span>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-playfair font-semibold ${isProprietaire ? 'text-amber-400' : 'text-green-400'}`}>
                  {isProprietaire ? 'Propriétaire vérifié' : 'Accès Prospect'}
                </p>
                <p className="text-gray-400 text-xs font-montserrat">
                  {clientInfo?.client_name}
                  {isProprietaire 
                    ? ' • Accès permanent' 
                    : ` • ${profileInfo?.days_remaining ?? 0}j restant(s)`
                  }
                </p>
              </div>
              <Shield className={`w-5 h-5 ${isProprietaire ? 'text-amber-400' : 'text-green-400'}`} />
            </div>

            {/* PROPRIETAIRE: Surveillance Button */}
            {isProprietaire && canAccessSurveillance && (
              <button
                onClick={handleSurveillanceAccess}
                disabled={loadingVideo}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-500/20 group"
                data-testid="surveillance-button"
              >
                {loadingVideo ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-playfair text-lg font-semibold">Surveillance en Direct</span>
                    <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                  </>
                )}
              </button>
            )}

            {/* Document Notice based on profile */}
            <div className={`rounded-lg p-3 ${
              isProprietaire 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-amber-500/10 border border-amber-500/20'
            }`}>
              <p className={`text-xs flex items-center gap-2 ${isProprietaire ? 'text-green-400' : 'text-amber-400'}`}>
                {isProprietaire ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>En tant que propriétaire, vous accédez aux <strong>documents originaux</strong> sans filigrane.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Documents avec filigrane de sécurité. Devenez propriétaire pour accéder aux originaux.</span>
                  </>
                )}
              </p>
            </div>

            {/* Document List - Dynamic based on uploaded documents */}
            <div className="space-y-2">
              {loadingDocs ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500 text-xs mt-2">Chargement des documents...</p>
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="text-center py-6 bg-white/5 rounded-lg">
                  <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Aucun document officiel disponible</p>
                  <p className="text-gray-500 text-xs mt-1">Les documents seront ajoutés prochainement</p>
                </div>
              ) : (
                availableDocuments.map((doc) => {
                  const DocIcon = getDocumentIcon(doc.type);
                  return (
                    <button
                      key={doc.type}
                      onClick={() => handleDocumentAccess(doc.type, doc.label)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors group border ${
                        isProprietaire 
                          ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40' 
                          : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-green-500/30'
                      }`}
                      data-testid={`doc-${doc.type}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isProprietaire ? 'bg-amber-500/10' : 'bg-green-500/10'
                      }`}>
                        <DocIcon className={`w-5 h-5 ${isProprietaire ? 'text-amber-400' : 'text-green-400'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-white text-sm font-medium block">{doc.label}</span>
                        <span className="text-gray-500 text-xs">
                          {isProprietaire ? 'Document original' : 'Document sécurisé'}
                        </span>
                      </div>
                      <ExternalLink className={`w-4 h-4 transition-colors ${
                        isProprietaire ? 'text-amber-500/50 group-hover:text-amber-400' : 'text-gray-500 group-hover:text-green-400'
                      }`} />
                    </button>
                  );
                })
              )}
            </div>

            {/* Re-lock option */}
            <button 
              onClick={() => { setIsUnlocked(false); setAccessCode(''); setClientInfo(null); setProfileInfo(null); }}
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
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isProprietaire ? 'bg-amber-500/10' : 'bg-green-500/10'
              }`}>
                <FileText className={`w-5 h-5 ${isProprietaire ? 'text-amber-400' : 'text-green-400'}`} />
              </div>
              {selectedDocument?.label}
              {isProprietaire && (
                <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 ml-auto">
                  Original
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Document pour <span className={`font-medium ${isProprietaire ? 'text-amber-400' : 'text-green-400'}`}>{clientInfo?.client_name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Document Info based on profile */}
            <div className={`border rounded-lg p-4 ${
              isProprietaire 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-amber-500/5 border-amber-500/20'
            }`}>
              <div className="flex items-start gap-3">
                {isProprietaire ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-400 text-sm font-medium font-montserrat">Document Original</p>
                      <p className="text-gray-400 text-xs mt-1 font-montserrat">
                        En tant que propriétaire, vous téléchargez le document <strong>sans filigrane</strong>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-400 text-sm font-medium font-montserrat">Document sécurisé</p>
                      <p className="text-gray-400 text-xs mt-1 font-montserrat">
                        Ce document sera marqué d'un <strong className="text-white">filigrane de sécurité</strong> avec votre identifiant pour traçabilité.
                      </p>
                    </div>
                  </>
                )}
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
                  <span className="text-white block">Visualiser {selectedDocument?.label}</span>
                  <span className="text-gray-500 text-xs">Aperçu avec filigrane dans un nouvel onglet</span>
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
                  <span className="text-white block">Télécharger {selectedDocument?.label}</span>
                  <span className="text-gray-500 text-xs">Fichier PDF avec filigrane</span>
                </div>
              </Button>

              {/* Email & WhatsApp Options */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-gray-400 text-xs mb-3">Recevoir le document par :</p>
                
                {/* Email Option */}
                {!showEmailForm ? (
                  <Button
                    onClick={() => setShowEmailForm(true)}
                    variant="outline"
                    className="w-full justify-start gap-3 border-white/10 hover:bg-white/5 mb-3"
                    data-testid="email-option-btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left flex-1">
                      <span className="text-white font-medium block">Recevoir par Email</span>
                      <span className="text-gray-500 text-xs">Document PDF envoyé dans votre boîte mail</span>
                    </div>
                  </Button>
                ) : (
                  <div className="bg-white/5 rounded-xl p-4 mb-3 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm font-medium">Envoi par Email</span>
                    </div>
                    <Input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="votre@email.com"
                      className="input-dark"
                      data-testid="email-input"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => { setShowEmailForm(false); setEmailAddress(''); }}
                        variant="outline"
                        size="sm"
                        className="border-white/10"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSendEmail}
                        disabled={sendingEmail || !emailAddress.trim()}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                        data-testid="send-email-btn"
                      >
                        {sendingEmail ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Envoyer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* WhatsApp Option */}
                <a
                  href={`https://wa.me/2250705509738?text=${encodeURIComponent(
                    `Bonjour, je suis ${clientInfo?.client_name || 'Client'}. Je viens de débloquer l'accès pour la parcelle "${parcelle?.nom || 'N/A'}" (Réf: ${parcelle?.reference_tf || 'N/A'}) sur votre site Songon Extension. Merci de m'envoyer les documents officiels (${selectedDocument?.label || 'ACD/Titre Foncier'}) correspondants.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366]/50 rounded-xl transition-all group"
                  data-testid="whatsapp-link"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-white font-medium block">Demander via WhatsApp</span>
                    <span className="text-gray-400 text-xs">+225 07 05 50 97 38</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#25D366] group-hover:translate-x-1 transition-transform" />
                </a>
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
                    href="mailto:contact@songonextension.com"
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">contact@songonextension.com</span>
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
