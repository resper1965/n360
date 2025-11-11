-- ============================================
-- n360 Platform - Supabase Storage Setup
-- Buckets para upload de arquivos
-- ============================================

-- ============================================
-- BUCKET: evidences
-- Para evidências de controles, políticas, etc
-- ============================================

-- Criar bucket (executar via Supabase Dashboard ou API)
-- insert into storage.buckets (id, name, public)
-- values ('evidences', 'evidences', false);

-- ============================================
-- POLICIES para o bucket evidences
-- ============================================

-- Permitir upload para usuários autenticados (RLS)
create policy "Users can upload evidences for their org"
on storage.objects for insert
with check (
  bucket_id = 'evidences' 
  and auth.uid() is not null
  and (storage.foldername(name))[1] = current_setting('app.current_org_id', true)
);

-- Permitir visualização de evidências da própria org
create policy "Users can view evidences from their org"
on storage.objects for select
using (
  bucket_id = 'evidences'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = current_setting('app.current_org_id', true)
);

-- Permitir atualização de evidências da própria org
create policy "Users can update evidences from their org"
on storage.objects for update
using (
  bucket_id = 'evidences'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = current_setting('app.current_org_id', true)
);

-- Permitir exclusão de evidências da própria org
create policy "Users can delete evidences from their org"
on storage.objects for delete
using (
  bucket_id = 'evidences'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = current_setting('app.current_org_id', true)
);

-- ============================================
-- ESTRUTURA DE PASTAS
-- ============================================
-- evidences/
-- ├── {org_id}/
-- │   ├── controls/
-- │   │   └── {control_id}/
-- │   │       ├── evidence1.pdf
-- │   │       └── screenshot.png
-- │   ├── policies/
-- │   │   └── {policy_id}/
-- │   │       └── document.pdf
-- │   └── tickets/
-- │       └── {ticket_id}/
-- │           └── attachment.txt
-- ============================================

-- ============================================
-- CONFIGURAÇÕES DO BUCKET
-- ============================================
-- Max file size: 10MB (configurar via Dashboard)
-- Allowed MIME types: 
--   - application/pdf
--   - image/png, image/jpeg, image/gif
--   - text/plain, text/csv
--   - application/vnd.ms-excel
--   - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
-- ============================================



