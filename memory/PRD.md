# Songon Extension - PRD (Product Requirements Document)

## Énoncé du Problème Original
Développer l'application web Songon Extension (anciennement extension de onegreendev.com, maintenant **songonextension.com**) intégrant un Masterplan dynamique basé sur un fichier KMZ pour la vente de terrains à Songon M'Braté, Côte d'Ivoire.

## Domaine Officiel
**URL** : https://songonextension.com
**Email** : contact@songonextension.com

## Système de Profils

### PROSPECT (👤)
- Accès limité à **3 jours maximum**
- Documents avec **filigrane de sécurité**
- Pas d'accès à la surveillance vidéo
- Message d'expiration incitant à l'achat

### PROPRIÉTAIRE (👑)  
- Accès **permanent** (validité illimitée)
- Documents **originaux sans filigrane**
- Accès **surveillance vidéo** en direct (si activé)
- Caméras ENSTER/EseeCloud supportées (HLS, RTSP)

## Choix Utilisateur
- Authentification: JWT simple (admin/admin via .env)
- Thème: Mode "Nature" + **Thème Clair Prestigieux pour Masterplan**
- Stockage: Fichier JSON local
- Upload d'images: Oui
- Multi-langue: Bilingue FR/EN
- Sécurité documents: **Codes d'accès + Watermarking dynamique + Journal temps réel**
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
- **PDF Watermark**: PyPDF2 + ReportLab
- **Email**: Resend SDK

### Système d'Accès aux Documents (ACD)
```
Tunnel d'accès:
1. Documents bloqués par défaut (icône cadenas)
2. Visiteur entre son code d'accès
3. Vérification API → Déverrouillage
4. Choix: Visualiser | Télécharger | Email/WhatsApp
5. PDF généré avec filigrane: "Préparé pour [Client] | Document sécurisé par onegreendev"
6. Accès journalisé en temps réel dans download_logs
```

## Ce qui a été implémenté

### Version 2.0.0 - Système de Profils & Surveillance Vidéo (08/02/2026)
- **Gestion des profils**: PROSPECT (accès 3j, filigrane) et PROPRIETAIRE (permanent, originaux)
- **Interface Admin améliorée**:
  - Sélecteur visuel de profil (cartes interactives)
  - Toggle pour activer l'accès caméra
  - Champ URL flux vidéo (HLS/RTSP)
  - Statistiques par profil (Prospects/Propriétaires)
  - Colonne "Caméra" dans le tableau des codes
- **Surveillance en Direct** (PROPRIETAIRE uniquement):
  - Bouton "Surveillance en Direct" élégant (Playfair Display)
  - Lecteur vidéo intégré avec contrôles Play/Pause/Mute
  - Badge "LIVE" animé
  - URL caméra sécurisée (non visible dans le code source)
- **Logique d'affichage dynamique**:
  - Vue PROSPECT: Documents avec filigrane, sans bouton surveillance
  - Vue PROPRIETAIRE: Documents originaux, accès caméra si activé
- **Endpoints API ajoutés**:
  - `POST /api/documents/verify-profile` - Vérification profil avec infos complètes
  - `POST /api/surveillance/access` - Accès sécurisé à la caméra (PROPRIETAIRE only)
  - `PUT /api/admin/access-codes/{id}` - Mise à jour des paramètres vidéo

### Version 1.8.0 - Correction Formulaires Admin (04/02/2026)
- **Correction z-index Select**: Les dropdowns des composants Select s'affichent maintenant correctement au-dessus des Dialog (z-[1200])
- **Valeurs par défaut formulaire**: Ajout de valeurs par défaut pour éviter les erreurs undefined
- **Amélioration UX formulaire**:
  - Labels plus explicites ("Type de parcelle", "Superficie (ha)")
  - Placeholders dans les Select
  - Message d'aide dans l'onglet Prix
  - Nouvelles options (Commercial, Mixte pour configuration)
- **Data-testid ajoutés**: Meilleure testabilité des formulaires
- **Changement de domaine**: Migration de onegreendev.com vers songonextension.com

### Version 1.7.0 - Phase Finale Sécurisation (04/02/2026)
- **Filigrane amélioré**: Nouveau format "Préparé pour [Client] | Document sécurisé par onegreendev" en diagonale avec opacité légère
- **Notifications Admin temps réel**: Badge rouge animé sur l'onglet Journal dans la sidebar
- **Journal d'accès amélioré**: Section "Activité récente" avec temps relatif ("Il y a X min")
- **Multi-documents par parcelle**: Support pour uploader plusieurs fichiers PDF par type de document
- **Interface adaptative**: Affichage automatique selon le nombre de documents disponibles
- **Polling automatique**: Actualisation des notifications toutes les 30 secondes

### Version 1.6.0 - Intégration Email Resend (04/02/2026)
- **Envoi automatique d'emails**: Les documents PDF filigranés peuvent être envoyés par email via Resend
- **Template email professionnel**: Email HTML responsive avec design Songon Extension
- **Pièce jointe PDF**: Document filigrané envoyé automatiquement en pièce jointe
- **Service email_service.py**: Module dédié pour l'envoi d'emails avec Resend SDK
- **Variables d'environnement**: `RESEND_API_KEY`, `SENDER_EMAIL` configurées

### Version 1.5.0 - Système Complet Documents ACD (03/02/2026)
- **Tunnel d'accès sécurisé**: Documents bloqués par défaut, code requis
- **Watermarking dynamique**: Filigrane avec nom du client sur chaque page PDF
- **Options de réception**: Visualiser, Télécharger, Email, WhatsApp
- **Backend PDF**: Génération de documents placeholder avec filigrane (PyPDF2 + ReportLab)
- **Dashboard Admin amélioré**: Colonne "Docs consultés" avec détails par code

### Version 1.4.0 - Dashboard Admin Modernisé + Export
- Accès admin caché: Double-clic sur le logo
- Dashboard modernisé: Design glassmorphism
- Export PDF/Excel des parcelles

### Version 1.3.0 - Nettoyage UI
- Suppression section statistiques et formulaire contact
- UI simplifiée

## Endpoints API Documents

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/documents/verify-code` | POST | Vérifie un code d'accès |
| `/api/documents/{parcelle_id}/{type}` | GET | Récupère document avec watermark |
| `/api/documents/send` | POST | Envoie document par email/WhatsApp |
| `/api/admin/download-logs` | GET | Journal des téléchargements |
| `/api/admin/notifications` | GET | Notifications temps réel (NEW) |
| `/api/admin/access-logs/realtime` | GET | Logs enrichis avec temps relatif (NEW) |

## Backlog Prioritaire

### P0 (Critique)
- ✅ Intégration Resend pour envoi automatique d'emails
- ✅ Filigrane avec branding onegreendev
- ✅ Notifications Admin temps réel
- ✅ Multi-documents par parcelle

### P1 (Important)
- Vérifier un domaine personnalisé sur Resend pour envoyer à tous les destinataires

### P2 (Nice to have)
- QR Code sur documents pour vérification
- Migration vers MongoDB/PostgreSQL
- Notifications push navigateur

## Credentials Test
- **Admin**: `admin` / `admin`
- **Code test**: Générer via Dashboard Admin → Codes d'accès
- **Email Resend**: Configuré mais limité à l'email du compte en mode test
