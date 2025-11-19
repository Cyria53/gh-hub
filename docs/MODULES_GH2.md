# Modules GH₂

## V1 - Modules Fonctionnels (Actuels)

### 🟦 Diagnostic IA
**Status**: ✅ Structure en place, API IA à connecter

**Fonctionnalités**:
- Upload photo voyant moteur
- Upload vidéo moteur (optionnel)
- OCR carte grise automatique
- Analyse IA des symptômes
- Estimation coût réparation
- Génération rapport PDF
- Support mode invité

**Routes**:
- `/guest/diagnostic` - Mode invité
- `/dashboard/diagnostic` - Mode authentifié

**Tables**: `diagnostics`, `carte_grise_scans`

**API Externe**: À intégrer (OCR + diagnostic IA)

---

### 🟩 Missions Techniciens (Uber-like)
**Status**: ✅ Structure en place, tracking GPS à implémenter

**Fonctionnalités**:
- Création mission depuis diagnostic
- Acceptation mission par technicien
- Tracking GPS temps réel (Supabase Realtime)
- Statuts technicien (available/busy/offline)
- Rapport intervention avec photos
- Signature client
- Rating technicien

**Routes**:
- `/tech/missions` - Dashboard technicien
- `/dashboard/missions` - Suivi client

**Tables**: `missions`, `technicians`, `horaires_tech`

**Technologie**: Supabase Realtime pour GPS

---

### 🟨 Marketplace
**Status**: ✅ Structure en place, Stripe à connecter

**Catégories V1**:
- Véhicules d'occasion
- Accessoires essentiels
- Kits HHO

**Fonctionnalités**:
- Catalogue produits
- Panier
- Paiement Stripe
- Suivi commande
- Historique achats

**Routes**:
- `/marketplace` - Catalogue
- `/marketplace/cart` - Panier
- `/marketplace/orders` - Commandes

**Tables**: `marketplace_items`, `marketplace_orders`, `paiements`

**Intégration**: Stripe Payment Intents

---

### 🟫 Module RH
**Status**: ✅ V1 fonctionnel

**Fonctionnalités V1**:
- Pointage entrée/sortie
- Calcul heures travaillées
- Heures facturables
- Export paie (CSV)

**Routes**:
- `/rh/pointage` - Interface pointage
- `/rh/export` - Export données

**Tables**: `pointage`

---

### 🟦 Programme Fidélité
**Status**: ✅ Structure en place

**Fonctionnalités**:
- Points par intervention
- Tiers (Bronze, Silver, Gold, Platinum)
- Récompenses
- Historique points

**Routes**:
- `/dashboard/loyalty` - Dashboard fidélité

**Tables**: `fidelite`

---

## V2 - Modules Structurés (Désactivés)

### 🟧 Module Atelier
**Status**: 🔒 Structure créée, désactivé

**Fonctionnalités Prévues**:
- Gestion devis atelier
- Ordres de réparation
- Factures atelier
- Catalogue pièces
- Stock agence
- Planning atelier

**Tables Créées**: `atelier_devis`, `atelier_or`, `atelier_factures`, `pieces_catalogue`, `stock_agence`

---

### 🟪 Services Mobiles Avancés
**Status**: 🔒 V2

**Fonctionnalités Prévues**:
- Planning techniciens optimisé
- Routing intelligent
- Notifications push
- Chat client-technicien

---

### 🟫 Multi-agences
**Status**: 🔒 V2

**Fonctionnalités Prévues**:
- Gestion plusieurs agences
- Transfert techniciens
- KPI par agence
- Consolidation reporting

**Tables**: `agencies` (déjà créée)

---

## V3 - Modules Futurs

### 🟫 Franchiseur GH₂
**Status**: 🔒 V3

**Fonctionnalités Prévues**:
- Plateforme franchiseur
- Tableaux de bord réseau
- Formation franchisés
- Redevances automatiques

---

### 🟧 Automatisations n8n
**Status**: 🔒 V2/V3

**Intégrations Prévues**:
- Workflows automatiques
- Notifications multi-canal
- Synchronisation CRM
- Webhooks externes

---

## Feature Flags

Les modules V2/V3 sont désactivés via feature flags:

```typescript
const FEATURES = {
  diagnostic: true,        // V1
  missions: true,          // V1
  marketplace: true,       // V1
  rh: true,               // V1
  loyalty: true,          // V1
  atelier: false,         // V2
  multiAgency: false,     // V2
  franchise: false,       // V3
  n8n: false,            // V2/V3
};
```

Ces flags seront activés progressivement selon les versions.

## Roadmap

- **Q1 2024**: V1 complète + Stripe + API IA
- **Q2 2024**: V2 (Atelier, Multi-agences)
- **Q3 2024**: V3 (Franchise, Automatisations)
- **Q4 2024**: PWA + Apps mobiles natives
