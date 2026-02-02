# Songon Extension - PRD (Product Requirements Document)

## Énoncé du Problème Original
Développer l'application web Songon Extension (extension de onegreendev.com) intégrant un Masterplan dynamique basé sur un fichier KMZ pour la vente de terrains à Songon M'Braté, Côte d'Ivoire.

## Choix Utilisateur
- Authentification: JWT simple (admin/songon2024)
- Thème: Mode "Nature" (dark avec accents verts) + **Thème Clair Prestigieux pour le Masterplan**
- Stockage: Fichier JSON local
- Upload d'images: Oui
- Multi-langue: Bilingue FR/EN
- **Sécurité documents: Codes d'accès + Watermarking + Journal des téléchargements**

## Architecture

### Stack Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Framer Motion
- **Mapping**: react-leaflet (Leaflet.js) + CartoDB Light tiles (thème clair)
- **Backend**: FastAPI (Python)
- **Base de données**: Fichier JSON (parcelles.json)
- **Auth**: JWT (PyJWT)

### Structure des Fichiers Clés
```
/app/
├── backend/
│   ├── server.py           # API FastAPI v1.1.0
│   ├── data/
│   │   └── parcelles.json  # Données des parcelles + codes d'accès + logs
│   └── uploads/            # Images uploadées
├── frontend/src/
│   ├── pages/
│   │   ├── HomePage.js     # Page d'accueil (dark theme)
│   │   ├── MasterplanPage.js # Carte interactive (LIGHT THEME)
│   │   ├── ContactPage.js  # Formulaire de contact
│   │   ├── LoginPage.js    # Connexion admin
│   │   └── AdminPage.js    # Dashboard admin + gestion codes
│   ├── components/
│   │   ├── MasterplanMap.js # Carte Leaflet (light tiles)
│   │   ├── ParcelleDetail.js # Fiche parcelle + sécurité docs
│   │   ├── Navbar.js       # Navigation
│   │   └── Footer.js       # Pied de page
│   └── contexts/
│       ├── LanguageContext.js # i18n FR/EN
│       └── AuthContext.js     # Gestion auth
```

## User Personas
1. **Investisseur immobilier** - Consulte le masterplan, demande accès documents
2. **Administrateur OGD** - Gère les statuts, génère codes d'accès, consulte logs
3. **Acheteur potentiel** - Recherche des terrains par type/statut

## Exigences Principales

### Page Publique ✅
- ✅ Page d'accueil avec hero section et statistiques
- ✅ Masterplan interactif avec carte Leaflet
- ✅ **Thème clair prestigieux** (CartoDB Light tiles, couleurs pastel)
- ✅ 9 parcelles extraites du fichier KMZ
- ✅ Couleurs par statut (vert=disponible, orange=option, rouge=vendu)
- ✅ Tooltips au survol avec prix au m²
- ✅ Fiche détaillée complète avec onglets
- ✅ Filtre par statut
- ✅ Switcher de langue FR/EN
- ✅ Page de contact avec formulaire

### Sécurité Documents ✅ (NOUVEAU)
- ✅ Section "Documents Sécurisés" avec cadenas
- ✅ Champ de saisie code d'accès
- ✅ Vérification API du code
- ✅ Avertissement légal avant téléchargement
- ✅ Watermarking numérique (nom client + code)
- ✅ Journalisation des téléchargements

### Dashboard Admin ✅
- ✅ Authentification JWT
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des parcelles (CRUD)
- ✅ Modification du statut en temps réel
- ✅ Upload d'images
- ✅ Import KMZ
- ✅ **Gestion des codes d'accès** (génération, révocation)
- ✅ **Journal des téléchargements** (traçabilité)

## Ce qui a été implémenté (02/02/2026)

### Version 1.1.0
- Système complet de codes d'accès temporaires
- Watermarking dynamique des documents
- Journal des téléchargements avec statistiques
- Thème clair prestigieux pour le Masterplan
- CartoDB Light tiles pour carte élégante
- Couleurs pastel pour les parcelles

### API Endpoints Ajoutés
- `POST /api/documents/verify-code` - Vérification code
- `GET /api/documents/{parcelle_id}/{doc_type}?code=X` - Accès document + watermark
- `POST /api/admin/access-codes` - Création code
- `GET /api/admin/access-codes` - Liste des codes
- `DELETE /api/admin/access-codes/{id}` - Révocation
- `GET /api/admin/download-logs` - Journal
- `GET /api/admin/download-logs/stats` - Statistiques

## Backlog Prioritaire

### P0 (Critique)
- (Aucun - toutes les fonctionnalités critiques sont implémentées)

### P1 (Important)
- Envoi d'emails avec le code d'accès généré
- Génération réelle de PDF avec watermark intégré
- Notifications en temps réel (WebSocket)

### P2 (Nice to have)
- Export PDF des fiches parcelles
- Recherche avancée avec filtres multiples
- Comparateur de parcelles
- Historique des modifications (audit log)

## Prochaines Actions
1. Intégrer un service d'email pour envoyer les codes aux clients
2. Générer des PDF watermarkés côté serveur (ReportLab/WeasyPrint)
3. Déployer l'application en production
