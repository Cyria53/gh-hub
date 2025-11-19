-- Créer les buckets de stockage pour les missions

-- Bucket pour les photos des missions
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-photos', 'mission-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les signatures clients
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-signatures', 'mission-signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Policies pour mission-photos: tous peuvent lire, techniciens peuvent uploader
CREATE POLICY "Photos de mission publiquement accessibles" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mission-photos');

CREATE POLICY "Techniciens peuvent uploader des photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'mission-photos' AND
  (
    public.has_role(auth.uid(), 'technicien') OR
    public.has_role(auth.uid(), 'gerant') OR
    public.has_role(auth.uid(), 'admin_gh2')
  )
);

CREATE POLICY "Techniciens peuvent supprimer leurs photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'mission-photos' AND
  (
    public.has_role(auth.uid(), 'technicien') OR
    public.has_role(auth.uid(), 'gerant') OR
    public.has_role(auth.uid(), 'admin_gh2')
  )
);

-- Policies pour mission-signatures: tous peuvent lire, techniciens peuvent uploader
CREATE POLICY "Signatures publiquement accessibles" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mission-signatures');

CREATE POLICY "Techniciens peuvent uploader des signatures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'mission-signatures' AND
  (
    public.has_role(auth.uid(), 'technicien') OR
    public.has_role(auth.uid(), 'gerant') OR
    public.has_role(auth.uid(), 'admin_gh2')
  )
);

-- Activer Realtime sur la table technicians pour le tracking GPS
ALTER TABLE public.technicians REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.technicians;

-- Activer Realtime sur la table missions pour les notifications
ALTER TABLE public.missions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;