# Rôles et Permissions GH₂

## Système Multi-Rôles

Un utilisateur peut avoir **plusieurs rôles simultanément**.

### Hiérarchie de Priorité

Lorsqu'un utilisateur a plusieurs rôles, la priorité d'affichage est:
1. `admin_gh2` - Administration système
2. `gerant` - Gestion agence
3. `technicien` - Interventions
4. `rh` - Ressources humaines
5. `client` - Utilisation standard
6. `invite` - Mode invité limité

## Rôles Détaillés

### 👤 Client
**Couleur**: Bleu GH₂ (`hsl(205 100% 45%)`)

**Permissions**:
- ✅ Créer diagnostics
- ✅ Voir ses véhicules
- ✅ Créer missions
- ✅ Voir ses missions
- ✅ Acheter sur marketplace
- ✅ Voir ses commandes
- ✅ Consulter points fidélité
- ❌ Accès admin
- ❌ Gestion techniciens

**Routes Accessibles**:
- `/dashboard`
- `/dashboard/vehicles`
- `/dashboard/diagnostic`
- `/dashboard/missions`
- `/dashboard/history`
- `/dashboard/loyalty`
- `/marketplace`

---

### 🔧 Technicien
**Couleur**: Gris Graphite (`hsl(210 10% 23%)`)

**Permissions**:
- ✅ Voir missions disponibles
- ✅ Accepter missions
- ✅ Voir missions assignées
- ✅ Mettre à jour localisation GPS
- ✅ Compléter rapports intervention
- ✅ Upload photos intervention
- ✅ Pointer heures (si RH aussi)
- ❌ Voir missions autres techniciens
- ❌ Modifier tarifs

**Routes Accessibles**:
- `/tech/missions`
- `/tech/scan`
- `/tech/report`
- Toutes les routes Client

**Fonctionnalités Spéciales**:
- Tracking GPS en temps réel
- Notifications missions disponibles
- Mode offline PWA

---

### 🏢 Gérant
**Couleur**: Vert Pro (`hsl(158 58% 33%)`)

**Permissions**:
- ✅ Voir toutes missions de l'agence
- ✅ Gérer techniciens de l'agence
- ✅ Voir planning agence
- ✅ Valider devis (V2)
- ✅ Gérer stock agence (V2)
- ✅ KPI agence
- ✅ Exporter rapports
- ❌ Créer/supprimer agences
- ❌ Accès données autres agences

**Routes Accessibles**:
- `/manager/dashboard`
- `/manager/technicians`
- `/manager/stock` (V2)
- `/manager/planning`
- Toutes les routes Client

---

### 🔐 Admin GH₂
**Couleur**: Rouge Admin (`hsl(0 60% 50%)`)

**Permissions**:
- ✅ Accès complet système
- ✅ Gérer tous utilisateurs
- ✅ Gérer toutes agences
- ✅ Voir tous diagnostics
- ✅ Voir toutes missions
- ✅ Configurer marketplace
- ✅ Accès logs système
- ✅ Gérer roles utilisateurs
- ✅ Configurer intégrations
- ✅ Accès base de données (via Supabase)

**Routes Accessibles**:
- `/admin/users`
- `/admin/agencies`
- `/admin/marketplace`
- `/admin/logs`
- `/admin/settings`
- Toutes les routes autres rôles

**Sécurité**:
- Authentification renforcée
- Audit log de toutes actions
- IP whitelisting (optionnel)

---

### 👔 RH
**Couleur**: Orange RH (`hsl(29 77% 54%)`)

**Permissions**:
- ✅ Voir pointages tous employés
- ✅ Exporter données paie
- ✅ Gérer horaires
- ✅ Valider heures supplémentaires
- ✅ Accès rapports RH
- ❌ Modifier missions
- ❌ Accès client data

**Routes Accessibles**:
- `/rh/pointage`
- `/rh/employees`
- `/rh/export`
- `/rh/reports`

---

### 👻 Invité
**Couleur**: Gris Silver (`hsl(210 5% 75%)`)

**Permissions**:
- ✅ Créer diagnostic (limité)
- ✅ Recevoir résultat par email
- ❌ Créer missions
- ❌ Accès historique
- ❌ Programme fidélité
- ❌ Marketplace

**Routes Accessibles**:
- `/guest/diagnostic`
- `/guest/ocr`

**Limitations**:
- 3 diagnostics max par email/24h
- Pas de sauvegarde historique
- Redirection vers inscription pour missions

---

## Gestion des Rôles

### Attribution Automatique

À la création d'un compte:
```sql
INSERT INTO public.roles (user_id, role)
VALUES (NEW.id, 'client');
```

### Attribution Manuelle

Par un admin GH₂:
```sql
INSERT INTO public.roles (user_id, role)
VALUES ('user-uuid', 'technicien');
```

### Vérification Rôle

Via fonction securisée:
```sql
SELECT public.has_role(auth.uid(), 'admin_gh2');
```

### Hook Frontend

```typescript
const { roles, primaryRole, hasRole, hasAnyRole } = useUserRole();

// Vérifier rôle unique
if (hasRole('admin_gh2')) { ... }

// Vérifier plusieurs rôles
if (hasAnyRole('gerant', 'admin_gh2')) { ... }

// Rôle principal (affichage)
<RoleBadge role={primaryRole} />
```

## Protection Routes

### Protected Route (authentifié)
```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Role-Based Route (rôle spécifique)
```typescript
<RoleRoute allowedRoles={['admin_gh2', 'gerant']}>
  <AdminPanel />
</RoleRoute>
```

## Row Level Security (RLS)

Les policies RLS utilisent `has_role()`:

```sql
-- Exemple: Admin peut tout voir
CREATE POLICY "Admins can view all data"
ON public.missions FOR SELECT
USING (public.has_role(auth.uid(), 'admin_gh2'));

-- Exemple: Client voit ses données
CREATE POLICY "Clients can view own data"
ON public.missions FOR SELECT
USING (auth.uid() = client_id);
```

## Audit Trail

Toutes actions sensibles sont loggées:
- Changement de rôle
- Accès données admin
- Modification configuration
- Suppression données

Table: `logs_systeme` (à créer en V2)
