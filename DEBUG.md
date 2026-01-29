# Guia de Debug - PACD

## 🐛 Como Debugar o Formulário

O sistema agora possui logs detalhados tanto no frontend (console do navegador) quanto no backend (terminal/logs da Vercel).

### Frontend (Console do Navegador)

Abra o DevTools do navegador (F12) e vá para a aba **Console**. Você verá:

#### Ao preencher campos:
```
📝 Campo alterado: titulo = Simulado ENEM
📝 Campo alterado: tipo = SIMULADO
📝 Campo alterado: data_inicio = 2024-01-29
```

#### Ao clicar em "Criar Atividade":
```
🚀 Formulário submetido!
📦 Dados do formulário: {titulo: "...", tipo: "...", ...}
🔍 Validando formulário: {...}
✅ Validação passou!
⏳ Enviando requisição para API...
🌐 URL: /api/criar-atividade
📤 Payload: {...}
📥 Status da resposta: 200 OK
📊 Dados da resposta: {success: true, ...}
✅ Sucesso! {...}
✔️ Requisição finalizada
```

### Backend (Logs do Python)

Se estiver rodando localmente com `vercel dev`, verá:

```
============================================================
🚀 INICIANDO PROCESSAMENTO DA REQUISIÇÃO
============================================================
📏 Content-Length: 125
📦 Body (raw): b'{"titulo":"...","tipo":"...","data_inicio":"...","comentarios":""}'
✅ Dados parseados: {
  "titulo": "...",
  "tipo": "...",
  ...
}
🔍 Validando campos obrigatórios...
  - titulo: ... ✅
  - tipo: ... ✅
  - data_inicio: ... ✅
✅ Validação passou!
💾 Inserindo atividade no Google Sheets...
📊 Função inserir_atividade iniciada
🔑 Obtendo credenciais do Google...
✅ Credenciais obtidas
🔗 Autorizando cliente gspread...
✅ Cliente autorizado
📁 Abrindo planilha 'PACD_DADOS'...
✅ Planilha aberta
📄 Abrindo aba 'atividades'...
✅ Aba aberta
🆔 ID gerado: 20240129143052
📅 Data de inclusão: 29/01/2024 14:30:52
📝 Linha a ser inserida: ['20240129143052', 'Simulado ENEM', 'SIMULADO', '2024-01-29', '', '29/01/2024 14:30:52']
💾 Inserindo linha na planilha...
✅ Linha inserida com sucesso!
✅ REQUISIÇÃO PROCESSADA COM SUCESSO!
```

## 🔍 Checklist de Debug

### 1. Verificar se o formulário está funcionando

- [ ] Abrir console do navegador (F12)
- [ ] Preencher campos do formulário
- [ ] Verificar se aparecem logs `📝 Campo alterado:`
- [ ] Se não aparecer, verificar se o JavaScript está carregando

### 2. Verificar validação

- [ ] Tentar submeter formulário vazio
- [ ] Deve aparecer `❌ Validação falhou:` no console
- [ ] Deve aparecer mensagem vermelha na tela

### 3. Verificar requisição HTTP

- [ ] Preencher formulário corretamente
- [ ] Clicar em "Criar Atividade"
- [ ] Verificar log `🚀 Formulário submetido!`
- [ ] Verificar `📥 Status da resposta:`
  - **200**: Sucesso
  - **400**: Erro de validação
  - **500**: Erro no servidor
  - **404**: Endpoint não encontrado

### 4. Verificar Backend

Se estiver rodando localmente:

```bash
vercel dev
```

Verifique os logs no terminal. Se aparecer erro:

#### Erro: "Cannot find module gspread"
```bash
cd api
pip install -r requirements.txt
```

#### Erro: "GOOGLE_PROJECT_ID not found"
```bash
# Verifique se o arquivo .env existe
cat .env

# Se não existir, copie do exemplo
cp .env.example .env
# E edite com suas credenciais
```

#### Erro: "Spreadsheet not found"
- Verifique se a planilha "PACD_DADOS" existe
- Verifique se está compartilhada com o email da Service Account
- Verifique o nome exato da planilha

#### Erro: "Worksheet not found"
- Verifique se existe uma aba chamada "atividades" (minúsculo)
- Verifique se o nome está correto

## 🚨 Erros Comuns

### Frontend não está enviando requisição

**Sintomas**: Nada aparece no console após clicar no botão

**Possíveis causas**:
1. Erro de JavaScript impedindo execução
2. Botão não está com `type="submit"`
3. Form não tem `onSubmit={handleSubmit}`

**Solução**: Verifique erros no console (tab Console do DevTools)

### Erro 404 ao chamar API

**Sintomas**: `📥 Status da resposta: 404 Not Found`

**Possíveis causas**:
1. Vercel não está rodando (`vercel dev` não foi executado)
2. Arquivo `api/criar-atividade.py` não existe ou está mal posicionado
3. Nome do arquivo está errado

**Solução**:
```bash
# Verificar se arquivo existe
ls -la api/criar-atividade.py

# Iniciar Vercel dev
vercel dev
```

### Erro 500 no backend

**Sintomas**: `📥 Status da resposta: 500`

**Possíveis causas**:
1. Erro nas credenciais do Google
2. Planilha não existe ou não está compartilhada
3. Erro no código Python

**Solução**: Verifique logs detalhados do backend (terminal)

### CORS Error

**Sintomas**: Erro no console sobre CORS/Cross-Origin

**Possíveis causas**:
1. Headers CORS não configurados no backend
2. Rodando frontend e backend em portas diferentes sem proxy

**Solução**:
- Use `vercel dev` que configura tudo automaticamente
- Ou verifique `vite.config.js` tem configuração de proxy

## 📊 Testando Manualmente

Você pode testar o endpoint diretamente:

```bash
curl -X POST http://localhost:3000/api/criar-atividade \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste via curl",
    "tipo": "SIMULADO",
    "data_inicio": "2024-01-29",
    "comentarios": "Teste manual"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "id_atividade": "20240129143052",
  "message": "Atividade criada com sucesso"
}
```

## 🆘 Ainda com Problemas?

1. Copie todos os logs do console do navegador
2. Copie todos os logs do terminal (backend)
3. Tire um screenshot da mensagem de erro
4. Verifique se todas as dependências estão instaladas:

```bash
# Frontend
npm install

# Backend (se rodando localmente)
cd api
pip install -r requirements.txt
```

5. Verifique se as variáveis de ambiente estão configuradas:

```bash
# Verificar arquivo .env
cat api/.env

# Ou na Vercel Dashboard -> Settings -> Environment Variables
```
