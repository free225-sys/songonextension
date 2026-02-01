import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Navigation
    nav_home: 'Accueil',
    nav_masterplan: 'Masterplan',
    nav_contact: 'Contact',
    nav_admin: 'Administration',
    nav_login: 'Connexion',
    nav_logout: 'Déconnexion',
    
    // Hero Section
    hero_title: 'Songon Extension',
    hero_subtitle: 'Investissez dans l\'avenir du territoire',
    hero_description: 'Découvrez nos terrains d\'exception à Songon M\'Braté, au cœur d\'un projet de développement unique en Côte d\'Ivoire.',
    hero_cta: 'Explorer le Masterplan',
    hero_cta_secondary: 'Nous contacter',
    
    // Stats
    stats_parcelles: 'Parcelles',
    stats_hectares: 'Hectares',
    stats_disponible: 'Disponibles',
    stats_valorises: 'Valorisés',
    
    // Status
    status_disponible: 'Disponible',
    status_option: 'Sous option',
    status_vendu: 'Vendu',
    
    // Masterplan
    masterplan_title: 'Masterplan Songon',
    masterplan_subtitle: 'Sélectionnez une parcelle pour découvrir ses caractéristiques',
    masterplan_legend: 'Légende',
    masterplan_filter: 'Filtrer par statut',
    masterplan_all: 'Tous',
    
    // Parcel Details
    detail_identification: 'Identification',
    detail_localisation: 'Localisation',
    detail_caracteristiques: 'Caractéristiques',
    detail_situation_fonciere: 'Situation Foncière',
    detail_potentiel: 'Potentiel & Usages',
    detail_prix: 'Prix & Conditions',
    detail_etat: 'État d\'avancement',
    detail_galerie: 'Galerie',
    detail_contact: 'Contact',
    
    // Fields
    field_nom: 'Nom du site',
    field_type: 'Type de projet',
    field_statut_acd: 'Statut ACD',
    field_reference_acd: 'Référence ACD',
    field_proprietaire: 'Propriétaire',
    field_commune: 'Commune',
    field_region: 'Région',
    field_situation_geo: 'Situation géographique',
    field_acces: 'Accès',
    field_axe: 'Axe principal',
    field_distance: 'Distance ville',
    field_superficie: 'Superficie',
    field_configuration: 'Configuration',
    field_environnement: 'Environnement',
    field_occupation: 'Occupation actuelle',
    field_statut_foncier: 'Statut foncier',
    field_documents: 'Documents disponibles',
    field_usages: 'Usages possibles',
    field_atouts: 'Atouts clés',
    field_positionnement: 'Positionnement',
    field_prix_m2: 'Prix au m²',
    field_valeur_globale: 'Valeur globale',
    field_modalites: 'Modalités',
    field_situation_actuelle: 'Situation actuelle',
    field_prochaines_etapes: 'Prochaines étapes',
    
    // Actions
    action_download: 'Télécharger',
    action_contact: 'Contacter',
    action_close: 'Fermer',
    action_save: 'Enregistrer',
    action_cancel: 'Annuler',
    action_delete: 'Supprimer',
    action_edit: 'Modifier',
    action_upload: 'Téléverser',
    action_import: 'Importer',
    
    // Admin
    admin_dashboard: 'Tableau de bord',
    admin_parcelles: 'Gestion Parcelles',
    admin_kmz: 'Import KMZ',
    admin_settings: 'Paramètres',
    admin_upload_kmz: 'Téléverser un fichier KMZ',
    admin_drag_drop: 'Glissez-déposez votre fichier ici ou cliquez pour sélectionner',
    admin_detected: 'parcelle(s) détectée(s)',
    
    // Login
    login_title: 'Connexion Administration',
    login_username: 'Nom d\'utilisateur',
    login_password: 'Mot de passe',
    login_submit: 'Se connecter',
    login_error: 'Identifiants invalides',
    
    // Footer
    footer_rights: 'Tous droits réservés',
    footer_powered: 'Propulsé par',
    
    // Messages
    msg_loading: 'Chargement...',
    msg_error: 'Une erreur est survenue',
    msg_success: 'Opération réussie',
    msg_no_data: 'Aucune donnée disponible',
    msg_confirm_delete: 'Êtes-vous sûr de vouloir supprimer ?',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_masterplan: 'Masterplan',
    nav_contact: 'Contact',
    nav_admin: 'Administration',
    nav_login: 'Login',
    nav_logout: 'Logout',
    
    // Hero Section
    hero_title: 'Songon Extension',
    hero_subtitle: 'Invest in the future of the territory',
    hero_description: 'Discover our exceptional plots in Songon M\'Braté, at the heart of a unique development project in Côte d\'Ivoire.',
    hero_cta: 'Explore Masterplan',
    hero_cta_secondary: 'Contact Us',
    
    // Stats
    stats_parcelles: 'Plots',
    stats_hectares: 'Hectares',
    stats_disponible: 'Available',
    stats_valorises: 'Developed',
    
    // Status
    status_disponible: 'Available',
    status_option: 'Under Option',
    status_vendu: 'Sold',
    
    // Masterplan
    masterplan_title: 'Songon Masterplan',
    masterplan_subtitle: 'Select a plot to discover its characteristics',
    masterplan_legend: 'Legend',
    masterplan_filter: 'Filter by status',
    masterplan_all: 'All',
    
    // Parcel Details
    detail_identification: 'Identification',
    detail_localisation: 'Location',
    detail_caracteristiques: 'Characteristics',
    detail_situation_fonciere: 'Land Status',
    detail_potentiel: 'Potential & Uses',
    detail_prix: 'Price & Terms',
    detail_etat: 'Progress Status',
    detail_galerie: 'Gallery',
    detail_contact: 'Contact',
    
    // Fields
    field_nom: 'Site Name',
    field_type: 'Project Type',
    field_statut_acd: 'ACD Status',
    field_reference_acd: 'ACD Reference',
    field_proprietaire: 'Owner',
    field_commune: 'Municipality',
    field_region: 'Region',
    field_situation_geo: 'Geographic Location',
    field_acces: 'Access',
    field_axe: 'Main Road',
    field_distance: 'City Distance',
    field_superficie: 'Area',
    field_configuration: 'Configuration',
    field_environnement: 'Environment',
    field_occupation: 'Current Occupation',
    field_statut_foncier: 'Land Status',
    field_documents: 'Available Documents',
    field_usages: 'Possible Uses',
    field_atouts: 'Key Assets',
    field_positionnement: 'Positioning',
    field_prix_m2: 'Price per m²',
    field_valeur_globale: 'Total Value',
    field_modalites: 'Terms',
    field_situation_actuelle: 'Current Status',
    field_prochaines_etapes: 'Next Steps',
    
    // Actions
    action_download: 'Download',
    action_contact: 'Contact',
    action_close: 'Close',
    action_save: 'Save',
    action_cancel: 'Cancel',
    action_delete: 'Delete',
    action_edit: 'Edit',
    action_upload: 'Upload',
    action_import: 'Import',
    
    // Admin
    admin_dashboard: 'Dashboard',
    admin_parcelles: 'Plot Management',
    admin_kmz: 'KMZ Import',
    admin_settings: 'Settings',
    admin_upload_kmz: 'Upload a KMZ file',
    admin_drag_drop: 'Drag and drop your file here or click to select',
    admin_detected: 'plot(s) detected',
    
    // Login
    login_title: 'Admin Login',
    login_username: 'Username',
    login_password: 'Password',
    login_submit: 'Login',
    login_error: 'Invalid credentials',
    
    // Footer
    footer_rights: 'All rights reserved',
    footer_powered: 'Powered by',
    
    // Messages
    msg_loading: 'Loading...',
    msg_error: 'An error occurred',
    msg_success: 'Operation successful',
    msg_no_data: 'No data available',
    msg_confirm_delete: 'Are you sure you want to delete?',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('songon_language');
    return saved || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('songon_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
