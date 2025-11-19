# Module Pointage RH GH₂

## Vue d'ensemble

Le module Pointage RH permet aux techniciens, employés et personnel RH de gérer les heures de travail avec une interface simple de check-in/check-out. Il offre un suivi précis des heures facturables et non facturables, ainsi qu'un export CSV pour la comptabilité.

## Architecture

### Pages

1. **`src/pages/Pointage.tsx`**
   - Interface principale du module
   - Dashboard avec statistiques (total heures, heures facturables, heures non facturables)
   - Carte de pointage en cours avec timer visuel
   - Formulaire de check-in avec options (facturable/non facturable, notes)
   - Bouton de check-out avec notes optionnelles
   - Tableau d'historique des pointages
   - Bouton d'export CSV
   - Lien vers la vue admin (si autorisé)

2. **`src/pages/PointageAdmin.tsx`**
   - Vue administrative RH pour gérer tous les employés
   - Dashboard avec statistiques agrégées:
     - Nombre d'employés actifs
     - Total heures travaillées
     - Heures facturables et pourcentage
     - Heures non facturables et pourcentage
     - Moyenne heures par employé
   - Filtres avancés:
     - Par employé (dropdown avec tous les profils)
     - Par période (date début et fin)
     - Par type (facturable/non facturable/tous)
   - Tableau complet des pointages avec profils employés
   - Export CSV enrichi avec informations employé

### Hooks

**`src/hooks/usePointage.ts`**
```typescript
{
  pointages: Pointage[];           // Liste des pointages de l'utilisateur
  currentPointage: Pointage | null; // Pointage en cours (check_out = null)
  loading: boolean;                 // État de chargement
  checkIn: (isBillable, notes?) => void;     // Pointer l'arrivée
  checkOut: (notes?) => void;                // Pointer la sortie
  exportToCSV: () => void;                   // Exporter en CSV
}
```

**`src/hooks/usePointageAdmin.ts`**
```typescript
{
  pointages: PointageWithProfile[];  // Tous les pointages avec profils
  employees: Profile[];              // Liste des employés
  loading: boolean;                  // État de chargement
  filters: PointageFilters;          // Filtres actifs
  setFilters: (filters) => void;     // Modifier les filtres
  updatePointage: (id, updates) => void;  // Modifier un pointage
  calculateStats: () => PointageStats;    // Calculer les statistiques
  exportToCSV: () => void;                // Export CSV enrichi
}
```

**Fonctionnalités:**
- Realtime avec Supabase pour synchronisation instantanée
- Calcul automatique des heures travaillées lors du check-out
- Toast notifications pour feedback utilisateur
- Export CSV avec formatage français (date, heures)
- Filtrage multi-critères (employé, date, type)
- Statistiques agrégées en temps réel

## Base de données

### Table `pointage`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| user_id | uuid | Référence à l'utilisateur |
| check_in | timestamptz | Heure d'arrivée (requise) |
| check_out | timestamptz | Heure de départ (nullable) |
| hours_worked | numeric | Heures calculées automatiquement |
| is_billable | boolean | Type d'heures (facturable ou non) |
| notes | text | Notes optionnelles |
| created_at | timestamptz | Date de création |

### RLS Policies

```sql
-- Utilisateurs peuvent voir leurs propres pointages
CREATE POLICY "Users can view their own time records"
ON pointage FOR SELECT
USING (auth.uid() = user_id);

-- Utilisateurs peuvent insérer leurs pointages
CREATE POLICY "Users can insert their own time records"
ON pointage FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RH/Gérants/Admins peuvent voir tous les pointages
CREATE POLICY "RH can view all time records"
ON pointage FOR SELECT
USING (
  public.has_role(auth.uid(), 'rh') OR 
  public.has_role(auth.uid(), 'gerant') OR 
  public.has_role(auth.uid(), 'admin_gh2')
);

-- RH/Gérants/Admins peuvent modifier tous les pointages
CREATE POLICY "RH can update all time records"
ON pointage FOR UPDATE
USING (
  public.has_role(auth.uid(), 'rh') OR 
  public.has_role(auth.uid(), 'gerant') OR 
  public.has_role(auth.uid(), 'admin_gh2')
);
```

### Indexes

```sql
-- Index pour améliorer les performances des filtres
CREATE INDEX idx_pointage_check_in ON pointage(check_in DESC);
CREATE INDEX idx_pointage_user_id ON pointage(user_id);
```

## Contrôle d'accès

### Rôles autorisés

**Pour la vue utilisateur (/pointage):**
- ✅ **technicien**: Pointer leurs heures de travail
- ✅ **gerant**: Pointer et voir leurs heures
- ✅ **rh**: Pointer et voir leurs heures
- ✅ **admin_gh2**: Accès complet
- ❌ **client**: Pas d'accès au pointage
- ❌ **invite**: Pas d'accès au pointage

**Pour la vue admin (/pointage/admin):**
- ✅ **rh**: Voir et gérer tous les pointages
- ✅ **gerant**: Voir et gérer tous les pointages de leur agence
- ✅ **admin_gh2**: Accès complet à tous les pointages
- ❌ **technicien**: Pas d'accès à la vue admin
- ❌ **client**: Pas d'accès
- ❌ **invite**: Pas d'accès

## Flux utilisateur

### 1. Check-in (Arrivée)
1. L'utilisateur accède à `/pointage`
2. Si aucun pointage actif, affiche le formulaire de check-in
3. L'utilisateur peut:
   - Activer/désactiver "Heures facturables"
   - Ajouter des notes (optionnel)
4. Clic sur "Pointer l'arrivée"
5. Enregistrement avec `check_in = NOW()`

### 2. Pendant le travail
- Affichage du temps écoulé depuis le check-in
- Indicateur visuel "En cours" avec animation
- Possibilité d'ajouter des notes avant le check-out

### 3. Check-out (Départ)
1. Clic sur "Pointer la sortie"
2. Ajout optionnel de notes finales
3. Calcul automatique des heures: `(check_out - check_in) / 3600`
4. Mise à jour de l'enregistrement

### 4. Historique & Export
- Tableau avec tous les pointages
- Tri par date décroissante
- Export CSV avec colonnes:
  - Date
  - Heure d'arrivée
  - Heure de départ
  - Heures travaillées
  - Type (Facturable/Non facturable)
  - Notes

### 5. Vue Admin RH (nouveauté)
1. Accès via `/pointage/admin` ou bouton "Vue Admin" sur la page Pointage
2. Dashboard avec 5 statistiques clés
3. Filtres avancés:
   - Sélection d'employé spécifique
   - Période personnalisée (date début/fin)
   - Filtrage par type d'heures
4. Tableau enrichi avec informations employés
5. Export CSV global avec colonnes:
   - Employé (nom complet)
   - Email
   - Date
   - Heures d'arrivée/départ
   - Heures travaillées
   - Type (Facturable/Non facturable)
   - Notes

## Format d'export CSV

### Export utilisateur
```csv
Date,Arrivée,Départ,Heures,Facturable,Notes
"19/11/2025","09:00:00","17:30:00","8.50","Oui","Installation kit HHO"
"18/11/2025","08:45:00","12:15:00","3.50","Non","Formation interne"
```

### Export admin RH
```csv
Employé,Email,Date,Arrivée,Départ,Heures,Facturable,Notes
"Jean Dupont","jean.dupont@gh2.fr","19/11/2025","09:00:00","17:30:00","8.50","Oui","Installation kit HHO"
"Marie Martin","marie.martin@gh2.fr","19/11/2025","08:45:00","16:00:00","7.25","Oui","Diagnostic client"
"Pierre Durant","pierre.durant@gh2.fr","18/11/2025","08:45:00","12:15:00","3.50","Non","Formation interne"
```

## Fonctionnalités futures (V2)

### Pour les RH (✅ Implémenté)
- [x] Vue consolidée de tous les employés
- [x] Filtres par date, employé, type d'heures
- [x] Export global multi-employés
- [x] Statistiques par période
- [ ] Validation/approbation des pointages
- [ ] Alertes heures supplémentaires
- [ ] Rapports mensuels automatiques

### Pour les managers
- [ ] Vue d'équipe par agence
- [ ] Comparaison heures prévues vs réelles
- [ ] Dashboard hebdomadaire

### Intégrations
- [ ] Synchronisation avec paie
- [ ] Export vers logiciels comptables (Sage, Cegid)
- [ ] API pour outils externes
- [ ] Notifications automatiques fin de mois

## Sécurité

### RLS (Row Level Security)
- ✅ Chaque utilisateur ne voit que ses propres pointages
- ✅ Impossible de modifier le `user_id` lors de l'insertion
- ✅ Validation côté serveur via Supabase

### Validation
- ✅ Check-in impossible si pointage déjà actif
- ✅ Check-out impossible sans pointage actif
- ✅ Calcul automatique des heures (non modifiable manuellement)

### Audit
- ✅ Timestamps automatiques (`created_at`)
- ✅ Traçabilité complète via `user_id`

## Notes techniques

### Calcul des heures
```typescript
const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
// Résultat en heures décimales (ex: 8.5h)
```

### Realtime Sync
```typescript
supabase
  .channel('pointage-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'pointage' 
  }, fetchPointages)
  .subscribe();
```

### Export CSV
- Utilise `Blob` API pour génération côté client
- Encodage UTF-8 avec BOM pour Excel
- Téléchargement automatique via `createObjectURL`
