# Schéma Base de Données GH₂

## Architecture

Base de données PostgreSQL via Supabase avec Row Level Security (RLS) activé sur toutes les tables.

## Enums

### app_role
```sql
'client' | 'technicien' | 'gerant' | 'admin_gh2' | 'rh' | 'invite'
```

### mission_status
```sql
'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
```

### diagnostic_severity
```sql
'low' | 'medium' | 'high' | 'critical'
```

### technician_status
```sql
'available' | 'busy' | 'offline'
```

### order_status
```sql
'pending' | 'processing' | 'completed' | 'cancelled'
```

### payment_status
```sql
'pending' | 'completed' | 'failed' | 'refunded'
```

## Tables Principales

### profiles
Informations utilisateur étendues
- `id` (PK, FK auth.users)
- `email`, `full_name`, `phone`, `avatar_url`
- Timestamps: `created_at`, `updated_at`

### roles
Gestion multi-rôles
- `user_id` (FK profiles)
- `role` (enum app_role)
- Contrainte: UNIQUE(user_id, role)

### agencies
Agences GH₂
- `name`, `address`, `city`, `postal_code`
- `latitude`, `longitude` (géolocalisation)
- `is_active` (activation/désactivation)

### vehicles
Parc automobile clients
- `user_id` (FK auth.users)
- `vin`, `license_plate`, `brand`, `model`, `year`
- `first_registration_date`, `fuel_type`, `color`, `mileage`
- `carte_grise_url` (stockage Supabase)

### carte_grise_scans
Scans OCR cartes grises
- `user_id`, `vehicle_id`
- `image_url`, `extracted_data` (JSONB)
- `scan_date`

### diagnostics
Diagnostics IA
- `user_id`, `vehicle_id`
- `symptom_photo_url`, `symptom_video_url`
- `ai_diagnosis`, `severity`, `recommendations`
- `estimated_cost_min`, `estimated_cost_max`
- `pdf_report_url`
- `is_guest`, `guest_email` (mode invité)

### technicians
Profils techniciens
- `user_id` (UNIQUE, FK auth.users)
- `agency_id` (FK agencies)
- `specialties` (TEXT[])
- `hourly_rate`, `certification_level`
- `status` (enum), `is_available`
- `current_latitude`, `current_longitude` (tracking GPS)
- `rating`, `total_missions`

### missions
Interventions techniques
- `client_id`, `technician_id`, `diagnostic_id`, `vehicle_id`
- `service_type`, `description`, `status`
- `scheduled_date`, `completion_date`
- `client_latitude`, `client_longitude`, `client_address`
- `estimated_duration`, `actual_duration`
- `estimated_cost`, `final_cost`
- `client_signature_url`, `technician_report`
- `photos_urls` (TEXT[])
- `rating`, `review`

### marketplace_items
Produits marketplace
- `category`, `name`, `description`, `price`
- `stripe_price_id`
- `images_urls` (TEXT[])
- `stock_quantity`, `is_available`
- `specifications` (JSONB)

### marketplace_orders
Commandes marketplace
- `user_id`, `items` (JSONB)
- `total_amount`, `status`
- `stripe_payment_intent_id`
- `shipping_address` (JSONB)
- `tracking_number`

### fidelite
Programme fidélité
- `user_id` (UNIQUE)
- `points`, `tier`, `total_spent`

### paiements
Historique paiements
- `user_id`, `mission_id`, `order_id`
- `amount`, `status`, `payment_method`
- `stripe_payment_intent_id`

### pointage
Pointage RH
- `user_id`
- `check_in`, `check_out`, `hours_worked`
- `is_billable`, `notes`

### horaires_tech
Horaires techniciens
- `technician_id`, `day_of_week`
- `start_time`, `end_time`, `is_available`

### notifications
Notifications utilisateurs
- `user_id`, `title`, `message`, `type`
- `is_read`, `link`

## Fonctions

### has_role(user_id, role)
Vérifie si un utilisateur possède un rôle spécifique
- Security Definer
- Utilisée dans les policies RLS

### handle_new_user()
Trigger sur création utilisateur
- Crée le profil
- Assigne le rôle 'client' par défaut
- Initialise le compte fidélité

### update_updated_at_column()
Trigger pour mettre à jour automatiquement `updated_at`

## Row Level Security (RLS)

### Règles Générales
- **profiles**: utilisateurs voient/modifient leur propre profil
- **roles**: utilisateurs voient leurs propres rôles
- **vehicles**: utilisateurs gèrent leurs véhicules
- **diagnostics**: utilisateurs + mode invité
- **missions**: clients voient leurs missions, techniciens voient celles assignées
- **marketplace_orders**: utilisateurs voient leurs commandes
- **pointage**: utilisateurs voient leur pointage
- **notifications**: utilisateurs voient leurs notifications

### Policies Publiques
- `agencies`: lecture publique (is_active)
- `marketplace_items`: lecture publique (is_available)
- `technicians`: lecture publique (is_available)

## Index

### Performance
```sql
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_diagnostics_user_id ON diagnostics(user_id);
CREATE INDEX idx_diagnostics_created_at ON diagnostics(created_at DESC);
CREATE INDEX idx_missions_client_id ON missions(client_id);
CREATE INDEX idx_missions_technician_id ON missions(technician_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_marketplace_category ON marketplace_items(category);
CREATE INDEX idx_orders_user_id ON marketplace_orders(user_id);
CREATE INDEX idx_pointage_user_id ON pointage(user_id);
CREATE INDEX idx_pointage_date ON pointage(check_in DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

## Migrations

Les migrations sont gérées via Supabase Migration Tool.
Toute modification du schéma doit passer par une migration SQL.
