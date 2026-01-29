# 🚀 Como Rodar o PACD

## ⚠️ IMPORTANTE: Use Vercel Dev

O PACD usa **Vercel Serverless Functions** para o backend Python. Você **não deve** tentar rodar o Python diretamente.

A Vercel cuida de tudo automaticamente:
- Instala as dependências Python
- Configura o runtime Python
- Integra frontend e backend
- Gerencia variáveis de ambiente

## 📋 Pré-requisitos

1. **Node.js** (v18 ou superior)
2. **npm** ou **yarn**
3. **Vercel CLI** (será instalado automaticamente)

**NÃO é necessário**:
- ❌ Python instalado localmente
- ❌ pip ou venv
- ❌ Instalar dependências Python manualmente

## 🔧 Configuração Inicial

### 1. Instalar dependências do Node

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (já existe `api/.env`):

```bash
# Copiar exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env
```

**Ou** adicione as variáveis de ambiente direto no Vercel CLI durante o primeiro `vercel dev`.

### 3. Instalar Vercel CLI (se necessário)

```bash
npm install -g vercel
```

## 🏃 Rodando o Projeto

### Opção 1: Vercel Dev (RECOMENDADO)

```bash
vercel dev
```

Este comando:
- ✅ Inicia o frontend (Vite)
- ✅ Inicia as serverless functions (Python)
- ✅ Configura proxy automático
- ✅ Instala dependências Python automaticamente
- ✅ Simula ambiente de produção

**Acesse**: http://localhost:3000

### Opção 2: Apenas Frontend (SEM backend)

Se quiser apenas ver o frontend sem funcionalidade de API:

```bash
npm run dev
```

**Limitação**: A criação de atividades NÃO funcionará (erro 404 na API).

## 🔑 Login

- **Usuário**: `anaclara`
- **Senha**: `anaclara`

## 🐛 Troubleshooting

### Erro 500 ao criar atividade

**Causa**: Problema no backend Python (credenciais, Google Sheets, etc.)

**Diagnóstico**:
1. Abra console do navegador (F12)
2. Veja logs detalhados
3. Verifique terminal onde o `vercel dev` está rodando

**Soluções**:
- Verifique se as variáveis de ambiente estão configuradas
- Verifique se a planilha "PACD_DADOS" existe no Google Sheets
- Verifique se a planilha está compartilhada com o email da Service Account
- Verifique se existe uma aba chamada "atividades" (minúsculo)

### Erro 404 ao criar atividade

**Causa**: Backend não está rodando

**Solução**: Use `vercel dev` em vez de `npm run dev`

### "Command not found: vercel"

**Solução**:
```bash
npm install -g vercel
```

### Vercel pede login

**Primeira vez**:
```bash
vercel login
```

Siga as instruções para autenticar.

### Port already in use

**Solução**: Mude a porta:
```bash
vercel dev --listen 3001
```

## 📊 Estrutura de Logs

Quando você roda `vercel dev`, verá logs assim:

### Terminal (Backend Python)
```
🚀 INICIANDO PROCESSAMENTO DA REQUISIÇÃO
✅ Dados parseados: {...}
✅ Validação passou!
💾 Inserindo atividade no Google Sheets...
✅ Linha inserida com sucesso!
```

### Console do Navegador (Frontend React)
```
🚀 Formulário submetido!
🔍 Validando formulário: {...}
✅ Validação passou!
📥 Status da resposta: 200 OK
✅ Sucesso!
```

## 🚀 Deploy em Produção

```bash
# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

## 📝 Comandos Úteis

```bash
# Ver logs do Vercel
vercel logs

# Limpar cache do Vercel
vercel dev --yes

# Build local (teste)
npm run build

# Preview do build
npm run preview
```

## 🆘 Ainda com Problemas?

1. **Limpe tudo e comece do zero**:
```bash
rm -rf node_modules .vercel
npm install
vercel dev
```

2. **Verifique versões**:
```bash
node --version  # deve ser v18+
npm --version   # deve ser v9+
vercel --version
```

3. **Veja logs completos**:
- Console do navegador (F12)
- Terminal onde `vercel dev` está rodando
- Verifique arquivo [DEBUG.md](DEBUG.md)

## 💡 Dicas

- **Sempre use `vercel dev`** para desenvolvimento
- **Abra o console do navegador** para ver logs detalhados
- **Não tente rodar Python manualmente** - deixe a Vercel cuidar disso
- **Use `Ctrl+C`** para parar o `vercel dev`
- **Reinicie `vercel dev`** após mudar `.env`
