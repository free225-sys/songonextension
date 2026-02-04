# Songon Extension - PRD (Product Requirements Document)

## Énoncé du Problème Original
Développer l'application web Songon Extension (extension de onegreendev.com) intégrant un Masterplan dynamique basé sur un fichier KMZ pour la vente de terrains à Songon M'Braté, Côte d'Ivoire.

## Choix Utilisateur
- Authentification: JWT simple (admin/admin via .env)
- Thème: Mode "Nature" + **Thème Clair Prestigieux pour Masterplan**
- Stockage: Fichier JSON local
- Upload d'images: Oui
- Multi-langue: Bilingue FR/EN
- Sécurité documents: **Codes d'accès + Watermarking dynamique + Journal**
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

### Système d'Accès aux Documents (ACD)
```
Tunnel d'accès:
1. Documents bloqués par défaut (icône cadenas)
2. Visiteur entre son code d'accès
3. Vérification API → Déverrouillage
4. Choix: Visualiser | Télécharger | Email/WhatsApp
5. PDF généré avec filigrane dynamique (nom client + code + date)
6. Accès journalisé dans download_logs
```

## Ce qui a été implémenté

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

## Backlog Prioritaire

### P0 (Critique)
- (Terminé)

### P1 (Important)
- Intégration vraie email (SendGrid/Resend) pour envoi automatique
- Intégration WhatsApp Business API
- Vrais documents PDF uploadés (remplacer placeholders)

### P2 (Nice to have)
- QR Code sur documents pour vérification
- Système de demande d'accès public
- Notifications push admin

## Credentials Test
- **Admin**: `admin` / `admin`
- **Code test**: Générer via Dashboard Admin → Codes d'accès
