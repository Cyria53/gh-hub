# Thème GH₂ - Design System

## Vision
Le design system GH₂ s'inspire du luxe automobile premium (Tesla, Mercedes EQ) avec une identité hydrogène unique.

## Palette de Couleurs

### Couleurs Principales
- **Bleu Hydrogène** (`--gh2-blue`): `hsl(205 100% 45%)` - Couleur signature GH₂
- **Gris Graphite** (`--gh2-graphite`): `hsl(210 10% 23%)` - Élégance technique
- **Fibre Carbone** (`--gh2-carbon`): `hsl(210 12% 16%)` - Fond premium
- **Argent Brillant** (`--gh2-silver`): `hsl(210 5% 85%)` - Accents métalliques
- **Blanc Pur** (`--gh2-white`): `hsl(0 0% 100%)` - Contraste maximum

### Couleurs par Rôle

| Rôle | Couleur | HSL | Usage |
|------|---------|-----|-------|
| Client | Bleu GH₂ | `205 100% 45%` | Badges, accents utilisateur |
| Technicien | Gris Graphite | `210 10% 23%` | Interface tech |
| Gérant | Vert Pro | `158 58% 33%` | Gestion agence |
| Admin GH₂ | Rouge Admin | `0 60% 50%` | Administration système |
| RH | Orange RH | `29 77% 54%` | Ressources humaines |
| Invité | Gris Silver | `210 5% 75%` | Mode invité |

## Gradients

```css
--gradient-carbon: linear-gradient(135deg, hsl(210 12% 16%) 0%, hsl(210 15% 11%) 100%);
--gradient-blue: linear-gradient(135deg, hsl(205 100% 45%) 0%, hsl(210 100% 35%) 100%);
--gradient-premium: linear-gradient(135deg, hsl(210 12% 16%) 0%, hsl(205 100% 45% / 0.2) 100%);
```

## Ombres

```css
--shadow-premium: 0 10px 40px -10px hsl(205 100% 45% / 0.4);
--shadow-card: 0 4px 20px hsl(210 15% 8% / 0.5);
--shadow-glow: 0 0 30px hsl(205 100% 45% / 0.3);
```

## Motif Fibre Carbone

Le pattern fibre carbone est appliqué avec la classe `.carbon-fiber`:

```css
.carbon-fiber {
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 2px, ...),
    repeating-linear-gradient(-45deg, transparent, transparent 2px, ...);
  background-size: 10px 10px;
}
```

## Animations

### Glow Pulse
```css
.animate-glow {
  animation: glow-pulse 3s ease-in-out infinite;
}
```

## Utilisation dans Tailwind

### Classes de couleurs
```tsx
// Couleurs GH₂
<div className="bg-gh2-blue text-gh2-white" />

// Couleurs par rôle
<Badge className="bg-role-client" />
<Badge className="bg-role-technicien" />

// Gradients
<div className="bg-gradient-premium" />

// Ombres
<Card className="shadow-premium" />
```

## Components Personnalisés

### RoleBadge
Affiche un badge avec la couleur du rôle:
```tsx
<RoleBadge role="client" />
```

### GH2Logo
Logo GH₂ responsive:
```tsx
<GH2Logo className="h-10" />
```

## Best Practices

1. **Toujours utiliser les variables HSL** définies dans `index.css`
2. **Ne jamais hardcoder les couleurs** (pas de `#0066cc` ou `rgb()`)
3. **Utiliser les tokens sémantiques** pour la cohérence
4. **Appliquer le motif carbone** aux backgrounds principaux
5. **Animations fluides** avec transitions de 300ms minimum
