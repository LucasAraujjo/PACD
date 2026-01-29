# 🚀 Deploy na Vercel - PACD

## 📋 Pré-requisitos

1. Conta na Vercel (gratuita): https://vercel.com/signup
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Credenciais do Google Service Account configuradas

## 🔧 Configuração do Google Service Account

### 1. Criar Service Account no Google Cloud

1. Acesse https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs:
   - Google Sheets API
   - Google Drive API
4. Vá em **IAM & Admin** → **Service Accounts**
5. Clique em **Create Service Account**
6. Dê um nome (ex: "pacd-service-account")
7. Clique em **Create and Continue**
8. Em **Keys**, clique em **Add Key** → **Create New Key**
9. Escolha **JSON** e faça download

### 2. Compartilhar Planilha

1. Abra o arquivo JSON baixado
2. Copie o valor de `client_email` (ex: `pacd@project-123.iam.gserviceaccount.com`)
3. Abra sua planilha "PACD_DADOS" no Google Sheets
4. Clique em **Compartilhar**
5. Cole o email da Service Account
6. Dê permissão de **Editor**
7. Clique em **Enviar**

### 3. Criar Abas na Planilha

Certifique-se de que sua planilha tenha as seguintes abas:

- **atividades** (minúsculo)
- **simulados** (minúsculo)
- **questoes** (minúsculo)

## 🌐 Deploy via Dashboard da Vercel

### 1. Conectar Repositório

1. Acesse https://vercel.com/dashboard
2. Clique em **Add New** → **Project**
3. Selecione seu repositório Git
4. Clique em **Import**

### 2. Configurar Projeto

**Framework Preset**: Vite

**Build Command**: `npm run build` (já detectado automaticamente)

**Output Directory**: `dist` (já detectado automaticamente)

**Install Command**: `npm install` (já detectado automaticamente)

### 3. Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

| Nome | Valor |
|------|-------|
| `GOOGLE_TYPE` | `service_account` |
| `GOOGLE_PROJECT_ID` | Copie do JSON |
| `GOOGLE_PRIVATE_KEY_ID` | Copie do JSON |
| `GOOGLE_PRIVATE_KEY` | Copie do JSON (mantenha `\n`) |
| `GOOGLE_CLIENT_EMAIL` | Copie do JSON |
| `GOOGLE_CLIENT_ID` | Copie do JSON |

**IMPORTANTE**:
- Adicione as variáveis para **Production**, **Preview** e **Development**
- O campo `GOOGLE_PRIVATE_KEY` deve manter as quebras de linha como `\n`

### 4. Deploy

1. Clique em **Deploy**
2. Aguarde o build (2-3 minutos)
3. Acesse a URL gerada (ex: `pacd.vercel.app`)

## 🖥️ Deploy via CLI

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Configurar Variáveis de Ambiente

```bash
vercel env add GOOGLE_TYPE
vercel env add GOOGLE_PROJECT_ID
vercel env add GOOGLE_PRIVATE_KEY_ID
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_CLIENT_EMAIL
vercel env add GOOGLE_CLIENT_ID
```

Cole os valores do JSON para cada variável.

### 4. Deploy

```bash
# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

## 🔍 Verificar Deploy

### 1. Testar Frontend

Acesse a URL do deploy e verifique:
- ✅ Página de login carrega
- ✅ Login com `anaclara` / `anaclara` funciona
- ✅ Página Nova Atividade aparece
- ✅ Menu lateral funciona

### 2. Testar Backend

1. Abra o DevTools do navegador (F12)
2. Vá para a aba **Console**
3. Preencha o formulário
4. Clique em "Criar Atividade"
5. Verifique os logs

**Sucesso**:
```
✅ Validação passou!
📥 Status da resposta: 200 OK
✅ Sucesso! {id_atividade: "..."}
```

**Erro**:
```
📥 Status da resposta: 500 Internal Server Error
❌ Erro na resposta: {...}
```

### 3. Ver Logs da Vercel

No Dashboard da Vercel:
1. Vá em **Deployments**
2. Clique no deploy
3. Vá em **Functions**
4. Clique em `/api/criar_atividade`
5. Veja os logs

Ou via CLI:
```bash
vercel logs
```

## 🐛 Troubleshooting

### Erro: "Function Runtimes must have a valid version"

**Solução**: O arquivo `vercel.json` foi corrigido. Certifique-se de que está assim:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Erro 500 ao criar atividade

**Causas comuns**:
1. Variáveis de ambiente não configuradas
2. Planilha não existe
3. Planilha não está compartilhada com Service Account
4. Aba "atividades" não existe

**Diagnóstico**:
- Veja logs no Dashboard da Vercel → Functions → `/api/criar_atividade`
- Procure por mensagens como:
  - `KeyError: 'GOOGLE_PROJECT_ID'` → Variável faltando
  - `SpreadsheetNotFound` → Planilha não encontrada
  - `WorksheetNotFound` → Aba "atividades" não existe

### Build falha

**Solução**:
1. Verifique se `package.json` está correto
2. Verifique se `vercel.json` está correto
3. Limpe cache: Settings → Advanced → Clear Cache

### CORS Error em produção

Não deve acontecer, mas se ocorrer:
- Verifique se as rotas estão corretas no `vercel.json`
- Verifique se a função Python tem headers CORS

## 📊 Estrutura de Arquivos para Vercel

```
pacd/
├── api/
│   ├── criar_atividade.py     ← Função serverless (underscore!)
│   └── requirements.txt         ← Dependências Python
├── src/                         ← Frontend React
├── public/                      ← Assets estáticos
├── index.html                   ← HTML base
├── package.json                 ← Deps Node
├── vite.config.js              ← Config Vite
├── vercel.json                  ← Config Vercel
└── .python-version              ← Versão Python (3.9)
```

**IMPORTANTE**:
- O arquivo deve se chamar `criar_atividade.py` (underscore, não hífen)
- A Vercel detecta automaticamente arquivos `.py` na pasta `api/`
- As dependências em `requirements.txt` são instaladas automaticamente

## 🔄 Atualizações Automáticas

Após o primeiro deploy, toda vez que você fizer push no Git:
- ✅ Vercel detecta automaticamente
- ✅ Faz build
- ✅ Deploy automático

Branches diferentes criam preview deployments.

## 🎯 URLs

- **Produção**: `https://seu-projeto.vercel.app`
- **Preview**: `https://seu-projeto-branch.vercel.app`

## 📝 Checklist Final

Antes de fazer deploy, verifique:

- [ ] Repositório Git criado e código commitado
- [ ] Google Service Account criado
- [ ] Planilha "PACD_DADOS" criada
- [ ] Planilha compartilhada com Service Account
- [ ] Abas "atividades", "simulados", "questoes" criadas
- [ ] Arquivo `vercel.json` correto
- [ ] Arquivo `api/criar_atividade.py` existe (underscore!)
- [ ] Arquivo `api/requirements.txt` correto
- [ ] Variáveis de ambiente configuradas na Vercel

## 🆘 Suporte

Se ainda tiver problemas:

1. Veja logs no Dashboard da Vercel
2. Verifique console do navegador (F12)
3. Consulte [DEBUG.md](DEBUG.md)
4. Abra issue no repositório
