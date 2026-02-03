# Songon Extension - PRD (Product Requirements Document)

## Énoncé du Problème Original
Développer l'application web Songon Extension (extension de onegreendev.com) intégrant un Masterplan dynamique basé sur un fichier KMZ pour la vente de terrains à Songon M'Braté, Côte d'Ivoire.

## Choix Utilisateur
- Authentification: JWT simple (admin/songon2024)
- Thème: Mode "Nature" + **Thème Clair Prestigieux pour Masterplan**
- Stockage: Fichier JSON local
- Upload d'images: Oui
- Multi-langue: Bilingue FR/EN
- Sécurité documents: Codes d'accès + Watermarking + Journal
- **Architecture: ONE-PAGE avec navigation fluide par ancres**

## Architecture

### Stack Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Framer Motion
- **Mapping**: react-leaflet (Leaflet.js) + CartoDB Light tiles
- **Backend**: FastAPI (Python)
- **Base de données**: Fichier JSON (parcelles.json)
- **Auth**: JWT (PyJWT)

### Structure One-Page
```
HomePage.js contient:
├── Section #accueil   → Hero + Stats
├── Section Why Invest → Features (dark theme)
├── Section #masterplan → Carte interactive (light theme)
├── Section #contact   → Formulaire + Coordonnées (dark theme)
└── Footer             → Liens + Copyright
```

### Navigation
- Navbar fixe avec ancres internes
- Scroll fluide (smooth scrolling)
- Intersection Observer pour section active
- Lazy loading de la carte (optimisation)

## Exigences Principales

### Architecture One-Page ✅
- ✅ Toutes sections fusionnées sur une page
- ✅ Navigation par ancres avec scroll fluide
- ✅ Intersection Observer pour surlignage menu
- ✅ Lazy loading du Masterplan (performance)
- ✅ Redirections /masterplan → /#masterplan

### Design ✅
- ✅ Hero section avec fond image + overlay
- ✅ Section Masterplan en thème clair prestigieux
- ✅ CartoDB Light tiles pour carte élégante
- ✅ Typographies: Playfair Display (titres), Montserrat (reste)
- ✅ Badge "Made with Emergent" retiré du footer personnalisé

### Fonctionnalités ✅
- ✅ Carte interactive avec parcelles colorées
- ✅ Fiche détaillée en sidebar
- ✅ Formulaire de contact fonctionnel
- ✅ Système codes d'accès documents
- ✅ Dashboard admin complet

## Ce qui a été implémenté (03/02/2026)

### Version 1.2.0 - Architecture One-Page
- Transformation complète en Single Page Application
- Navigation fluide avec ancres internes
- Lazy loading de la carte (optimisation scroll)
- Intersection Observer pour section active
- Redirections des anciennes routes

### Typographie
- Playfair Display: Titres principaux uniquement
- Montserrat: Tout le reste (labels, textes, boutons)

### Tests: 95-100% réussite

## Backlog Prioritaire

### P0 (Critique)
- (Aucun - toutes les fonctionnalités critiques sont implémentées)

### P1 (Important)
- Envoi d'emails avec codes d'accès
- PDF watermarkés côté serveur
- Notifications en temps réel

### P2 (Nice to have)
- Mode offline avec Service Worker
- Export PDF des fiches parcelles
- Animations de transition entre sections

## Prochaines Actions
1. Intégrer un service d'email pour envoyer les codes
2. Ajouter des photos réelles aux parcelles
3. Déployer en production
