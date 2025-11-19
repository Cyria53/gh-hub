# Module Véhicules GH₂

## Vue d'ensemble

Le module Véhicules permet aux clients de gérer leur parc automobile avec :
- Ajout et modification des informations véhicules
- Historique complet de maintenance
- Scan OCR de carte grise (en développement)
- Suivi des coûts et entretiens
- Alertes pour les maintenances à venir

## Architecture

### Pages

1. **`src/pages/VehiclesList.tsx`**
   - Liste tous les véhicules du client
   - Cards avec informations principales
   - Actions: Voir détails, Modifier, Supprimer
   - Bouton d'ajout de véhicule
   - État vide avec CTA

2. **`src/pages/VehicleForm.tsx`**
   - Formulaire d'ajout/modification
   - Champs: marque, modèle, immatriculation, VIN, année, carburant, couleur, kilométrage
   - Validation des données
   - Bouton "Scanner carte grise"
   - Mode édition avec données pré-remplies

3. **`src/pages/VehicleDetail.tsx`**
   - Vue détaillée d'un véhicule
   - Statistiques: coût total, dernière maintenance, maintenances à venir
   - Informations complètes du véhicule
   - Historique de maintenance en tableau
   - Dialog pour ajouter une intervention
   - Actions de suppression par intervention

4. **`src/pages/CarteGriseScan.tsx`**
   - Upload de photo de carte grise
   - Aperçu de l'image
   - Conseils pour un bon scan
   - Appel à l'OCR (fonctionnalité future)
   - Redirection vers formulaire avec données extraites

### Hooks

**`src/hooks/useVehicles.ts`**
```typescript
{
  vehicles: Vehicle[];              // Liste des véhicules
  loading: boolean;                 // État de chargement
  addVehicle: (vehicle) => Promise; // Ajouter un véhicule
  updateVehicle: (id, updates) => Promise; // Modifier
  deleteVehicle: (id) => void;      // Supprimer
  refetch: () => void;              // Recharger
}
```

**`src/hooks/useVehicleMaintenance.ts`**
```typescript
{
  maintenances: VehicleMaintenance[];     // Historique
  loading: boolean;
  addMaintenance: (maintenance) => Promise;
  deleteMaintenance: (id) => void;
  refetch: () => void;
  totalCost: number;                      // Somme des coûts
  upcomingMaintenances: VehicleMaintenance[]; // Futures maintenances
}
```

## Base de données

### Table `vehicles`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| user_id | uuid | Propriétaire |
| vin | text | Numéro VIN (17 caractères) |
| license_plate | text | Immatriculation |
| brand | text | Marque |
| model | text | Modèle |
| year | integer | Année |
| first_registration_date | date | Date 1ère immatriculation |
| fuel_type | text | Type de carburant |
| color | text | Couleur |
| mileage | integer | Kilométrage |
| carte_grise_url | text | URL scan carte grise |
| created_at | timestamptz | Date de création |
| updated_at | timestamptz | Dernière modification |

### Table `vehicle_maintenance`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| vehicle_id | uuid | Référence au véhicule |
| user_id | uuid | Utilisateur |
| maintenance_type | text | Type (vidange, révision, pneus, etc.) |
| description | text | Description détaillée |
| mileage | integer | Kilométrage au moment de l'intervention |
| cost | numeric | Coût de l'intervention |
| performed_by | text | Intervenant (garage, technicien) |
| performed_at | date | Date d'exécution |
| next_maintenance_date | date | Prochaine maintenance prévue |
| documents_urls | text[] | URLs des documents/factures |
| notes | text | Notes diverses |
| created_at | timestamptz | Date de création |
| updated_at | timestamptz | Dernière modification |

### Table `carte_grise_scans`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| user_id | uuid | Utilisateur |
| vehicle_id | uuid | Véhicule associé |
| image_url | text | URL de l'image scannée |
| extracted_data | jsonb | Données extraites par OCR |
| scan_date | timestamptz | Date du scan |
| created_at | timestamptz | Date de création |

### RLS Policies

**vehicles:**
```sql
-- Utilisateurs peuvent voir leurs véhicules
CREATE POLICY "Users can view their own vehicles"
ON vehicles FOR SELECT
USING (auth.uid() = user_id);

-- Utilisateurs peuvent insérer leurs véhicules
CREATE POLICY "Users can insert their own vehicles"
ON vehicles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Utilisateurs peuvent modifier leurs véhicules
CREATE POLICY "Users can update their own vehicles"
ON vehicles FOR UPDATE
USING (auth.uid() = user_id);
```

**vehicle_maintenance:**
```sql
-- Utilisateurs peuvent voir les maintenances de leurs véhicules
CREATE POLICY "Users can view maintenance of their vehicles"
ON vehicle_maintenance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vehicles 
    WHERE vehicles.id = vehicle_maintenance.vehicle_id 
    AND vehicles.user_id = auth.uid()
  )
);

-- Utilisateurs peuvent ajouter des maintenances
CREATE POLICY "Users can insert maintenance for their vehicles"
ON vehicle_maintenance FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vehicles 
    WHERE vehicles.id = vehicle_maintenance.vehicle_id 
    AND vehicles.user_id = auth.uid()
  )
);
```

### Storage

**Bucket `vehicle-documents`:**
- Public: true
- Pour stocker: factures, photos de maintenance, cartes grises
- Structure: `{user_id}/{vehicle_id}/{document_type}/{filename}`
- RLS: Les utilisateurs ne peuvent accéder qu'à leurs propres dossiers

## Flux utilisateur

### 1. Ajouter un véhicule

**Option 1: Saisie manuelle**
1. Accès à `/vehicles`
2. Clic sur "Ajouter un véhicule"
3. Remplissage du formulaire
4. Soumission → Enregistrement en base

**Option 2: Scan carte grise**
1. Depuis le formulaire, clic sur "Scanner carte grise"
2. Upload de la photo
3. OCR extrait les données (future)
4. Redirection vers formulaire pré-rempli
5. Vérification et validation

### 2. Voir détails d'un véhicule

1. Clic sur une card véhicule
2. Affichage des informations complètes
3. Dashboard avec 3 KPIs:
   - Coût total des maintenances
   - Dernière maintenance (relative)
   - Nombre de maintenances à venir
4. Tableau historique de maintenance

### 3. Ajouter une maintenance

1. Depuis la page détail, clic "Ajouter une intervention"
2. Dialog avec formulaire:
   - Type d'intervention (dropdown)
   - Date
   - Description
   - Kilométrage
   - Coût
   - Intervenant
   - Prochaine maintenance prévue
   - Notes
3. Soumission → Ajout dans l'historique

### 4. Modifier un véhicule

1. Bouton "Modifier" depuis liste ou détail
2. Formulaire pré-rempli
3. Modification des champs
4. Sauvegarde

### 5. Supprimer un véhicule

1. Bouton "Supprimer" avec confirmation
2. AlertDialog pour confirmer
3. Suppression du véhicule ET de tout l'historique (CASCADE)

## Types de maintenance

Liste des types prédéfinis:
- **Vidange**: Changement d'huile moteur
- **Révision**: Contrôle complet périodique
- **Pneus**: Changement ou permutation
- **Freins**: Plaquettes, disques
- **Batterie**: Remplacement ou test
- **Climatisation**: Recharge, entretien
- **Contrôle technique**: Contrôle réglementaire
- **Réparation**: Intervention suite à panne
- **Autre**: Interventions diverses

## Fonctionnalités futures

### OCR Carte Grise (V2)
- [ ] Edge function pour extraction OCR
- [ ] Intégration API OCR (Google Vision, AWS Textract, ou Azure)
- [ ] Parsing des données extraites
- [ ] Mapping vers champs véhicule
- [ ] Gestion des erreurs OCR
- [ ] Amélioration de la qualité d'image avant scan

### Alertes maintenance (V2)
- [ ] Notification X jours avant maintenance prévue
- [ ] Alerte kilométrage (ex: vidange tous les 15 000 km)
- [ ] Rappel contrôle technique annuel
- [ ] Email/SMS pour rappels importants

### Export et rapports (V2)
- [ ] Export historique en PDF
- [ ] Carnet d'entretien digital
- [ ] Graphiques de coûts par période
- [ ] Statistiques par type d'intervention
- [ ] Export CSV pour comptabilité

### Intégrations (V3)
- [ ] Import depuis garages partenaires
- [ ] API pour récupération automatique factures
- [ ] Synchronisation avec assurance auto
- [ ] Partage carnet avec acheteur potentiel

## Sécurité

### RLS (Row Level Security)
- ✅ Utilisateurs ne voient que leurs véhicules
- ✅ Utilisateurs ne voient que les maintenances de leurs véhicules
- ✅ Impossible de modifier les véhicules d'autres utilisateurs
- ✅ Cascade DELETE sur les maintenances

### Storage
- ✅ Documents accessibles uniquement par propriétaire
- ✅ Structure de dossiers par user_id
- ✅ Validation du type de fichier côté client

### Validation
- ✅ Champs requis: marque, modèle
- ✅ VIN: 17 caractères alphanumériques
- ✅ Année: entre 1900 et année actuelle + 1
- ✅ Kilométrage: nombre positif
- ✅ Coût maintenance: nombre positif avec 2 décimales

## Notes techniques

### Realtime Sync
```typescript
// Écoute des changements sur vehicles
supabase
  .channel('vehicles-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'vehicles' 
  }, fetchVehicles)
  .subscribe();
```

### Calculs côté client
```typescript
// Coût total des maintenances
const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);

// Maintenances à venir
const upcomingMaintenances = maintenances.filter(
  m => m.next_maintenance_date && new Date(m.next_maintenance_date) > new Date()
);
```

### Storage paths
```
vehicle-documents/
  ├── {user_id}/
  │   ├── {vehicle_id}/
  │   │   ├── carte-grise/
  │   │   ├── factures/
  │   │   └── photos/
```
