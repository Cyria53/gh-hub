import { AppRole } from "@/types/gh2";
import { roleLabels, roleBadgeClasses } from "@/theme/roleColors";
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: AppRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${roleBadgeClasses[role]} ${className || ''}`}
    >
      {roleLabels[role]}
    </Badge>
  );
}
