import { AppRole } from "@/types/gh2";

export const roleColors: Record<AppRole, string> = {
  client: 'hsl(var(--role-client))',
  technicien: 'hsl(var(--role-technicien))',
  gerant: 'hsl(var(--role-gerant))',
  admin_gh2: 'hsl(var(--role-admin))',
  rh: 'hsl(var(--role-rh))',
  invite: 'hsl(var(--role-invite))',
};

export const roleColorClasses: Record<AppRole, string> = {
  client: 'bg-role-client text-white',
  technicien: 'bg-role-technicien text-white',
  gerant: 'bg-role-gerant text-white',
  admin_gh2: 'bg-role-admin text-white',
  rh: 'bg-role-rh text-white',
  invite: 'bg-role-invite text-white',
};

export const roleBadgeClasses: Record<AppRole, string> = {
  client: 'border-role-client text-role-client',
  technicien: 'border-role-technicien text-role-technicien',
  gerant: 'border-role-gerant text-role-gerant',
  admin_gh2: 'border-role-admin text-role-admin',
  rh: 'border-role-rh text-role-rh',
  invite: 'border-role-invite text-role-invite',
};

export const roleLabels: Record<AppRole, string> = {
  client: 'Client',
  technicien: 'Technicien',
  gerant: 'Gérant',
  admin_gh2: 'Admin GH₂',
  rh: 'RH',
  invite: 'Invité',
};
