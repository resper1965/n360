# Context7 Integration

Este diretório contém a configuração e cache do Context7 MCP (Model Context Protocol).

## 📋 O que é Context7?

Context7 é um framework que fornece contexto especializado sobre bibliotecas, APIs e frameworks através do protocolo MCP. Ele melhora a qualidade das respostas do AI ao fornecer documentação específica e atualizada.

## 🔧 Configuração

### MCP Server

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "ctx7sk-e4b06483-8079-41c3-b595-da940326a1b3"
      }
    }
  }
}
```

**API Key**: Configurada em `mcp-config.json`

## 📚 Quando Usar Context7

O assistente AI deve usar Context7 para:

### ✅ Use Cases Principais

1. **Soluções de código**
   - Exemplos práticos de implementação
   - Padrões de design recomendados
   - Melhores práticas da biblioteca

2. **Setup e Configuração**
   - Passos de instalação e configuração
   - Variáveis de ambiente necessárias
   - Configurações Docker/Docker Compose

3. **Documentação de API**
   - Referência de métodos e propriedades
   - Parâmetros e tipos
   - Exemplos de uso

4. **Diagnóstico de Erros**
   - Análise de stack traces
   - Erros comuns e soluções
   - Troubleshooting guiado

5. **Migrações e Upgrades**
   - Breaking changes entre versões
   - Guias de migração
   - Deprecations e alternativas

### ❌ Quando NÃO Usar

- Perguntas gerais sobre programação
- Conceitos básicos de linguagens
- Lógica de negócio específica do projeto
- Code review genérico

## 📖 Library Cache

O arquivo `library.md` mantém cache dos Library IDs para evitar buscas repetidas:

```markdown
express@^4.18.2: lib_abc123
zod@^3.22.4: lib_def456
```

### Workflow

```
┌─────────────────────────────────────────┐
│ AI precisa de ajuda com biblioteca      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 1. Verificar library.md                 │
│    Biblioteca já tem ID?                │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
       Sim               Não
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────────────┐
│ Usar ID      │  │ Buscar no Context7   │
│ existente    │  │ Salvar ID em cache   │
└──────────────┘  └──────────────────────┘
```

## 🎯 Range de Output

- **Mínimo**: 2k tokens
- **Máximo**: 10k tokens
- **Critério**: Baseado na complexidade da questão

## 📊 Bibliotecas no Projeto n360

### Backend (Node.js/Express)

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| express | ^4.18.2 | Web framework |
| @supabase/supabase-js | ^2.39.0 | Database + Auth |
| axios | ^1.6.0 | HTTP client |
| zod | ^3.22.4 | Schema validation |
| winston | ^3.11.0 | Logging |
| express-rate-limit | ^7.1.5 | Rate limiting |
| node-cron | ^3.0.3 | Cron jobs |

### Frontend (React/Vite)

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| react | ^18.2.0 | UI framework |
| react-router-dom | ^6.20.0 | Routing |
| tailwindcss | ^3.4.0 | CSS framework |
| vite | ^5.0.0 | Build tool |
| shadcn/ui | latest | UI components |

### Infraestrutura

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Docker | latest | Containerização |
| Traefik | v3.1 | Reverse proxy |
| Wazuh | 4.9.0 LTS | SIEM |
| Zabbix | 6.4 LTS | Monitoramento |
| Shuffle | latest | SOAR |

## 🔐 Segurança

⚠️ **IMPORTANTE**: 
- A API Key do Context7 é **sensível**
- Não commitar em repositórios públicos
- Rotacionar periodicamente
- Usar variáveis de ambiente em produção

### .gitignore

```
.context7/mcp-config.json
.context7/*.key
.context7/secrets/
```

## 📝 Exemplos de Uso

### Exemplo 1: Documentação Supabase

```
Pergunta: "Como implementar RLS policies no Supabase para multi-tenancy?"
Context7: Fornece docs oficiais + exemplos práticos + edge cases
```

### Exemplo 2: Zod Validation

```
Pergunta: "Como validar UUID com transform para string?"
Context7: Schema específico + error handling + type inference
```

### Exemplo 3: Winston Logging

```
Pergunta: "Como configurar transports com rotation?"
Context7: Config completa + formatters + best practices
```

## 🔄 Manutenção

### Atualizar Library Cache

1. Remover IDs obsoletos quando biblioteca for removida
2. Atualizar versões quando fazer upgrade
3. Adicionar novas bibliotecas quando instaladas

### Verificar Conectividade

```bash
# Testar MCP server (se disponível CLI)
curl https://mcp.context7.com/mcp/health \
  -H "CONTEXT7_API_KEY: ctx7sk-e4b06483-8079-41c3-b595-da940326a1b3"
```

## 📚 Recursos

- **Context7 Docs**: https://docs.context7.com
- **MCP Protocol**: https://modelcontextprotocol.io
- **GitHub**: https://github.com/context7

---

**Projeto**: n360 Platform  
**Empresa**: ness.  
**Última atualização**: 05/11/2025


