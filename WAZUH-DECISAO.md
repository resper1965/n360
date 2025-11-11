# 🔒 Decisão: Preservar Configuração Original do Wazuh

**Data**: 05/11/2025  
**Decisão**: Reverter mudanças no Wazuh e manter configuração original  
**Motivo**: Seguir princípio de Arquitetura Isolada

---

## ⚠️ O Que Aconteceu

### Tentativa de Mudança
- Tentei trocar senha do user `admin` para `Nessnet@10`
- Editei `internal_users.yml` com novo hash
- Resultado: **Quebrou a autenticação** (Authentication failed)

### Causa do Problema
- OpenSearch Security precisa aplicar mudanças via `securityadmin.sh`
- Apenas editar arquivo de configuração não é suficiente
- Certificados SSL necessários para aplicar
- Processo complexo e arriscado

---

## 🏛️ Princípio: Arquitetura Isolada

Conforme documentado em `ARQUITETURA-ISOLADA.md`:

### ✅ PODE (n360-platform)
- Modificar código do n360
- Ajustar docker-compose do n360
- Integrar via API

### ❌ NÃO PODE (Wazuh/Zabbix/Shuffle)
- ❌ Modificar configurações internas
- ❌ Alterar senhas de sistema
- ❌ Mexer em security configs
- ❌ Aplicar patches complexos

**Regra de Ouro**: **Se funciona, não mexa!**

---

## ✅ Decisão: Reverter e Aceitar

### O Que Foi Revertido
1. ✅ `internal_users.yml` → Hash original
2. ✅ `wazuh.yml` → Senha original
3. ✅ Wazuh stack reiniciado

### Credenciais Originais do Wazuh
```yaml
# Wazuh Indexer (admin user)
username: admin
password: SecretPassword  # Original do Wazuh

# Wazuh API (wazuh-wui user)  
username: wazuh-wui
password: MyS3cr37P450r.*-  # Original do Wazuh
```

**Nota**: Essas senhas são **internas do Wazuh** e não precisam seguir padrão ness.

---

## 🎯 Estratégia para n360

### Como n360 Acessa Wazuh

O n360 **não precisa** das credenciais de admin. Duas opções:

#### Opção 1: Usar wazuh-wui (Recomendado)
```env
# n360 .env
WAZUH_USERNAME=wazuh-wui
WAZUH_PASSWORD=MyS3cr37P450r.*-
```

**Prós**:
- Já existe e funciona
- Permissões adequadas para API
- Não mexe em nada

**Contras**:
- Senha não segue padrão ness.
- Mas não importa (é interna)

#### Opção 2: Criar novo usuário API (Futuro)
```bash
# Criar user específico para n360
wazuh-manager> /var/ossec/bin/api-add-user n360-api
```

**Prós**:
- Isolamento (audit trail)
- Senha customizada
- Permissões específicas

**Contras**:
- Mais trabalho
- Ainda mexe no Wazuh

---

## 📋 Ação Imediata

### n360 Backend - Usar Credenciais Originais

```env
# /opt/stack/n360-platform/.env
WAZUH_API_URL=https://wazuh-manager:55000
WAZUH_USERNAME=wazuh-wui
WAZUH_PASSWORD=MyS3cr37P450r.*-
```

**Motivo**: Aceitar que Wazuh tem suas próprias senhas e isso é OK.

---

## ✅ Lições Aprendidas

### 1. Respeitar Limites
- Wazuh/Zabbix/Shuffle são **aplicações estabelecidas**
- Não somos donos da configuração delas
- Mudanças devem ser **mínimas e via API**

### 2. Priorizar Funcionalidade
- Wazuh **funciona** com senhas originais
- Tentar "padronizar" causou downtime
- Melhor: **deixar como está** e integrar

### 3. Documentar Exceções
- OK ter senhas diferentes em apps base
- Documentar credenciais em local seguro
- n360 usa suas próprias senhas (Supabase, etc.)

---

## 🚀 Próximos Passos

### Imediato
- [x] Reverter mudanças no Wazuh
- [ ] Atualizar .env do n360 com senha original
- [ ] Testar integração com credenciais corretas
- [ ] Documentar credenciais em vault/secrets

### Futuro (Opcional)
- [ ] Criar user dedicado `n360-api` no Wazuh
- [ ] Documentar processo de criação
- [ ] Usar em produção

### Sprint 2
- [ ] Continuar Error Handling + Tests
- [ ] Não se distrair com senhas
- [ ] Focar no que agrega valor

---

## 📊 Status Final

| Item | Status | Ação |
|------|--------|------|
| Wazuh Stack | ✅ Estável | Configuração original mantida |
| Credenciais | ✅ OK | Aceitar senhas originais |
| n360 Integration | ⏳ Pendente | Usar wazuh-wui / MyS3cr37P450r.*- |
| Lição | ✅ Aprendida | Não mexer em apps base |

---

**Conclusão**: **Aceitar** que Wazuh tem senhas próprias. Foco no **n360**, não em padronizar tudo.

**Próximo**: Atualizar n360 com credenciais corretas e continuar desenvolvimento. 🚀



