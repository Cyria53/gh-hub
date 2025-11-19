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

### Hooks

**`src/hooks/usePointage.ts`**
```typescript
{
  pointages: Pointage[];           // Liste des pointages
  currentPointage: Pointage | null; // Pointage en cours (check_out = null)
  loading: boolean;                 // État de chargement
  checkIn: (isBillable, notes?) => void;     // Pointer l'arrivée
  checkOut: (notes?) => void;                // Pointer la sortie
  exportToCSV: () => void;                   // Exporter en CSV
}
```

**Fonctionnalités:**
- Realtime avec Supabase pour synchronisation instantanée
- Calcul automatique des heures travaillées lors du check-out
- Toast notifications pour feedback utilisateur
- Export CSV avec formatage français (date, heures)

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
-- Utilisateurs peuvent voir leurs pointages
CREATE POLICY "Users can view their own time records"
ON pointage FOR SELECT
USING (auth.uid() = user_id);

-- Utilisateurs peuvent insérer leurs pointages
CREATE POLICY "Users can insert their own time records"
ON pointage FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Contrôle d'accès

### Rôles autorisés
- ✅ **technicien**: Pointer leurs heures de travail
- ✅ **gerant**: Pointer et voir leurs heures
- ✅ **rh**: Pointer et voir leurs heures (futur: voir tous les employés)
- ✅ **admin_gh2**: Accès complet
- ❌ **client**: Pas d'accès au pointage
- ❌ **invite**: Pas d'accès au pointage

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

## Format d'export CSV

```csv
Date,Arrivée,Départ,Heures,Facturable,Notes
"19/11/2025","09:00:00","17:30:00","8.50","Oui","Installation kit HHO"
"18/11/2025","08:45:00","12:15:00","3.50","Non","Formation interne"
```

## Fonctionnalités futures (V2)

### Pour les RH
- [ ] Vue consolidée de tous les employés
- [ ] Filtres par date, employé, type d'heures
- [ ] Validation/approbation des pointages
- [ ] Export global multi-employés
- [ ] Statistiques par période (semaine, mois)

### Pour les managers
- [ ] Vue d'équipe par agence
- [ ] Alertes heures supplémentaires
- [ ] Comparaison heures prévues vs réelles

### Intégrations
- [ ] Synchronisation avec paie
- [ ] Export vers logiciels comptables
- [ ] API pour outils externes

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
