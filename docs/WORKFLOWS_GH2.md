# Workflows GH₂

## Workflow Client

### 1. Diagnostic → Intervention

```mermaid
graph TD
    A[Client upload photo voyant] --> B[IA analyse symptômes]
    B --> C[Diagnostic + Estimation coût]
    C --> D{Client décision}
    D -->|Accepte| E[Sélection type intervention]
    E --> F{Intervention mobile?}
    F -->|Oui| G[Recherche technicien disponible]
    F -->|Non| H[Réservation atelier]
    G --> I[Mission créée]
    I --> J[Paiement acompte]
    J --> K[Confirmation + tracking]
```

### 2. Achat Marketplace

```mermaid
graph TD
    A[Browse marketplace] --> B[Ajout panier]
    B --> C{Stock disponible?}
    C -->|Non| D[Notification stock]
    C -->|Oui| E[Paiement Stripe]
    E --> F{Paiement OK?}
    F -->|Non| G[Erreur paiement]
    F -->|Oui| H[Commande confirmée]
    H --> I[Préparation]
    I --> J[Expédition]
    J --> K[Livraison]
    K --> L[+Points fidélité]
```

---

## Workflow Technicien

### 3. Acceptation → Intervention

```mermaid
graph TD
    A[Technicien reçoit notification] --> B{Mission disponible?}
    B -->|Déjà prise| C[Mission annulée]
    B -->|Disponible| D[Accepte mission]
    D --> E[Change statut: busy]
    E --> F[Active GPS tracking]
    F --> G[Route vers client]
    G --> H[Arrive chez client]
    H --> I[Démarre intervention]
    I --> J[Réparation + photos]
    J --> K[Rapport technique]
    K --> L[Signature client]
    L --> M[Paiement solde]
    M --> N[Clôture mission]
    N --> O[Change statut: available]
    O --> P[+Points technicien]
```

### 4. Pointage Journalier

```mermaid
graph TD
    A[Arrivée agence/domicile] --> B[Check-in mobile]
    B --> C[Missions du jour]
    C --> D[Interventions...]
    D --> E[Fin journée]
    E --> F[Check-out mobile]
    F --> G[Calcul heures]
    G --> H{Heures facturables?}
    H -->|Oui| I[Ajout heures facturation]
    H -->|Non| J[Heures administratives]
    I --> K[Export RH]
```

---

## Workflow Gérant

### 5. Gestion Planning Agence

```mermaid
graph TD
    A[Vue planning hebdomadaire] --> B[Missions en attente]
    B --> C{Technicien disponible?}
    C -->|Non| D[Recruter/Former]
    C -->|Oui| E[Assigner mission]
    E --> F[Optimiser tournée]
    F --> G[Validation devis]
    G --> H[Suivi temps réel]
    H --> I[KPI journaliers]
```

### 6. Gestion Stock (V2)

```mermaid
graph TD
    A[Stock faible détecté] --> B[Notification gérant]
    B --> C{Commander?}
    C -->|Oui| D[Commande fournisseur]
    C -->|Non| E[Transfert inter-agence]
    D --> F[Réception stock]
    F --> G[Mise à jour inventaire]
```

---

## Workflow Admin GH₂

### 7. Onboarding Nouvelle Agence

```mermaid
graph TD
    A[Demande franchise] --> B[Validation business plan]
    B --> C{Accepté?}
    C -->|Non| D[Refus]
    C -->|Oui| E[Création agence]
    E --> F[Création compte gérant]
    F --> G[Attribution permissions]
    G --> H[Configuration marketplace]
    H --> I[Formation initiale]
    I --> J[Go-live agence]
```

### 8. Monitoring Système

```mermaid
graph TD
    A[Dashboard admin] --> B[Alertes système]
    B --> C{Anomalie?}
    C -->|Oui| D[Investigation logs]
    C -->|Non| E[KPI global]
    D --> F{Critique?}
    F -->|Oui| G[Intervention urgente]
    F -->|Non| H[Ticket support]
```

---

## Workflow RH

### 9. Export Paie Mensuel

```mermaid
graph TD
    A[Début mois] --> B[Récupération pointages]
    B --> C[Calcul heures/employé]
    C --> D[Validation anomalies]
    D --> E{Corrections?}
    E -->|Oui| F[Ajustements manuels]
    E -->|Non| G[Export CSV]
    F --> G
    G --> H[Import logiciel paie]
    H --> I[Validation gérant]
```

---

## Événements Temps Réel

### Supabase Realtime

#### GPS Tracking
```typescript
// Subscribe aux positions technicien
supabase
  .channel(`mission-${missionId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'technicians',
    filter: `id=eq.${technicianId}`
  }, (payload) => {
    updateMapPosition(payload.new.latitude, payload.new.longitude);
  })
  .subscribe();
```

#### Notifications Missions
```typescript
// Notifications nouvelles missions
supabase
  .channel('new-missions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'missions',
    filter: `status=eq.pending`
  }, (payload) => {
    notifyAvailableTechnicians(payload.new);
  })
  .subscribe();
```

---

## Points de Synchronisation

### Stripe Webhooks
- `payment_intent.succeeded` → Confirmer commande
- `payment_intent.failed` → Annuler mission
- `charge.refunded` → Remboursement points fidélité

### API IA Externe
- OCR carte grise → Extract VIN, plaque
- Diagnostic photo → Gravité + coût
- Analyse vidéo (optionnel) → Détails complémentaires

### n8n Workflows (V2)
- Email confirmation mission
- SMS notification technicien
- Slack alerte admin
- Export auto comptabilité

---

## États Système

### Mission States
```
pending → accepted → in_progress → completed
         ↓
      cancelled
```

### Technician States
```
offline ⟷ available ⟷ busy
```

### Order States
```
pending → processing → completed
         ↓
      cancelled
```

### Payment States
```
pending → completed
         ↓
       failed → refunded
```
