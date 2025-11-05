# 📝 n360 Platform - Sistema CRUD Completo

**Data**: 06/11/2025  
**Versão**: 1.0  
**Status**: ✅ Em Produção

---

## 🎯 Visão Geral

Sistema completo de **CRUD (Create, Read, Update, Delete)** para todos os módulos do n360, incluindo **upload de arquivos** integrado ao Supabase Storage.

---

## ✅ Formulários Implementados

### 1. RiskForm.jsx (434 linhas)

**Rota**: `/grc/risks/new` | `/grc/risks/edit/:id`

**Campos**:
- ✅ Título (required)
- ✅ Descrição
- ✅ Categoria (operational, financial, strategic, compliance, cyber, reputational)
- ✅ Tipo de Ativo
- ✅ **Probabilidade** (slider 1-5)
- ✅ **Impacto** (slider 1-5)
- ✅ **Risk Score** (auto-calculado: L × I)
- ✅ Tratamento (mitigate, accept, transfer, avoid)
- ✅ Plano de Mitigação (condicional)
- ✅ Status (open, mitigating, mitigated, accepted, closed)
- ✅ Data de Identificação
- ✅ Data Alvo

**Funcionalidades**:
- CREATE (POST /api/risks)
- UPDATE (PUT /api/risks/:id)
- DELETE (DELETE /api/risks/:id)
- Validação de campos obrigatórios
- Loading states
- Confirmação de exclusão

---

### 2. ControlForm.jsx (546 linhas) ⭐ COM UPLOAD

**Rota**: `/grc/controls/new` | `/grc/controls/edit/:id`

**Campos**:
- ✅ ID do Controle (ex: ISO-27001-A.5.1)
- ✅ Título
- ✅ Descrição
- ✅ Framework (ISO 27001, NIST CSF, CIS, PCI-DSS, LGPD, SOC2)
- ✅ Tipo de Controle (preventive, detective, corrective, compensating)
- ✅ Categoria
- ✅ Status (not_implemented, planned, partial, implemented, verified)
- ✅ Notas de Implementação
- ✅ Time Responsável
- ✅ **UPLOAD DE EVIDÊNCIAS** 📎
- ✅ Descrição da Evidência
- ✅ Frequência de Teste (dias)
- ✅ Último Teste (date)
- ✅ Resultado do Teste (passed, failed, partial)
- ✅ Effectiveness Score (0.00 - 1.00)

**Upload**:
- Formatos: `.pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.csv,.xlsx`
- Tamanho máximo: 10MB
- Drag & drop elegante
- Preview do arquivo
- URL armazenada no banco

---

### 3. PolicyForm.jsx (406 linhas) ⭐ COM UPLOAD

**Rota**: `/grc/policies/new` | `/grc/policies/edit/:id`

**Campos**:
- ✅ Título
- ✅ Descrição
- ✅ **Conteúdo** (Markdown editor)
- ✅ Categoria (security, privacy, compliance, operational, hr)
- ✅ Framework
- ✅ Versão (1.0, 1.1, etc)
- ✅ Status (draft, review, approved, active, archived)
- ✅ Data de Vigência
- ✅ Próxima Revisão
- ✅ **UPLOAD DE DOCUMENTO OFICIAL** 📄

**Upload**:
- Formatos: `.pdf,.doc,.docx`
- Tamanho máximo: 10MB
- Documento anexado ao conteúdo (Markdown link)

**Workflow**:
```
draft → review → approved → active → archived
```

---

### 4. TicketForm.jsx (268 linhas)

**Rota**: `/tickets/new` | `/tickets/edit/:id`

**Campos**:
- ✅ Título
- ✅ Descrição (required, textarea)
- ✅ Prioridade (low, medium, high, critical)
- ✅ Categoria (incident, request, problem, change)
- ✅ Status (open, in_progress, resolved, closed)

**Funcionalidades**:
- CREATE, UPDATE, DELETE
- Validação inline
- Layout simplificado

---

## 🎨 Componentes UI

### Input (Text Field)

```jsx
<Input
  name="title"
  value={formData.title}
  onChange={handleChange}
  placeholder="Digite o título..."
  required
/>
```

**Features**:
- Focus ring elegante (`ring-primary/20`)
- Border refinado (`border-border/50`)
- Transitions suaves (`duration-base`)
- Disabled states

---

### Textarea (Long Text)

```jsx
<Textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={4}
  placeholder="Descreva em detalhes..."
/>
```

**Features**:
- Min-height: 80px
- Resize vertical
- Same styling as Input

---

### Select (Dropdown)

```jsx
<Select
  name="category"
  value={formData.category}
  onChange={handleChange}
  required
>
  <option value="cyber">Cibernético</option>
  <option value="operational">Operacional</option>
</Select>
```

---

### Label

```jsx
<Label htmlFor="title">Título *</Label>
```

**Features**:
- `text-sm font-medium`
- Peer disabled states

---

### FileUpload ⭐ (Drag & Drop)

```jsx
<FileUpload
  label="Arquivo de Evidência"
  accept=".pdf,.png,.jpg"
  maxSize={10}
  value={evidenceFile}
  onChange={setEvidenceFile}
/>
```

**Features**:
- ✨ Drag & drop zone elegante
- ✨ Preview de arquivo selecionado
- ✨ Validação de tipo e tamanho
- ✨ Error messages inline
- ✨ Remove button
- ✨ Icon container com border

**Props**:
- `label` - Label do campo
- `accept` - MIME types (ex: `.pdf,.png`)
- `maxSize` - Tamanho máximo em MB
- `value` - File object
- `onChange` - Callback (file) => void
- `disabled` - Boolean

---

### Toast (Notifications)

```jsx
import { useToast } from '@/components/ui/toast'

const { success, error, info } = useToast()

// Usage
success('Risco criado com sucesso!')
error('Erro ao salvar controle')
info('Processando...')
```

**Features**:
- Posicionamento fixed (bottom-right)
- Auto-dismiss (3s default)
- Icons por tipo (CheckCircle, AlertCircle, Info)
- Cores por tipo (green, red, blue)
- Animation (slide-in-from-right)
- Close button (X)

---

## 📎 Sistema de Upload

### Arquitetura

```
Frontend                 Supabase Storage
────────                 ────────────────
FileUpload.jsx    →      Bucket: evidences/
  ↓                         ├── {org_id}/
uploadEvidence()            │   ├── controls/
  ↓                         │   │   └── {control_id}/
POST file                   │   │       └── file.pdf
  ↓                         │   ├── policies/
Response: { url }           │   └── tickets/
  ↓
Save URL in DB
(evidence_url field)
```

### Uso

```jsx
import { uploadEvidence } from '@/lib/supabase'

const handleUploadEvidence = async () => {
  try {
    setUploadingEvidence(true)
    
    const result = await uploadEvidence(
      evidenceFile,      // File object
      orgId,             // Organization ID
      'controls',        // Module (controls, policies, tickets)
      controlId          // Entity ID
    )
    
    // result = { url: 'https://...', path: 'org/controls/123/file.pdf' }
    
    setFormData(prev => ({
      ...prev,
      evidence_url: result.url
    }))
    
    toast.success('Evidência enviada com sucesso!')
  } catch (error) {
    toast.error('Erro ao enviar evidência')
  } finally {
    setUploadingEvidence(false)
  }
}
```

### Supabase Storage Setup

**Criar bucket** (via Supabase Dashboard ou SQL):

```sql
-- Via Dashboard: Storage → New Bucket
-- Nome: evidences
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/*, text/*, application/vnd.*
```

**RLS Policies** (já configurado em `05-storage-setup.sql`):
- ✅ Users can upload for their org
- ✅ Users can view from their org
- ✅ Users can update from their org
- ✅ Users can delete from their org

---

## 🗺️ Layout dos Formulários

### Estrutura (3 colunas)

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
  {/* Main Form - 2/3 */}
  <div className="lg:col-span-2 space-y-grid-lg">
    {/* Informações Básicas */}
    <Card>...</Card>
    
    {/* Seção Específica (Análise, Implementação, etc) */}
    <Card>...</Card>
    
    {/* Upload (se aplicável) */}
    <Card>...</Card>
  </div>
  
  {/* Sidebar - 1/3 */}
  <div className="space-y-grid-lg">
    {/* Status/Datas */}
    <Card>...</Card>
    
    {/* Actions */}
    <Card>
      <Button type="submit">Salvar</Button>
      <Button variant="outline">Cancelar</Button>
    </Card>
  </div>
</div>
```

---

## 🔄 Fluxo de Operações

### CREATE

```
1. Usuário clica "Novo Risco" (botão +)
2. Navega para /grc/risks/new
3. Preenche formulário
4. (Opcional) Faz upload de arquivo
5. Clica "Criar Risco"
6. POST /api/risks
7. Toast de sucesso
8. Navega de volta para /grc/risks
```

### UPDATE

```
1. Usuário clica em um item da lista
2. Navega para /grc/risks/edit/:id
3. Form carrega dados (GET /api/risks/:id)
4. Edita campos
5. (Opcional) Faz upload de novo arquivo
6. Clica "Atualizar Risco"
7. PUT /api/risks/:id
8. Toast de sucesso
9. Navega de volta para /grc/risks
```

### DELETE

```
1. Usuário clica "Excluir" no form de edição
2. Confirmação: "Tem certeza?"
3. Se sim: DELETE /api/risks/:id
4. Toast de sucesso
5. Navega de volta para /grc/risks
```

---

## 🔐 Validação

### HTML5 (nativo)

```jsx
<Input required />
<Input type="email" />
<Input type="number" min="1" max="5" />
<Input type="date" />
```

### FileUpload (custom)

- ✅ Tipo de arquivo (accept prop)
- ✅ Tamanho máximo (maxSize prop)
- ✅ Mensagens de erro inline

### Backend (já implementado)

- ✅ Zod schemas
- ✅ Rate limiting
- ✅ JWT auth
- ✅ RLS (multi-tenancy)

---

## 🎨 Design Patterns

### Form State

```jsx
const [formData, setFormData] = useState({
  title: '',
  description: '',
  // ... outros campos
})

const handleChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({
    ...prev,
    [name]: value
  }))
}
```

### File Upload State

```jsx
const [evidenceFile, setEvidenceFile] = useState(null)
const [uploadingEvidence, setUploadingEvidence] = useState(false)

// Upload on button click (before form submit)
const handleUploadEvidence = async () => {
  // Upload logic
}

// Or upload on form submit
const handleSubmit = async (e) => {
  if (evidenceFile && !formData.evidence_url) {
    await handleUploadEvidence()
  }
  // Save form
}
```

### Loading States

```jsx
const [loading, setLoading] = useState(false)

<Button disabled={loading}>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>
```

---

## 🚀 Deploy e Build

### Build

```bash
cd frontend
npm run build
```

**Output**:
- Bundle: 519.57 KB (gzip: 141.92 KB)
- CSS: 23.45 KB (gzip: 5.13 KB)
- Build time: ~3.5s

### Deploy

```bash
# Copiar dist/
scp -r frontend/dist/* root@148.230.77.242:/opt/stack/n360-platform/frontend/dist/

# Restart containers
ssh root@148.230.77.242 "cd /opt/stack/n360-platform && docker-compose restart"
```

---

## 📚 Exemplos de Uso

### Criar Novo Risco

1. Acesse https://n360.nsecops.com.br/grc/risks
2. Clique "Novo Risco"
3. Preencha:
   - Título: "Risco de vazamento de dados"
   - Categoria: "Cibernético"
   - Probabilidade: 4 (Provável)
   - Impacto: 5 (Catastrófico)
   - Risk Score: 20 (auto-calculado)
   - Tratamento: "Mitigar"
   - Plano: "Implementar DLP e criptografia"
4. Clique "Criar Risco"
5. Redirecionado para lista

### Criar Controle com Evidência

1. Acesse https://n360.nsecops.com.br/grc/controls
2. Clique "Novo Controle"
3. Preencha:
   - ID: "ISO-27001-A.9.1"
   - Título: "Controle de Acesso"
   - Framework: "ISO 27001"
   - Tipo: "Preventivo"
   - Status: "Implementado"
4. **Upload de Evidência**:
   - Arraste PDF ou screenshot
   - Aguarde confirmação
   - URL salva automaticamente
5. Preencha descrição da evidência
6. Clique "Criar Controle"

### Criar Política com Documento

1. Acesse https://n360.nsecops.com.br/grc/policies
2. Clique "Nova Política"
3. Preencha:
   - Título: "Política de Uso Aceitável"
   - Categoria: "Segurança"
   - Conteúdo: (Markdown)
   ```markdown
   ## Objetivo
   Esta política define...
   
   ## Escopo
   Todos os colaboradores...
   ```
4. **Upload de Documento Oficial**:
   - Arraste PDF assinado
   - Clique "Anexar Documento"
5. Status: "Ativo"
6. Clique "Criar Política"

---

## 🔍 Troubleshooting

### Upload não funciona

**Problema**: Arquivo não é enviado

**Soluções**:
1. Verificar se bucket `evidences` existe no Supabase
2. Verificar RLS policies
3. Verificar console do browser (erros de CORS/Auth)
4. Verificar tamanho do arquivo (< 10MB)

### Form não salva

**Problema**: POST/PUT retorna erro

**Soluções**:
1. Verificar campos required
2. Verificar console (validation errors)
3. Verificar backend logs
4. Verificar JWT token (Auth)

### Arquivo não aparece após upload

**Problema**: URL não salva no banco

**Soluções**:
1. Verificar se `evidence_url` foi atualizado no formData
2. Verificar se form submit inclui o campo
3. Verificar backend route (PUT /api/controls/:id)

---

## 📊 Estatísticas

### Código

| Componente | Linhas |
|------------|--------|
| RiskForm | 434 |
| ControlForm | 546 |
| PolicyForm | 406 |
| TicketForm | 268 |
| FileUpload | 250 |
| Supabase helper | 90 |
| Storage SQL | 83 |
| Toast | 100 |
| **TOTAL** | **2.177** |

### Features

- ✅ 4 formulários completos (CRUD)
- ✅ Upload de arquivos (2 formulários)
- ✅ 8 rotas novas
- ✅ 8 componentes UI
- ✅ Validação de campos
- ✅ Loading/Error states
- ✅ Toast notifications
- ✅ Drag & drop elegante

---

## 🎯 Próximas Melhorias (Opcional)

### Curto Prazo

- [ ] Autocomplete em selects (Combobox)
- [ ] Rich text editor para Policies (Tiptap/Quill)
- [ ] Múltiplos arquivos no upload
- [ ] Image preview (thumbnails)
- [ ] Field-level validation errors

### Médio Prazo

- [ ] Form autosave (draft)
- [ ] Undo/Redo
- [ ] Keyboard shortcuts
- [ ] Bulk operations
- [ ] Import/Export CSV

---

## 🏆 Conquistas

✅ **Sistema CRUD enterprise-grade**  
✅ **Upload de arquivos integrado**  
✅ **Design elegante e consistente**  
✅ **2.177 linhas de código**  
✅ **Zero erros de build**  
✅ **Deploy em produção**  

---

**Desenvolvido por**: ness.  
**Data**: 06/11/2025  
**Status**: ✅ Produção  
**URL**: https://n360.nsecops.com.br

