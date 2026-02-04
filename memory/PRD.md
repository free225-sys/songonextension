# Songon Extension - PRD (Product Requirements Document)

## Énoncé du Problème Original
Développer l'application web Songon Extension (extension de onegreendev.com) intégrant un Masterplan dynamique basé sur un fichier KMZ pour la vente de terrains à Songon M'Braté, Côte d'Ivoire.

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

### P2 (Nice to have)
- QR Code sur documents pour vérification
- Migration vers MongoDB/PostgreSQL
- Notifications push admin

## Credentials Test
- **Admin**: `admin` / `admin`
- **Code test**: Générer via Dashboard Admin → Codes d'accès
