import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  X, MapPin, Ruler, TreePine, FileText, 
  Building, Mountain, Leaf, Lock, Unlock, Shield,
  KeyRound, Eye, MessageCircle, ExternalLink, Video, 
  User, Send, Sparkles, Mail, Download, Play, Pause, 
  Volume2, VolumeX, Maximize2, CheckCircle, Clock
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    disponible: { label: 'Disponible', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    option: { label: 'Sous Option', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    vendu: { label: 'Vendu', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };
  const { label, className } = config[status] || config.disponible;
  return <Badge className={`${className} border font-montserrat`}>{label}</Badge>;
};

// Multi-Parcelle Navigation Component
const MultiParcelleNav = ({ parcelles, currentParcelleId, onSelectParcelle }) => {
  if (!parcelles || parcelles.length <= 1) return null;
  
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-sm font-montserrat font-medium">
          👑 Vos propriétés ({parcelles.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {parcelles.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectParcelle(p.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-montserrat transition-all ${
              p.id === currentParcelleId
                ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
            data-testid={`parcelle-nav-${p.id}`}
          >
            <span className="block">{p.nom}</span>
            <span className={`text-xs ${p.id === currentParcelleId ? 'text-black/60' : 'text-gray-500'}`}>
              {p.superficie} {p.unite_superficie || 'ha'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Video Player Component with Video.js
const VideoPlayer = ({ streamUrl, parcelleNom }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    // Initialize Video.js player
    playerRef.current = videojs(videoRef.current, {
      autoplay: false,
      controls: false,
      responsive: true,
      fluid: true,
      muted: true,
      sources: [{
        src: streamUrl,
        type: streamUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }]
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [streamUrl]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (!isFullscreen) {
        playerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  if (!streamUrl) {
    return (
      <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center border border-white/10">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 font-montserrat">Flux vidéo non configuré</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
      {/* Live Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold font-montserrat">LIVE</span>
        </div>
        <span className="text-white/80 text-sm font-montserrat bg-black/50 px-3 py-1.5 rounded-full">
          {parcelleNom}
        </span>
      </div>

      {/* Video Element */}
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-forest"
          playsInline
        />
      </div>

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Immersive Modal Component
export const ParcelleModal = ({ parcelle, isOpen, onClose, onParcelleChange, parcelles = [] }) => {
  const { t } = useLanguage();
  
  // Access & Profile State
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);
  
  // Multi-parcelle state
  const [ownerParcelles, setOwnerParcelles] = useState([]);
  const [isMultiParcelle, setIsMultiParcelle] = useState(false);
  
  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ nom: '', prenom: '', whatsapp: '' });
  
  // Documents state
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocOptions, setShowDocOptions] = useState(false);
  
  // Video state
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  
  // Email state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const isProprietaire = profileInfo?.profile_type === 'PROPRIETAIRE';
  const hasCameraAccess = profileInfo?.camera_access && isProprietaire;

  // Fetch available documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!parcelle?.id) return;
      try {
        const response = await axios.get(`${API}/parcelles/${parcelle.id}/documents`);
        setAvailableDocuments(response.data.available_documents || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setAvailableDocuments([]);
      }
      setLoadingDocs(false);
    };
    fetchDocuments();
  }, [parcelle?.id]);

  // Fetch video URL for proprietaire
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!isUnlocked || !isProprietaire || !hasCameraAccess || !parcelle?.id) return;
      setLoadingVideo(true);
      try {
        const response = await axios.post(`${API}/surveillance/access`,
          new URLSearchParams({
            code: accessCode,
            parcelle_id: parcelle.id
          })
        );
        if (response.data.video_url) {
          setVideoUrl(response.data.video_url);
        }
      } catch (error) {
        console.error('Error fetching video URL:', error);
      }
      setLoadingVideo(false);
    };
    fetchVideoUrl();
  }, [isUnlocked, isProprietaire, hasCameraAccess, parcelle?.id, accessCode]);

  // Verify access code
  const verifyCode = async () => {
    if (!accessCode.trim()) {
      toast.error('Veuillez entrer un code d\'accès');
      return;
    }

    setVerifying(true);
    try {
      const response = await axios.post(`${API}/documents/verify-profile`, 
        new URLSearchParams({
          code: accessCode.toUpperCase(),
          parcelle_id: parcelle.id
        })
      );

      if (response.data.valid) {
        if (response.data.is_expired) {
          toast.error('Votre code a expiré', {
            description: 'Contactez-nous pour renouveler votre accès'
          });
          setVerifying(false);
          return;
        }
        
        setIsUnlocked(true);
        setClientInfo(response.data);
        setProfileInfo(response.data);
        
        const profileLabel = response.data.profile_type === 'PROPRIETAIRE' ? '👑 Propriétaire' : '👤 Prospect';
        toast.success(`Bienvenue ${response.data.client_name}`, {
          description: `Profil: ${profileLabel}`
        });
        
        // Check for multi-parcelle
        if (response.data.profile_type === 'PROPRIETAIRE') {
          try {
            const ownerResponse = await axios.post(`${API}/documents/get-owner-parcelles`,
              new URLSearchParams({ code: accessCode.toUpperCase() })
            );
            if (ownerResponse.data.is_multi_parcelle) {
              setOwnerParcelles(ownerResponse.data.parcelles);
              setIsMultiParcelle(true);
              toast.info(`Vous avez accès à ${ownerResponse.data.parcelle_count} propriétés`);
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

  // Handle parcelle switch
  const handleParcelleSwitch = (newParcelleId) => {
    if (newParcelleId !== parcelle?.id && onParcelleChange) {
      onParcelleChange(newParcelleId);
    }
  };

  // Submit access request
  const handleCodeRequest = async () => {
    if (!requestForm.nom.trim() || !requestForm.prenom.trim() || !requestForm.whatsapp.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSubmittingRequest(true);
    try {
      await axios.post(`${API}/code-requests`, {
        nom: requestForm.nom,
        prenom: requestForm.prenom,
        whatsapp: requestForm.whatsapp,
        parcelle_id: parcelle.id,
        parcelle_nom: parcelle.nom
      });
      
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Merci {requestForm.prenom} !</p>
          <p className="text-sm">Votre demande a été transmise.</p>
          <p className="text-xs text-gray-400">Un conseiller vous contactera sous peu.</p>
        </div>,
        { duration: 8000 }
      );
      
      setShowRequestForm(false);
      setRequestForm({ nom: '', prenom: '', whatsapp: '' });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
    setSubmittingRequest(false);
  };

  // Handle document download
  const handleDownload = async (docType) => {
    try {
      const response = await axios.get(
        `${API}/documents/${parcelle.id}/${docType}?code=${accessCode}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${parcelle.nom}_${docType}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Document téléchargé');
      setShowDocOptions(false);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  // Handle email send
  const handleSendEmail = async () => {
    if (!emailAddress.trim() || !selectedDocument) return;
    setSendingEmail(true);
    try {
      await axios.post(`${API}/documents/send-email`, {
        code: accessCode,
        parcelle_id: parcelle.id,
        document_type: selectedDocument.type,
        email: emailAddress
      });
      toast.success('Email envoyé avec succès');
      setShowEmailForm(false);
      setShowDocOptions(false);
      setEmailAddress('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'envoi');
    }
    setSendingEmail(false);
  };

  if (!parcelle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[90vw] lg:max-w-[80vw] xl:max-w-[75vw] h-[90vh] p-0 bg-black/85 backdrop-blur-[20px] border border-white/10 rounded-3xl overflow-hidden"
        data-testid="parcelle-modal"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 px-8 py-5 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-white mb-1">
                {parcelle.nom}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-montserrat text-sm">{parcelle.type_projet}</span>
                <StatusBadge status={parcelle.statut} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
              data-testid="close-modal-btn"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Multi-Parcelle Navigation */}
          {isProprietaire && isMultiParcelle && (
            <MultiParcelleNav 
              parcelles={ownerParcelles}
              currentParcelleId={parcelle.id}
              onSelectParcelle={handleParcelleSwitch}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN - Administrative Info */}
            <div className="space-y-6">
              {/* Property Details Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="font-playfair text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  Informations Foncières
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-montserrat mb-1">
                      <Ruler className="w-4 h-4" />
                      Superficie
                    </div>
                    <p className="text-white font-playfair text-2xl font-bold">
                      {parcelle.superficie} <span className="text-base text-gray-400">{parcelle.unite_superficie || 'ha'}</span>
                    </p>
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-montserrat mb-1">
                      <Building className="w-4 h-4" />
                      Configuration
                    </div>
                    <p className="text-white font-montserrat text-lg font-semibold">
                      {parcelle.type_parcelle || 'Résidentiel'}
                    </p>
                  </div>
                  
                  {parcelle.reference_tf && (
                    <div className="bg-black/30 rounded-xl p-4 col-span-2">
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-montserrat mb-1">
                        <FileText className="w-4 h-4" />
                        Référence TF
                      </div>
                      <p className="text-amber-400 font-mono text-lg font-semibold">
                        {parcelle.reference_tf}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Details Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="font-playfair text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  Localisation
                </h3>
                
                <div className="space-y-3">
                  {parcelle.situation && (
                    <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                      <Mountain className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-gray-400 text-xs font-montserrat block mb-0.5">Situation</span>
                        <p className="text-white font-montserrat text-sm">{parcelle.situation}</p>
                      </div>
                    </div>
                  )}
                  
                  {parcelle.acces && (
                    <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                      <Leaf className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-gray-400 text-xs font-montserrat block mb-0.5">Accès</span>
                        <p className="text-white font-montserrat text-sm">{parcelle.acces}</p>
                      </div>
                    </div>
                  )}
                  
                  {parcelle.axe_principal && (
                    <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-gray-400 text-xs font-montserrat block mb-0.5">Axe Principal</span>
                        <p className="text-white font-montserrat text-sm">{parcelle.axe_principal}</p>
                      </div>
                    </div>
                  )}
                  
                  {parcelle.distance_ville && (
                    <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                      <TreePine className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-gray-400 text-xs font-montserrat block mb-0.5">Distance Abidjan</span>
                        <p className="text-white font-montserrat text-sm">{parcelle.distance_ville}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {parcelle.description && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="font-playfair text-xl font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300 font-montserrat text-sm leading-relaxed">
                    {parcelle.description}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Interactive Zone */}
            <div className="space-y-6">
              {/* Access / Documents Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {!isUnlocked ? (
                  /* LOCKED STATE - Glassmorphism Design */
                  <div className="relative p-8">
                    {/* Decorative Elements */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative text-center">
                      {/* Lock Icon */}
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl animate-pulse" />
                        <div className="absolute inset-2 bg-black/60 rounded-xl backdrop-blur-sm flex items-center justify-center">
                          <Lock className="w-10 h-10 text-amber-400" />
                        </div>
                      </div>
                      
                      <h3 className="font-playfair text-2xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent mb-2">
                        Documents Officiels Sécurisés
                      </h3>
                      <p className="font-montserrat text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                        L'accès aux documents ACD et plans cadastraux nécessite un code d'accès unique.
                      </p>

                      {!showRequestForm ? (
                        <div className="space-y-5">
                          <div className="flex gap-3 max-w-sm mx-auto">
                            <Input
                              value={accessCode}
                              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                              placeholder="CODE D'ACCÈS"
                              className="bg-white/5 border-white/20 text-white text-center font-mono tracking-[0.3em] placeholder:text-gray-600 focus:border-amber-500/50"
                              maxLength={8}
                              onKeyPress={(e) => e.key === 'Enter' && verifyCode()}
                              data-testid="access-code-input"
                            />
                            <Button 
                              onClick={verifyCode}
                              disabled={verifying}
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold px-6 shadow-lg shadow-amber-500/20"
                              data-testid="verify-code-btn"
                            >
                              {verifying ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Unlock className="w-5 h-5" />
                              )}
                            </Button>
                          </div>

                          <button 
                            onClick={() => setShowRequestForm(true)}
                            className="group inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 text-sm font-montserrat transition-all"
                            data-testid="request-access-btn"
                          >
                            <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                            <span>Pas de code ?</span>
                            <span className="font-semibold text-amber-400 group-hover:underline">Demander un accès</span>
                          </button>
                        </div>
                      ) : (
                        /* Request Form */
                        <div className="space-y-4 max-w-sm mx-auto">
                          <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
                            <User className="w-5 h-5" />
                            <span className="font-playfair font-semibold text-lg">Demande d'accès</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              value={requestForm.prenom}
                              onChange={(e) => setRequestForm({ ...requestForm, prenom: e.target.value })}
                              placeholder="Prénom"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                              data-testid="request-prenom"
                            />
                            <Input
                              value={requestForm.nom}
                              onChange={(e) => setRequestForm({ ...requestForm, nom: e.target.value })}
                              placeholder="Nom"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                              data-testid="request-nom"
                            />
                          </div>
                          
                          <div className="relative">
                            <Input
                              value={requestForm.whatsapp}
                              onChange={(e) => setRequestForm({ ...requestForm, whatsapp: e.target.value })}
                              placeholder="+225 07 00 00 00 00"
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-600 pl-10"
                              data-testid="request-whatsapp"
                            />
                            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                          </div>
                          
                          <div className="flex gap-3 pt-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowRequestForm(false)}
                              className="flex-1 border-white/20 text-gray-300 hover:bg-white/5"
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={handleCodeRequest}
                              disabled={submittingRequest}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold"
                              data-testid="submit-request-btn"
                            >
                              {submittingRequest ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Envoyer
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <p className="text-gray-500 text-xs font-montserrat">
                            Un conseiller vous contactera sous peu avec votre code d'accès.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* UNLOCKED STATE */
                  <div className="p-6 space-y-6">
                    {/* Profile Badge */}
                    <div className={`rounded-xl p-4 flex items-center gap-4 ${
                      isProprietaire 
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30' 
                        : 'bg-green-500/10 border border-green-500/20'
                    }`}>
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        isProprietaire ? 'bg-amber-500/20' : 'bg-green-500/20'
                      }`}>
                        <span className="text-3xl">{isProprietaire ? '👑' : '👤'}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-playfair text-lg font-semibold ${isProprietaire ? 'text-amber-400' : 'text-green-400'}`}>
                          {isProprietaire ? 'Propriétaire vérifié' : 'Accès Prospect'}
                        </p>
                        <p className="text-gray-400 text-sm font-montserrat">
                          {clientInfo?.client_name}
                          {isProprietaire 
                            ? ' • Accès permanent' 
                            : ` • ${profileInfo?.days_remaining ?? 0}j restant(s)`
                          }
                        </p>
                      </div>
                      <Shield className={`w-6 h-6 ${isProprietaire ? 'text-amber-400' : 'text-green-400'}`} />
                    </div>

                    {/* Documents List */}
                    <div>
                      <h4 className="font-playfair text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-400" />
                        Documents disponibles
                        {!isProprietaire && (
                          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs ml-2">
                            Avec filigrane
                          </Badge>
                        )}
                      </h4>
                      
                      {loadingDocs ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : availableDocuments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="font-montserrat">Aucun document disponible</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {availableDocuments.map((doc) => (
                            <button
                              key={doc.type}
                              onClick={() => {
                                setSelectedDocument(doc);
                                setShowDocOptions(true);
                              }}
                              className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 rounded-xl transition-all group text-left"
                              data-testid={`doc-${doc.type}`}
                            >
                              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-montserrat font-medium">{doc.label}</p>
                                <p className="text-gray-500 text-xs">
                                  {doc.count} fichier(s) • PDF
                                </p>
                              </div>
                              <Download className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Surveillance Section - PROPRIETAIRE ONLY */}
              {isUnlocked && isProprietaire && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="font-playfair text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-red-400" />
                    Surveillance en Direct
                    {hasCameraAccess && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 rounded-full ml-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 text-xs font-montserrat font-semibold">LIVE</span>
                      </div>
                    )}
                  </h3>
                  
                  {loadingVideo ? (
                    <div className="aspect-video bg-black/30 rounded-2xl flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : hasCameraAccess ? (
                    <VideoPlayer streamUrl={videoUrl} parcelleNom={parcelle.nom} />
                  ) : (
                    <div className="aspect-video bg-black/30 rounded-2xl flex items-center justify-center border border-white/5">
                      <div className="text-center">
                        <Video className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 font-montserrat">Caméra non activée pour cette parcelle</p>
                        <p className="text-gray-600 text-sm font-montserrat mt-1">Contactez l'administration</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-6">
                <h3 className="font-playfair text-lg font-semibold text-white mb-4">Besoin d'assistance ?</h3>
                <div className="flex gap-3">
                  <a
                    href="tel:+2250705509738"
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-white font-montserrat text-sm">WhatsApp</span>
                  </a>
                  <a
                    href="mailto:contact@songonextension.com"
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-white font-montserrat text-sm">Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Options Dialog */}
        <Dialog open={showDocOptions} onOpenChange={setShowDocOptions}>
          <DialogContent className="bg-[#0a0f0d] border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl text-white">
                {selectedDocument?.label}
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-montserrat">
                Comment souhaitez-vous recevoir ce document ?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 pt-4">
              {/* Download Option */}
              <button
                onClick={() => handleDownload(selectedDocument?.type)}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-montserrat font-medium">Télécharger</p>
                  <p className="text-gray-500 text-xs">PDF sur votre appareil</p>
                </div>
              </button>
              
              {/* Email Option */}
              {!showEmailForm ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-montserrat font-medium">Recevoir par email</p>
                    <p className="text-gray-500 text-xs">Envoi instantané</p>
                  </div>
                </button>
              ) : (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
                  <Input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="votre@email.com"
                    className="bg-white/5 border-white/20 text-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => { setShowEmailForm(false); setEmailAddress(''); }}
                      className="flex-1 border-white/20"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !emailAddress.trim()}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      {sendingEmail ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : 'Envoyer'}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* WhatsApp Option */}
              <a
                href={`https://wa.me/2250705509738?text=${encodeURIComponent(
                  `Bonjour, je suis ${clientInfo?.client_name || 'Client'}. Je souhaite recevoir le document "${selectedDocument?.label}" pour la parcelle "${parcelle?.nom}" (Réf: ${parcelle?.reference_tf || parcelle?.id}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-4 p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-montserrat font-medium">Demander via WhatsApp</p>
                  <p className="text-gray-500 text-xs">+225 07 05 50 97 38</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#25D366]" />
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ParcelleModal;
