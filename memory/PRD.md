# Songon Extension - PRD (Product Requirements Document)

## Énoncé du Problème Original
Développer l'application web Songon Extension (extension de onegreendev.com) intégrant un Masterplan dynamique basé sur un fichier KMZ pour la vente de terrains à Songon M'Braté, Côte d'Ivoire.

## Choix Utilisateur
- Authentification: JWT simple (admin/admin via .env)
- Thème: Mode "Nature" + **Thème Clair Prestigieux pour Masterplan**
- Stockage: Fichier JSON local
- Upload d'images: Oui
- Multi-langue: Bilingue FR/EN
- Sécurité documents: Codes d'accès + Watermarking + Journal
- **Architecture: ONE-PAGE avec navigation fluide par ancres**
- **Accès admin: CACHÉ (double-clic logo)**

## Architecture

### Stack Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Framer Motion
- **Mapping**: react-leaflet (Leaflet.js) + CartoDB Light tiles
- **Backend**: FastAPI (Python)
- **Base de données**: Fichier JSON (parcelles.json)
- **Auth**: JWT (PyJWT)
- **Export**: jsPDF + jspdf-autotable + xlsx + file-saver

### Structure One-Page
```
HomePage.js contient:
├── Section #accueil   → Hero + Stats Bar
├── Section Why Invest → Features (dark theme)
├── Section #masterplan → Filtres + Carte interactive (light theme)
├── Section #contact   → Coordonnées uniquement (dark theme)
└── Footer             → Liens + Copyright
```

### Accès Admin (Secret)
- Double-clic sur le logo → Modal de connexion
- Pas de lien visible dans la navigation
- Identifiants stockés dans .env (ADMIN_USERNAME, ADMIN_PASSWORD)

## Ce qui a été implémenté

### Version 1.4.0 - Dashboard Admin Modernisé + Export (03/02/2026)
- **Accès admin caché**: Double-clic sur le logo ouvre un modal de connexion
- **Dashboard modernisé**: Design glassmorphism avec cartes statistiques animées
- **Export PDF**: Rapport professionnel avec en-tête Songon Extension
- **Export Excel**: Fichier .xlsx avec toutes les données des parcelles
- **Sidebar élégante**: Navigation admin avec animations
- **Page login nettoyée**: Suppression des identifiants demo visibles

### Version 1.3.0 - Nettoyage UI (03/02/2026)
- Suppression de la section Quick Stats (4 cartes) dans Masterplan
- Suppression du formulaire de contact
- Conservation des coordonnées uniquement (centrées et élégantes)

### Version 1.2.0 - Architecture One-Page
- Transformation complète en Single Page Application
- Navigation fluide avec ancres internes
- Lazy loading de la carte (optimisation scroll)

## Backlog Prioritaire

### P0 (Critique)
- (Aucun - toutes les fonctionnalités critiques sont implémentées)

### P1 (Important)
- Envoi d'emails avec codes d'accès
- PDF watermarkés côté serveur
- Notifications en temps réel

### P2 (Nice to have)
- Mode offline avec Service Worker
- Export PDF des fiches parcelles individuelles
- Animations parallax avancées

## Note Importante
Le badge "Made with Emergent" est masqué via CSS mais reste présent dans le DOM (injecté par la plateforme). En déploiement sur serveur personnel, il ne sera pas présent.

## Prochaines Actions
1. Tester les exports PDF/Excel
2. Intégrer un service d'email pour envoyer les codes
3. Déployer en production
