-- Insérer des produits de démonstration dans le marketplace
INSERT INTO marketplace_items (category, name, description, price, stock_quantity, is_available) VALUES
('Kit HHO', 'Kit HHO Compact', 'Kit complet hydrogène pour améliorer les performances et réduire la consommation de carburant. Installation facile avec manuel détaillé.', 2999.00, 15, true),
('Accessoires', 'Électrolyseur Premium', 'Électrolyseur haute performance pour production HHO optimale. Garantie 3 ans.', 899.00, 25, true),
('Véhicules', 'Véhicule Hydrogène GH2', 'Véhicule neuf équipé du système hydrogène GH2 de série. Homologué route.', 35000.00, 3, true),
('Accessoires', 'Réservoir HHO 2L', 'Réservoir pour stockage hydrogène 2 litres en acier inoxydable. Haute résistance.', 299.00, 40, true),
('Kit HHO', 'Kit HHO Pro', 'Kit professionnel avec garantie 5 ans et support technique inclus. Pour véhicules jusqu''à 3.5T.', 4999.00, 8, true),
('Pièces', 'Valve de sécurité', 'Valve de sécurité certifiée pour système HHO. Norme CE.', 149.00, 50, true),
('Accessoires', 'Contrôleur PWM', 'Contrôleur de puissance pour optimiser la production d''hydrogène', 399.00, 30, true),
('Kit HHO', 'Kit HHO Starter', 'Kit d''initiation pour découvrir la technologie hydrogène. Idéal petites cylindrées.', 1499.00, 20, true)
ON CONFLICT (id) DO NOTHING;