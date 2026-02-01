# Songon Extension - PRD (Product Requirements Document)

## Énoncé du Problème Original
Développer l'application web Songon Extension (extension de onegreendev.com) intégrant un Masterplan dynamique basé sur un fichier KMZ pour la vente de terrains à Songon M'Braté, Côte d'Ivoire.

## Choix Utilisateur
- Authentification: JWT simple (admin/songon2024)
- Thème: Mode "Nature" (dark avec accents verts)
- Stockage: Fichier JSON local
- Upload d'images: Oui
- Multi-langue: Bilingue FR/EN

## Architecture

### Stack Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Framer Motion
- **Mapping**: react-leaflet (Leaflet.js) + togeojson
- **Backend**: FastAPI (Python)
- **Base de données**: Fichier JSON (parcelles.json)
- **Auth**: JWT (PyJWT)

### Structure des Fichiers Clés
```
/app/
├── backend/
│   ├── server.py           # API FastAPI
│   ├── data/
│   │   └── parcelles.json  # Données des 9 parcelles
│   └── uploads/            # Images uploadées
├── frontend/src/
│   ├── pages/
│   │   ├── HomePage.js     # Page d'accueil
│   │   ├── MasterplanPage.js # Carte interactive
│   │   ├── ContactPage.js  # Formulaire de contact
│   │   ├── LoginPage.js    # Connexion admin
│   │   └── AdminPage.js    # Dashboard admin
│   ├── components/
│   │   ├── MasterplanMap.js # Carte Leaflet
│   │   ├── ParcelleDetail.js # Fiche parcelle
│   │   ├── Navbar.js       # Navigation
│   │   └── Footer.js       # Pied de page
│   └── contexts/
│       ├── LanguageContext.js # i18n FR/EN
│       └── AuthContext.js     # Gestion auth
```

## User Personas
1. **Investisseur immobilier** - Consulte le masterplan, compare les parcelles
2. **Administrateur OGD** - Gère les statuts et données des parcelles
3. **Acheteur potentiel** - Recherche des terrains par type/statut

## Exigences Principales (Implémentées ✅)

### Page Publique
- ✅ Page d'accueil avec hero section et statistiques
- ✅ Masterplan interactif avec carte Leaflet
- ✅ 9 parcelles extraites du fichier KMZ
- ✅ Couleurs par statut (vert=disponible, orange=option, rouge=vendu)
- ✅ Tooltips au survol avec prix au m²
- ✅ Fiche détaillée complète avec onglets (Info, Terrain, Prix, Photos)
- ✅ Filtre par statut
- ✅ Switcher de langue FR/EN
- ✅ Page de contact avec formulaire

### Dashboard Admin
- ✅ Authentification JWT
- ✅ Tableau de bord avec statistiques
- ✅ Liste des parcelles avec recherche
- ✅ Modification du statut en temps réel
- ✅ Édition des données parcelles
- ✅ Upload d'images (photos + drone)
- ✅ Import KMZ

## Ce qui a été implémenté (01/02/2026)
- Application complète avec toutes les fonctionnalités demandées
- 9 parcelles TF 223737-223745 avec données complètes
- Design "Nature" harmonisé avec onegreendev.com
- Typographies: Playfair Display + Montserrat
- API REST complète avec endpoints CRUD
- Tests passés à 94%

## Backlog Prioritaire

### P0 (Critique)
- (Aucun - toutes les fonctionnalités critiques sont implémentées)

### P1 (Important)
- Envoi réel d'emails depuis le formulaire de contact
- Notifications en temps réel (WebSocket) pour les mises à jour de statut
- Export PDF des fiches parcelles

### P2 (Nice to have)
- Recherche avancée avec filtres multiples
- Comparateur de parcelles
- Mode impression des fiches
- Historique des modifications (audit log)

## Prochaines Actions
1. Intégrer un service d'email (SendGrid/Resend) pour le formulaire de contact
2. Ajouter des images réelles aux parcelles via le dashboard admin
3. Déployer l'application en production
